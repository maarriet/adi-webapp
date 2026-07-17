/*
  Warnings:

  - Added the required column `contractorPhone` to the `Reservation` table without a default value. This is not possible if the table is not empty.

  Editado a mano: la tabla ya tenía 2 reservas reales (no de prueba), así
  que se agrega la columna como nullable, se rellenan esas filas con un
  placeholder explícito ("No registrado" — no un teléfono inventado que
  pudiera confundirse con uno real) y recién ahí se marca NOT NULL.
*/
-- AlterTable (paso 1: nullable)
ALTER TABLE "Reservation" ADD COLUMN     "contractorPhone" TEXT;

-- Backfill de filas existentes (previas a este campo)
UPDATE "Reservation" SET "contractorPhone" = 'No registrado' WHERE "contractorPhone" IS NULL;

-- AlterTable (paso 2: ahora sí requerida)
ALTER TABLE "Reservation" ALTER COLUMN "contractorPhone" SET NOT NULL;
