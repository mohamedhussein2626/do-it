import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  const sessionData = await getSession();
  if (!sessionData) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    // Don't expand subscription - we only need the ID string
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    // Check if the session belongs to the current user
    const userId = stripeSession.metadata?.userId;
    if (userId !== sessionData.user.id) {
      return NextResponse.json(
        { success: false, message: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    // Only process if payment was successful
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    const planId = stripeSession.metadata?.planId;
    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Plan ID not found in session" },
        { status: 400 }
      );
    }

    // Get the plan from database
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(planId) },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Get subscription ID (will be a string when not expanded)
    const subscriptionId = stripeSession.subscription as string | null;
    
    const priceId =
      stripeSession.line_items?.data?.[0]?.price?.id || "";

    // Update user's subscription in database
    const userUpdate = prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId,
        planId: parseInt(planId),
        planName: plan.name,
        subscriptionStatus: subscriptionId ? "active" : "free",
      },
    });

    // Create or update subscription record if subscriptionId exists
    const subscriptionUpsert = subscriptionId
      ? prisma.subscription.upsert({
          where: { stripeSubId: subscriptionId },
          create: {
            stripeSubId: subscriptionId,
            userId,
            planId: parseInt(planId),
            status: "active",
            interval: "monthly",
            startDate: new Date(),
            endDate: null,
          },
          update: { status: "active", endDate: null },
        })
      : undefined;

    // Check if payment record already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        stripe_payment_id: stripeSession.payment_intent as string,
      },
    });

    const paymentCreate = existingPayment
      ? undefined
      : prisma.payment.create({
          data: {
            amount: new Prisma.Decimal(
              (stripeSession.amount_total || 0) / 100
            ),
            status: stripeSession.payment_status ?? "paid",
            stripe_payment_id: stripeSession.payment_intent as string,
            price_id: priceId,
            user_email: stripeSession.customer_email || sessionData.user.email,
            userId,
          },
        });

    // Execute transaction
    const tx = [
      userUpdate,
      ...(subscriptionUpsert ? [subscriptionUpsert] : []),
      ...(paymentCreate ? [paymentCreate] : []),
    ];

    await prisma.$transaction(tx);

    // Fetch updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        planId: true,
        planName: true,
        subscriptionId: true,
        subscriptionStatus: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
      },
    });

    console.log("✅ Subscription synced successfully:", {
      userId,
      planId: plan.id,
      planName: plan.name,
      subscriptionId,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription synced successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Sync subscription error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

