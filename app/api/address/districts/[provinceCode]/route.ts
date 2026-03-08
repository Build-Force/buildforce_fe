import { NextRequest, NextResponse } from "next/server";

const OPEN_API = "https://provinces.open-api.vn/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provinceCode: string }> }
) {
  try {
    const { provinceCode } = await params;
    if (!provinceCode) {
      return NextResponse.json({ success: false, data: [] }, { status: 400 });
    }
    const res = await fetch(`${OPEN_API}/p/${encodeURIComponent(provinceCode)}?depth=2`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch districts");
    const body = (await res.json()) as { districts?: { name: string; code: number }[] };
    const districts = body.districts ?? [];
    return NextResponse.json({ success: true, data: districts });
  } catch (e) {
    console.error("[address/districts]", e);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
