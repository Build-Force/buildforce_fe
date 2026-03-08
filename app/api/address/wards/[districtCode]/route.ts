import { NextRequest, NextResponse } from "next/server";

const OPEN_API = "https://provinces.open-api.vn/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ districtCode: string }> }
) {
  try {
    const { districtCode } = await params;
    if (!districtCode) {
      return NextResponse.json({ success: false, data: [] }, { status: 400 });
    }
    const res = await fetch(`${OPEN_API}/d/${encodeURIComponent(districtCode)}?depth=2`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch wards");
    const body = (await res.json()) as { wards?: { name: string; code: number }[] };
    const wards = body.wards ?? [];
    return NextResponse.json({ success: true, data: wards });
  } catch (e) {
    console.error("[address/wards]", e);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
