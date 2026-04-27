import mongoose, { Schema, Document } from "mongoose";

export interface IPool extends Document {
  poolId: string;
  xlmReserve: string;
  mtlswReserve: string;
  totalShares: string;
  volume24h: number;
  tvlUSD: number;
  lastUpdated: Date;
}

const PoolSchema = new Schema<IPool>({
  poolId: { type: String, required: true, unique: true },
  xlmReserve: { type: String, required: true },
  mtlswReserve: { type: String, required: true },
  totalShares: { type: String, required: true },
  volume24h: { type: Number, default: 0 },
  tvlUSD: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.Pool || mongoose.model<IPool>("Pool", PoolSchema);
