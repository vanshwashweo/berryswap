import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pool from "@/models/Pool";

export async function GET() {
  try {
    await connectDB();
    const stats = await Pool.findOne({ poolId: "XLM-BERRY" });
    return NextResponse.json(stats || { 
      poolId: "XLM-BERRY",
      xlmReserve: "1000000",
      mtlswReserve: "50000",
      totalShares: "100000",
      volume24h: 482000,
      tvlUSD: 2450000
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pool stats" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const stats = await Pool.findOneAndUpdate(
      { poolId: "XLM-BERRY" },
      { $set: body, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
  }
}
