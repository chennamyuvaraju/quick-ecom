import { NextRequest, NextResponse } from "next/server";
import { devdb } from "@/lib/devdb";
import { CartItemInput, CartValidationResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	const body = (await req.json()) as { items: CartItemInput[] };
	const itemsReq = body.items || [];
	const all = devdb.products.list();
	const items = itemsReq.map((it) => {
		const p = all.find((x) => x._id === it.productId);
		if (!p || p.status !== "active") {
			return {
				productId: it.productId,
				name: p?.name || "Unknown",
				priceAtOrder: p?.price || 0,
				maxQty: 0,
				qtySuggested: 0,
				flags: { outOfStock: true },
			};
		}
		const qtySuggested = Math.max(0, Math.min(it.qty, p.stock));
		return {
			productId: p._id,
			name: p.name,
			priceAtOrder: p.price,
			maxQty: p.stock,
			qtySuggested,
			flags: { qtyReduced: qtySuggested !== it.qty },
		};
	});
	const subTotal = items.reduce((sum, it) => sum + it.priceAtOrder * it.qtySuggested, 0);
	const originalTotal = items.reduce((sum, it) => {
		const p = all.find((x) => x._id === it.productId);
		return sum + (p?.originalPrice || it.priceAtOrder) * it.qtySuggested;
	}, 0);
	const resp: CartValidationResponse = {
		items,
		summary: { subTotal, originalTotal, savings: Math.max(0, originalTotal - subTotal) },
	};
	return NextResponse.json(resp);
}