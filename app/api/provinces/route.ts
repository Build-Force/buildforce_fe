import { NextResponse } from "next/server";
import { PROVINCES_DATA } from "@/data/provinces";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: PROVINCES_DATA,
  });
}
