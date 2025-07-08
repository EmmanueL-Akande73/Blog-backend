/*
  Warnings:
  - The values [PROCESSING,REFUNDED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `paymentMethod` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `depositAmount` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod" to the `Reservation` table without a default value. This is not possible if the table is not empty.
*/

-- 0. Add missing columns to Reservation (safe for reruns)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Reservation' AND column_name='paymentMethod') THEN
        ALTER TABLE "Reservation" ADD COLUMN "paymentMethod" "PaymentMethod";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Reservation' AND column_name='depositAmount') THEN
        ALTER TABLE "Reservation" ADD COLUMN "depositAmount" double precision;
    END IF;
END $$;

-- 1. Create the new enum type for PaymentStatus (safe for reruns)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus_new') THEN
        CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
    END IF;
END $$;

-- 2. Update Order.paymentStatus (only if column exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='paymentStatus') THEN
        ALTER TABLE "Order" ALTER COLUMN "paymentStatus" DROP DEFAULT;
        ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
        ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
    END IF;
END $$;

-- 3. Update Reservation.paymentStatus (only if column exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Reservation' AND column_name='paymentStatus') THEN
        ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" DROP DEFAULT;
        ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
        ALTER TABLE "Reservation" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
    END IF;
END $$;

-- 4. Rename enums (safe for reruns)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
        ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus_new') THEN
        ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
    END IF;
END $$;
-- Do NOT drop the old type to avoid errors in non-psql runners

-- 5. Make paymentMethod NOT NULL with default on Order (only if column exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Order' AND column_name='paymentMethod') THEN
        ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH';
        UPDATE "Order" SET "paymentMethod" = 'CASH' WHERE "paymentMethod" IS NULL;
        ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET NOT NULL;
    END IF;
END $$;
