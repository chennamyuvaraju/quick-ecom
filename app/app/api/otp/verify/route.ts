import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { phone, otp } = (await req.json()) as { phone: string; otp: string };
	if (!phone || !otp) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "phone and otp required" } }, { status: 400 });
	// In dev, accept any otp and return a dummy token
	const otpToken = Buffer.from(`${phone}:${Date.now()}`).toString("base64");
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
	return NextResponse.json({ otpToken, expiresAt });
}