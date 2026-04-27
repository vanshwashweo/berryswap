import mongoose, { Schema, Document } from "mongoose";

export interface ISwap extends Document {
  userAddress: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  txHash: string;
  timestamp: Date;
}

const SwapSchema = new Schema<ISwap>({
  userAddress: { type: String, required: true, index: true },
  fromToken: { type: String, required: true },
  toToken: { type: String, required: true },
  fromAmount: { type: String, required: true },
  toAmount: { type: String, required: true },
  txHash: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Swap || mongoose.model<ISwap>("Swap", SwapSchema);
