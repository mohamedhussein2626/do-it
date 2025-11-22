# Stripe Integration Setup Guide

## Overview

This guide explains how to set up and configure Stripe for NotebookLama, including both testing and production environments.

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Add your business information and bank details

### 2. Get Your API Keys

#### Test Mode Keys (for development)
```bash
# Test Secret Key (starts with sk_test_)
STRIPE_SECRET_KEY=sk_test_51H...

# Test Publishable Key (starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51H...

# Test Webhook Secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

#### Live Mode Keys (for production)
```bash
# Live Secret Key (starts with sk_live_)
STRIPE_SECRET_KEY=sk_live_51H...

# Live Publishable Key (starts with pk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51H...

# Live Webhook Secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

## Environment Configuration

### Development/Testing Environment

When developing locally or testing features, use **Test Mode** keys:

```bash
# .env.local (for local development)
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_51H... # Test secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51H... # Test publishable key
STRIPE_WEBHOOK_SECRET=whsec_test_... # Test webhook secret
```

### Production Environment

When deploying to production, use **Live Mode** keys:

```bash
# .env.production (for production)
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_51H... # Live secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51H... # Live publishable key
STRIPE_WEBHOOK_SECRET=whsec_live_... # Live webhook secret
```

## Stripe Dashboard Configuration

### 1. Products and Prices Setup

1. **Go to Products** in your Stripe Dashboard
2. **Create Products** for each plan:
   - Free Plan (Free)
   - Pro Plan ($9.99/month)
   - Max Plan ($19.99/month)

3. **Set up Prices** for each product:
   - Monthly recurring prices
   - Yearly recurring prices (optional)
   - Copy the Price IDs for your database

### 2. Webhook Configuration

#### For Development (localhost)
1. Go to **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL: `http://localhost:3000/api/webhooks/stripe`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

#### For Production
1. Go to **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL: `https://app.notebooklama.com/api/webhooks/stripe`
4. Select the same events as development

### 3. Get Webhook Secret
After creating the webhook endpoint:
1. Click on the webhook endpoint
2. Click **Reveal** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add it to your environment variables

## Testing with Stripe

### 1. Test Cards
Use these test card numbers in development:

```bash
# Successful payment
4242424242424242

# Declined payment
4000000000000002

# Requires authentication
4000002500003155

# Insufficient funds
4000000000009995
```

### 2. Test Scenarios
- **Successful subscription**: Use `4242424242424242`
- **Payment failure**: Use `4000000000000002`
- **Subscription cancellation**: Test in Stripe Dashboard
- **Webhook events**: Use Stripe CLI for local testing

## Stripe CLI Setup (Optional)

For local webhook testing:

```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Security Best Practices

### 1. Key Management
- **Never commit** API keys to version control
- Use environment variables for all keys
- Rotate keys regularly
- Use different keys for test and live modes

### 2. Webhook Security
- Always verify webhook signatures
- Use HTTPS endpoints in production
- Implement idempotency for webhook handlers
- Log all webhook events for debugging

### 3. Error Handling
```typescript
// Example webhook handler with signature verification
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        // Handle subscription creation
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break;
      // ... other events
    }
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }
}
```

## Common Issues and Solutions

### 1. Webhook Not Receiving Events
- Check endpoint URL is correct
- Verify webhook secret matches
- Ensure HTTPS is used in production
- Check Stripe Dashboard for webhook logs

### 2. Test vs Live Mode Confusion
- Always use test keys in development
- Switch to live keys only in production
- Test thoroughly in test mode before going live

### 3. Subscription Status Sync
- Implement proper webhook handlers
- Handle all subscription lifecycle events
- Update database when webhooks are received
- Implement retry logic for failed webhooks

## Monitoring and Analytics

### 1. Stripe Dashboard
- Monitor payment success rates
- Track subscription metrics
- View customer analytics
- Set up alerts for failed payments

### 2. Application Logging
```typescript
// Log Stripe events for debugging
console.log('Stripe event received:', {
  type: event.type,
  id: event.id,
  created: event.created,
  data: event.data
});
```

## Going Live Checklist

Before switching to live mode:

- [ ] Test all payment flows in test mode
- [ ] Verify webhook endpoints work correctly
- [ ] Update environment variables to live keys
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Document all webhook handlers
- [ ] Implement proper error handling
- [ ] Test subscription cancellation flows
- [ ] Verify refund processes work
- [ ] Set up customer support procedures

## Support and Resources

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your dashboard
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Webhook Testing**: Use Stripe CLI or dashboard
- **API Reference**: [stripe.com/docs/api](https://stripe.com/docs/api)

## Important Notes

⚠️ **Never use live keys in development**
⚠️ **Always verify webhook signatures**
⚠️ **Use HTTPS in production**
⚠️ **Test thoroughly before going live**
⚠️ **Keep your secret keys secure**
