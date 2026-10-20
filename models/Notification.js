// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, default: "" },
    orderId: { type: String, default: "" },
    orderNumber: { type: String, default: "" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["PAYMENT_CLEARED", "ORDER_STATUS", "PROMO", "SYSTEM"],
      default: "PAYMENT_CLEARED",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
