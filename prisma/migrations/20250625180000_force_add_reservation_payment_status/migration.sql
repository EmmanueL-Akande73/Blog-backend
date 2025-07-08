-- Migration to forcibly add missing paymentStatus column to Reservation
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" DEFAULT 'PENDING';
