import { NextRequest, NextResponse } from "next/server";
import { devdb } from "@/lib/devdb";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: unknown) {
	const { idOrSlug } = (context as { params: { idOrSlug: string } }).params;
	const items = devdb.products.list();
	const item = items.find((p) => p._id === idOrSlug || p.slug === idOrSlug);
	if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
	return NextResponse.json(item);
}