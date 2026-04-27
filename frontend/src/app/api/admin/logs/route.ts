import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminLog from "@/models/AdminLog";

export async function GET() {
  try {
    await connectDB();
    const logs = await AdminLog.find({}).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newLog = await AdminLog.create(body);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record log" }, { status: 500 });
  }
}
