-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "stamps" INTEGER NOT NULL DEFAULT 2,
    "discountUsed" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StampLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StampLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'Madedeco',
    "discountPercentage" INTEGER NOT NULL DEFAULT 20,
    "totalSlots" INTEGER NOT NULL DEFAULT 10,
    "initialStamps" INTEGER NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_token_key" ON "Customer"("token");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
CREATE INDEX "Customer_token_idx" ON "Customer"("token");

-- AddForeignKey
ALTER TABLE "StampLog" ADD CONSTRAINT "StampLog_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed inicial de Settings
INSERT INTO "Settings" ("id", "businessName", "discountPercentage", "totalSlots", "initialStamps", "updatedAt")
VALUES ('singleton', 'Madedeco', 20, 10, 2, NOW())
ON CONFLICT ("id") DO NOTHING;
