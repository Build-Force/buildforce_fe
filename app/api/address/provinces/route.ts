import { NextResponse } from "next/server";
import { PROVINCES_DATA } from "@/data/provinces";

const OPEN_API = "https://provinces.open-api.vn/api";

/** Chuẩn hóa tên tỉnh để ghép với dữ liệu lat/lng (bỏ "Thành phố ", "Tỉnh ") */
function normalizeProvinceName(name: string): string {
  return name
    .replace(/^Thành phố\s+/i, "")
    .replace(/^Tỉnh\s+/i, "")
    .trim();
}

export async function GET() {
  try {
    const res = await fetch(`${OPEN_API}/p/`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error("Failed to fetch provinces");
    const list = (await res.json()) as { name: string; code: number }[];
    const withCoords = list.map((p) => {
      const normalized = normalizeProvinceName(p.name);
      const found = PROVINCES_DATA.find(
        (q) => q.name === normalized || q.name.includes(normalized) || normalized.includes(q.name)
      );
      return {
        name: p.name,
        code: p.code,
        lat: found?.lat,
        lng: found?.lng,
      };
    });
    return NextResponse.json({ success: true, data: withCoords });
  } catch (e) {
    console.error("[address/provinces]", e);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
