import { NextRequest, NextResponse } from "next/server";
import { devdb } from "@/lib/devdb";
import { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(searchParams.get("limit") || "50", 10);
	const q = (searchParams.get("search") || "").toLowerCase();
	const brand = searchParams.get("brand") || "";
	const category = searchParams.get("category") || "";
	const status = searchParams.get("status") || "active";

	let items = devdb.products.list();
	if (status) items = items.filter((p) => p.status === status);
	if (brand) items = items.filter((p) => p.brand === brand);
	if (category) items = items.filter((p) => p.category === category);
	if (q) {
		items = items.filter((p) =>
			[p.name, p.sku, p.slug, p.productCode]
				.filter(Boolean)
				.some((s) => s!.toLowerCase().includes(q))
		);
	}
	const total = items.length;
	const start = (page - 1) * limit;
	const slice = items.slice(start, start + limit);
	return NextResponse.json({ items: slice, page, pageSize: limit, total });
}