import { NextRequest, NextResponse } from "next/server";

const rate: Record<string, { countHour: number; countDay: number; ts: number }> = {};

export async function POST(req: NextRequest) {
	const { phone } = (await req.json()) as { phone: string };
	if (!phone) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "phone required" } }, { status: 400 });
	const key = phone;
	const now = Date.now();
	const entry = rate[key] || { countHour: 0, countDay: 0, ts: now };
	// reset windows
	if (now - entry.ts > 60 * 60 * 1000) entry.countHour = 0;
	if (now - entry.ts > 24 * 60 * 60 * 1000) entry.countDay = 0;
	entry.ts = now;
	entry.countHour++;
	entry.countDay++;
	rate[key] = entry;
	if (entry.countHour > 3 || entry.countDay > 10) {
		return NextResponse.json({ error: { code: "RATE_LIMIT", message: "Too many requests" } }, { status: 429 });
	}
	// In dev, we do not integrate provider. Always succeed.
	return NextResponse.json({ success: true });
}