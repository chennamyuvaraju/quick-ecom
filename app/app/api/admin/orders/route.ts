import { NextRequest, NextResponse } from "next/server";
import { devdb } from "@/lib/devdb";

export async function GET(_req: NextRequest) {
	const items = devdb.orders.list();
	return NextResponse.json({ items, total: items.length });
}