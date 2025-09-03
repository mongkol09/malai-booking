-- Create UserPin table for PIN management
CREATE TABLE "UserPin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastUsedAt" DATETIME,
    "lastFailedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "expiresAt" DATETIME,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create ActivityLog table for tracking all PIN-related activities
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "activityType" TEXT NOT NULL,
    "data" TEXT, -- JSON string containing activity details
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE UNIQUE INDEX "UserPin_userId_key" ON "UserPin"("userId");
CREATE INDEX "UserPin_isActive_idx" ON "UserPin"("isActive");
CREATE INDEX "UserPin_lockedUntil_idx" ON "UserPin"("lockedUntil");
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_activityType_idx" ON "ActivityLog"("activityType");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- Add PIN setup requirement to User table
ALTER TABLE "User" ADD COLUMN "requiresPinSetup" BOOLEAN DEFAULT false;
