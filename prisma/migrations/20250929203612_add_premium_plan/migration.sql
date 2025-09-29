-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."CustomLogType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT DEFAULT '📝',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomLogType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CustomLogType" ADD CONSTRAINT "CustomLogType_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
