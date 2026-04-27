import mongoose, { Schema, Document } from "mongoose";

export interface IAdminLog extends Document {
  adminAddress: string;
  action: string;
  details: string;
  txHash?: string;
  timestamp: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  adminAddress: { type: String, required: true, index: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  txHash: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AdminLog || mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
