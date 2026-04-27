import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Swap from "@/models/Swap";

export async function GET() {
  try {
    await connectDB();
    const swaps = await Swap.find({}).sort({ timestamp: -1 }).limit(50);
    return NextResponse.json(swaps);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch swaps" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newSwap = await Swap.create(body);
    return NextResponse.json(newSwap, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record swap" }, { status: 500 });
  }
}
