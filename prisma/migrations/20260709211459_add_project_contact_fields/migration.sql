-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "showProgress" BOOLEAN NOT NULL DEFAULT true;
