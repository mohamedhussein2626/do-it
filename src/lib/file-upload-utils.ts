/**
 * Validates file size against user's plan limit
 * Returns error message if file is too large, null if valid
 */
export async function validateFileSize(file: File): Promise<{
  isValid: boolean;
  error?: string;
  maxFileSizeMB?: number;
  plansWithLargerSize?: Array<{ id: number; name: string; maxFileSize: number; price: number }>;
}> {
  try {
    // Fetch user profile and plans
    const [profileRes, plansRes] = await Promise.all([
      fetch("/api/user/profile"),
      fetch("/api/admin/plans"),
    ]);

    const profileData = await profileRes.json();
    const plansData = await plansRes.json();

    if (!profileData.success || !plansData.success) {
      // If we can't fetch plan info, allow upload (server will validate)
      return { isValid: true };
    }

    const user = profileData.user;
    const plans = plansData.plans.filter((p: any) => p.status === "ACTIVE");

    // Find user's current plan
    let userPlan = null;
    if (user.planId) {
      userPlan = plans.find((p: any) => p.id === user.planId);
    } else if (user.planName) {
      userPlan = plans.find((p: any) =>
        p.name.toLowerCase().includes(user.planName.toLowerCase())
      );
    }

    // Default to 32MB if no plan found
    const maxFileSizeMB = userPlan?.maxFileSize || 32;
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
    const fileSizeMB = file.size / (1024 * 1024);

    if (file.size > maxFileSizeBytes) {
      // Find plans with larger file size limits
      const largerPlans = plans
        .filter((p: any) => p.maxFileSize > maxFileSizeMB)
        .sort((a: any, b: any) => a.maxFileSize - b.maxFileSize)
        .slice(0, 3) // Show top 3 plans
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          maxFileSize: p.maxFileSize,
          price: p.price,
        }));

      const planName = userPlan?.name || "your current plan";
      let errorMessage = `File size (${fileSizeMB.toFixed(2)}MB) exceeds your plan's limit. Your ${planName} plan allows files up to ${maxFileSizeMB}MB per file.`;
      
      if (largerPlans.length > 0) {
        const planNames = largerPlans.map(p => `${p.name} (${p.maxFileSize}MB)`).join(", ");
        errorMessage += ` Upgrade to ${planNames} to upload larger files.`;
      } else {
        errorMessage += ` Please upgrade your plan to upload larger files.`;
      }

      return {
        isValid: false,
        error: errorMessage,
        maxFileSizeMB,
        plansWithLargerSize: largerPlans,
      };
    }

    return { isValid: true, maxFileSizeMB };
  } catch (error) {
    console.error("Error validating file size:", error);
    // If validation fails, allow upload (server will validate)
    return { isValid: true };
  }
}

