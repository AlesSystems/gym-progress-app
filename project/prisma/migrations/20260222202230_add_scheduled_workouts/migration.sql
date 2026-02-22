-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "scheduledDate" DATE NOT NULL,
    "title" VARCHAR(100),
    "notes" TEXT,
    "completedSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledWorkout_completedSessionId_key" ON "ScheduledWorkout"("completedSessionId");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_idx" ON "ScheduledWorkout"("userId");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_scheduledDate_idx" ON "ScheduledWorkout"("scheduledDate");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_scheduledDate_idx" ON "ScheduledWorkout"("userId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_completedSessionId_fkey" FOREIGN KEY ("completedSessionId") REFERENCES "WorkoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
