-- Reemplaza PaymentStatus { PENDING, PAID } por { DEPOSIT_PENDING, DEPOSIT_PAID, FULLY_PAID }.
-- Mapeo de filas existentes (ninguna queda en DEPOSIT_PENDING, para no
-- exponerlas a la nueva expiracion automatica por deposito vencido):
--   PAID    -> FULLY_PAID
--   PENDING -> DEPOSIT_PAID
-- depositDeadline es nueva y nullable: las filas existentes quedan en NULL
-- (sin fecha limite, exentas de expiracion automatica).

ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('DEPOSIT_PENDING', 'DEPOSIT_PAID', 'FULLY_PAID');

ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Reservation"
  ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
  USING (
    CASE "paymentStatus"::text
      WHEN 'PAID' THEN 'FULLY_PAID'
      WHEN 'PENDING' THEN 'DEPOSIT_PAID'
    END::"PaymentStatus"
  );
ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" SET DEFAULT 'DEPOSIT_PENDING';
DROP TYPE "PaymentStatus_old";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "depositDeadline" TIMESTAMP(3);
