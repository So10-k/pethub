-- CreateTable
CREATE TABLE "public"."MaintenanceMode" (
    "id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT DEFAULT 'We''re currently performing maintenance. Please check back soon!',
    "estimatedDuration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "whitelistedUserIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceMode_pkey" PRIMARY KEY ("id")
);
