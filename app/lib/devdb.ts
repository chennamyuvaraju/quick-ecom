import { Product, SiteConfig } from "@/lib/types";
import { randomUUID } from "crypto";

// In-memory dev database. Not for production use.

type Address = { line1: string; city?: string; state?: string; pincode?: string };

type TransportInfo = { provider?: string; pickupLocationId?: string; instructions?: string };

type Adjustment = { type: "qtyReduced" | "itemUnavailable" | "priceChanged"; productId: string; from?: number; to?: number };

export type DevOrderItem = {
	productId: string;
	name: string;
	priceAtOrder: number;
	qty: number;
};

export type DevOrder = {
	id: string;
	createdAt: string;
	status: "pending" | "confirmed" | "delivered" | "cancelled";
	customer: { name: string; phone: string; email?: string };
	address?: Address;
	transport?: TransportInfo;
	items: DevOrderItem[];
	subtotal: number;
	notes?: string;
	adjustments?: Adjustment[];
};

const sampleProduct: Product = {
	_id: "5126a8d3-6cb6-4cb5-85ab-6d0821e69e4d",
	name: "3000 PACK",
	slug: "3000-pack",
	category: "family-packs",
	brand: "Mixed",
	price: 3334,
	originalPrice: 3334,
	stock: 99999,
	status: "active",
	image: "https://blob.uniquecrackers.in/products/default-tenant/e73133e5-fe97-431c-9254-ddecdb48d024.jpeg",
	sku: "UC 001",
	productCode: "UC 001",
	description: "",
	packageType: "1 Box",
	piecesPerBox: 1,
	inStock: true,
	tags: [],
	views: 129,
	salesCount: 1,
	defaultRating: 4.8,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

function generateProducts(n: number): Product[] {
	const arr: Product[] = [];
	for (let i = 1; i <= n; i++) {
		arr.push({
			...sampleProduct,
			_id: randomUUID(),
			name: `Pack ${i}`,
			slug: `pack-${i}`,
			price: Math.floor(200 + (i % 50) * 10),
			originalPrice: Math.floor(220 + (i % 50) * 12),
			stock: (i * 7) % 120,
			brand: ["Mixed", "BrandA", "BrandB"][i % 3],
			category: ["family-packs", "sparklers", "rockets"][i % 3],
			sku: `UC ${i.toString().padStart(3, "0")}`,
			productCode: `UC ${i.toString().padStart(3, "0")}`,
		});
	}
	return arr;
}

let PRODUCTS: Product[] = generateProducts(200);

let CONFIG: SiteConfig = {
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

let ORDERS: DevOrder[] = [];

export const devdb = {
	products: {
		list() {
			return PRODUCTS;
		},
		update(id: string, patch: Partial<Product>) {
			PRODUCTS = PRODUCTS.map((p) => (p._id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p));
		},
		create(p: Product) {
			PRODUCTS.unshift(p);
		},
		remove(id: string) {
			PRODUCTS = PRODUCTS.filter((p) => p._id !== id);
		},
	},
	config: {
		get(): SiteConfig {
			return CONFIG;
		},
		set(cfg: SiteConfig) {
			CONFIG = cfg;
		},
	},
	orders: {
		list() {
			return ORDERS;
		},
		create(o: Omit<DevOrder, "id" | "createdAt">) {
			const id = randomUUID();
			const order: DevOrder = { ...o, id, createdAt: new Date().toISOString() };
			ORDERS.unshift(order);
			return order;
		},
		get(id: string) {
			return ORDERS.find((o) => o.id === id);
		},
		update(id: string, patch: Partial<DevOrder>) {
			ORDERS = ORDERS.map((o) => (o.id === id ? { ...o, ...patch } : o));
		},
	},
};