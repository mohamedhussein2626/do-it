# Plan Logic Documentation

## Overview

This document explains the subscription plan system implemented in NotebookLama, focusing on the `numberOfFiles` field and how it's used to control user access and enforce plan limits.

## Plan Model Structure

### Core Plan Fields

```prisma
model Plan {
  id            Int            @id @default(autoincrement())
  name          String         @unique
  description   String?
  features      String?
  interval      String         // "monthly" | "yearly"
  price         Float
  priceId       String?        // Stripe price ID
  status        PlanStatus     @default(ACTIVE)
  isPopular     Boolean        @default(false)
  numberOfFiles Int            @default(0) // ⭐ KEY FIELD
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  users         User[]
  subscriptions Subscription[]
}
```

## The `numberOfFiles` Field: Core Logic

### Purpose
The `numberOfFiles` field is the **primary mechanism** for controlling user access to file upload functionality. It defines the maximum number of files a user can upload based on their subscription plan.

### How It Works

1. **Plan Definition**: Each plan has a `numberOfFiles` value that represents the file upload limit
2. **User Assignment**: Users are associated with plans through the `Subscription` model
3. **Usage Tracking**: The system tracks how many files each user has uploaded
4. **Access Control**: Before allowing file uploads, the system checks if the user has reached their limit

### Example Plan Configurations

```typescript
// Free Plan
{
  name: "Free",
  numberOfFiles: 3,  // Users can upload 3 files
  price: 0
}

// Pro Plan  
{
  name: "Pro",
  numberOfFiles: 50, // Users can upload 50 files
  price: 9.99
}

// Max Plan
{
  name: "Max", 
  numberOfFiles: -1, // -1 represents unlimited files
  price: 19.99
}
```

## Implementation Logic

### 1. File Upload Validation

```typescript
// Pseudo-code for file upload validation
async function validateFileUpload(userId: string) {
  // Get user's current plan
  const user = await getUserWithPlan(userId);
  const plan = user.subscription?.plan;
  
  if (!plan) {
    throw new Error("No active subscription");
  }
  
  // Check if unlimited (-1) or count files
  if (plan.numberOfFiles === -1) {
    return true; // Unlimited access
  }
  
  // Count user's uploaded files
  const fileCount = await countUserFiles(userId);
  
  // Check if limit reached
  if (fileCount >= plan.numberOfFiles) {
    throw new Error("File upload limit reached");
  }
  
  return true;
}
```

### 2. Dashboard Usage Display

```typescript
// Dashboard logic to show usage
async function getUserUsage(userId: string) {
  const user = await getUserWithPlan(userId);
  const plan = user.subscription?.plan;
  const fileCount = await countUserFiles(userId);
  
  return {
    currentFiles: fileCount,
    maxFiles: plan?.numberOfFiles || 0,
    isUnlimited: plan?.numberOfFiles === -1,
    usagePercentage: plan?.numberOfFiles === -1 
      ? 0 
      : (fileCount / plan.numberOfFiles) * 100
  };
}
```

### 3. Service Disabling Logic

```typescript
// Check if user should be blocked from services
function shouldDisableService(user: User, plan: Plan) {
  // If no plan, disable service
  if (!plan) return true;
  
  // If unlimited plan, never disable
  if (plan.numberOfFiles === -1) return false;
  
  // Count current files
  const fileCount = countUserFiles(user.id);
  
  // Disable if limit reached
  return fileCount >= plan.numberOfFiles;
}
```

## Database Relationships

### User → Plan Relationship

```prisma
model User {
  // ... other fields
  subscriptions Subscription[] // Many-to-many through Subscription
}

model Subscription {
  userId      String
  planId      Int
  user        User @relation(fields: [userId], references: [id])
  plan        Plan @relation(fields: [planId], references: [id])
  status      String // "active" | "canceled" | "past_due"
  // ... other fields
}

model Plan {
  // ... other fields
  users         User[]         // Back-relation
  subscriptions Subscription[] // Back-relation
}
```

### File Tracking

```prisma
model File {
  id   String @id @default(cuid())
  name String
  // ... other fields
  userId String // Links to User who uploaded
  user   User   @relation(fields: [userId], references: [id])
}
```

## Plan Types and Limits

### 1. Free Plan
- **numberOfFiles**: 3
- **Purpose**: Basic access for new users
- **Features**: Limited file uploads, basic AI conversations

### 2. Pro Plan  
- **numberOfFiles**: 50
- **Purpose**: Professional users with moderate needs
- **Features**: More file uploads, advanced AI features

### 3. Max Plan
- **numberOfFiles**: -1 (unlimited)
- **Purpose**: Power users and enterprises
- **Features**: Unlimited uploads, all premium features

## Usage Scenarios

### Scenario 1: New User (Free Plan)
1. User signs up → Gets Free plan (3 files)
2. User uploads 1st file → 2 files remaining
3. User uploads 2nd file → 1 file remaining  
4. User uploads 3rd file → 0 files remaining
5. User tries to upload 4th file → **BLOCKED** with upgrade prompt

### Scenario 2: Pro User Upgrade
1. User has Free plan with 3/3 files used
2. User upgrades to Pro plan (50 files)
3. User can now upload 47 more files (50 - 3 = 47)
4. System updates user's plan and resets limits

### Scenario 3: Max Plan User
1. User has Max plan (unlimited files)
2. User can upload unlimited files
3. `numberOfFiles === -1` bypasses all file count checks
4. No usage limits or blocking

## Error Handling

### Common Error Messages

```typescript
const ERROR_MESSAGES = {
  NO_PLAN: "No active subscription plan found",
  LIMIT_REACHED: "File upload limit reached. Please upgrade your plan.",
  PLAN_EXPIRED: "Your subscription has expired. Please renew to continue.",
  BANNED_USER: "Your account has been suspended. Contact support."
};
```

### Graceful Degradation

1. **Plan Expired**: Show upgrade prompt, allow limited access
2. **Limit Reached**: Show usage stats, provide upgrade options
3. **Payment Failed**: Grace period with reduced functionality
4. **Banned User**: Complete service block with support contact

## Dashboard Integration

### Usage Display Components

```typescript
// Usage Progress Bar
<UsageProgress 
  current={userFileCount}
  max={plan.numberOfFiles}
  isUnlimited={plan.numberOfFiles === -1}
/>

// Plan Information Card
<PlanCard 
  planName={plan.name}
  features={plan.features}
  fileLimit={plan.numberOfFiles}
  currentUsage={userFileCount}
/>
```

### Real-time Updates

- File uploads update usage counters immediately
- Plan changes reflect instantly in dashboard
- Usage warnings shown when approaching limits
- Upgrade prompts displayed when limits reached

## Security Considerations

### 1. Server-side Validation
- All file upload limits enforced on server
- Client-side checks are for UX only
- Database constraints prevent limit bypassing

### 2. Plan Tampering Prevention
- Plan data stored securely in database
- User cannot modify their own plan limits
- All plan changes go through payment system

### 3. Usage Tracking
- File counts stored in database
- User activity logged for audit trails
- Chargeback protection through usage evidence

## Migration and Updates

### Adding New Plans
1. Create new plan record with `numberOfFiles` value
2. Update Stripe price configuration
3. Add plan to frontend pricing display
4. Test file upload limits for new plan

### Modifying Existing Plans
1. Update `numberOfFiles` in database
2. Existing users get new limits immediately
3. Consider grandfathering for existing subscribers
4. Update pricing pages and documentation

## Best Practices

### 1. Clear Communication
- Show usage limits clearly in dashboard
- Provide upgrade paths when limits reached
- Explain plan benefits and restrictions

### 2. Fair Usage
- Allow users to delete files to free up space
- Provide clear upgrade options
- Don't surprise users with sudden blocks

### 3. Performance
- Cache plan data to avoid repeated database queries
- Use efficient counting queries for file limits
- Implement proper indexing on file relationships

## Conclusion

The `numberOfFiles` field is a critical component of NotebookLama's subscription system, providing:

- **Clear usage limits** for different plan tiers
- **Flexible plan management** with unlimited options
- **Fair access control** that scales with user needs
- **Revenue optimization** through upgrade incentives
- **Chargeback protection** through usage tracking

This system ensures users understand their limits while providing clear paths to upgrade when they need more functionality.
