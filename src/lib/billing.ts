import crypto from "crypto";
import { MongoClient } from "mongodb";

export interface CompletePaymentParams {
  orderId: string;
  paymentId: string;
  signature?: string; // Optional for webhook bypass if we manually verify/trust the event signature
  skipSignatureCheck?: boolean;
}

export async function completePayment(
  db: any,
  { orderId, paymentId, signature, skipSignatureCheck = false }: CompletePaymentParams
) {
  const paymentsCollection = db.collection("payments");
  const usersCollection = db.collection("users");

  // Find the payment
  const payment = await paymentsCollection.findOne({ orderId });
  if (!payment) {
    throw new Error("Payment record not found for order ID: " + orderId);
  }

  // If already completed, just return the existing record
  if (payment.status === "completed") {
    return payment;
  }

  // Verify Signature
  if (!skipSignatureCheck && signature) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("Razorpay secret not configured");
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      throw new Error("Invalid signature verification failed");
    }
  }

  // Generate dynamic FY invoice number: SP/LB/YY-YY/XXXX
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 3 is April
  let startYear, endYear;
  if (month >= 3) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }
  const fy = `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  const prefix = `SP/LB/${fy}/`;

  // Find latest completed invoice in this FY
  const lastPayment = await paymentsCollection.findOne(
    { invoiceNumber: { $regex: `^SP/LB/${fy}/` }, status: "completed" },
    { sort: { invoiceNumber: -1 } }
  );

  let seq = 1;
  if (lastPayment?.invoiceNumber) {
    const parts = lastPayment.invoiceNumber.split("/");
    const lastSeqStr = parts[parts.length - 1];
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  const invoiceNumber = `${prefix}${String(seq).padStart(4, "0")}`;

  // Update payment record to completed
  const updatedPayment = {
    ...payment,
    status: "completed",
    paymentId,
    signature,
    invoiceNumber,
    updatedAt: new Date(),
  };

  await paymentsCollection.updateOne(
    { _id: payment._id },
    {
      $set: {
        status: "completed",
        paymentId,
        signature,
        invoiceNumber,
        updatedAt: new Date(),
      },
    }
  );

  // Activate the plan for the user
  const planActivatedAt = new Date();
  let planExpiresAt = null;
  if (payment.plan === "annual") {
    planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  await usersCollection.updateOne(
    { email: payment.userId },
    {
      $set: {
        plan: payment.plan,
        planActivatedAt,
        planExpiresAt,
      },
    }
  );

  return updatedPayment;
}
