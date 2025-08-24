import { NextResponse } from "next/server";
import { SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

async function readConfig(): Promise<SiteConfig> {
	try {
		const { db } = await import("@/lib/firebase/server");
		const snap = await db().doc("configs/main").get();
		if (snap.exists) {
			const data = snap.data() as SiteConfig;
			return {
				siteActive: data.siteActive ?? true,
				announcement: data.announcement ?? { message: "Welcome!", enabled: false },
				hero: data.hero ?? {
					title: "UniqueCrackers",
					subtitle: "Quick-buy ecommerce with OTP enquiries",
					ctas: [
						{ label: "Quick Buy", href: "/quick-buy" },
						{ label: "View Products", href: "/all-products" },
					],
					image: { url: "/next.svg", alt: "Hero" },
				},
				carouselImages: data.carouselImages ?? [],
				kpis: data.kpis ?? [
					{ label: "Orders", value: 1200 },
					{ label: "Happy Customers", value: 950 },
				],
				seo: data.seo ?? { title: "UniqueCrackers", description: "Quick-buy" },
			};
		}
	} catch (e) {
		// fall through to default
	}
	return {
		siteActive: true,
		announcement: { message: "Seasonal offers live!", enabled: true },
		hero: {
			title: "UniqueCrackers",
			subtitle: "Festive packs and more",
			ctas: [
				{ label: "Quick Buy", href: "/quick-buy" },
				{ label: "View Products", href: "/all-products" },
			],
			image: { url: "/next.svg", alt: "Hero" },
		},
		carouselImages: [
			{ url: "/vercel.svg", alt: "Brand", href: "/quick-buy" },
		],
		kpis: [
			{ label: "Orders", value: 1200 },
			{ label: "Happy Customers", value: 950 },
		],
		seo: { title: "UniqueCrackers", description: "Quick-buy" },
	};
}

export async function GET() {
	const cfg = await readConfig();
	return NextResponse.json(cfg);
}