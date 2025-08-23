import { NextRequest, NextResponse } from "next/server";
import { devdb, DevOrderItem } from "@/lib/devdb";
import { CartItemInput, CartValidationResponse } from "@/lib/types";

function isOtpTokenValid(token?: string) {
	return Boolean(token && token.length > 10);
}

export async function POST(req: NextRequest) {
	const body = (await req.json()) as {
		customer: { name: string; phone: string; email?: string };
		address?: { line1: string; city?: string; state?: string; pincode?: string };
		transport?: { provider?: string; pickupLocationId?: string; instructions?: string };
		items: CartItemInput[];
		otpToken?: string;
		notes?: string;
		coupon?: string;
	};
	if (!isOtpTokenValid(body.otpToken)) {
		return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "otpToken required" } }, { status: 401 });
	}
	// Re-validate
	const res = await fetch(new URL("/api/cart/validate", req.url), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ items: body.items }),
	});
	const validation = (await res.json()) as CartValidationResponse;
	const correctedItems = validation.items.map((it) => ({ productId: it.productId, priceAtOrder: it.priceAtOrder, qtySuggested: it.qtySuggested, name: it.name }));
	const anyMismatch = correctedItems.some((it, idx) => it.qtySuggested !== body.items[idx]?.qty);
	if (anyMismatch) {
		return NextResponse.json({ correctedCart: validation }, { status: 409 });
	}

	const orderItems: DevOrderItem[] = correctedItems.map((it) => ({
		productId: it.productId,
		name: it.name,
		priceAtOrder: it.priceAtOrder,
		qty: it.qtySuggested,
	}));
	const subtotal = orderItems.reduce((s, i) => s + i.priceAtOrder * i.qty, 0);
	const order = devdb.orders.create({
		status: "pending",
		customer: body.customer,
		address: body.address,
		transport: body.transport,
		items: orderItems,
		subtotal,
		notes: body.notes,
	});
	const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
		`Order ${order.id} - Subtotal: ₹${subtotal}`
	)}`;
	return NextResponse.json({ orderId: order.id, status: order.status, totals: { subtotal }, items: orderItems, whatsappLink });
}