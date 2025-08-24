export type KPI = {
	label: string;
	value: string | number;
};

export type HeroConfig = {
	title: string;
	subtitle?: string;
	ctas?: { label: string; href: string }[];
	image?: { url: string; alt?: string };
};

export type CarouselImage = { url: string; alt?: string; href?: string };

export type SiteConfig = {
	siteActive: boolean;
	announcement?: { message: string; enabled: boolean };
	hero?: HeroConfig;
	carouselImages?: CarouselImage[];
	kpis?: KPI[];
	seo?: { title?: string; description?: string };
};

export type Product = {
	_id: string;
	name: string;
	slug: string;
	category: string;
	brand: string;
	price: number;
	originalPrice?: number;
	stock: number;
	status: "active" | "inactive";
	image: string;
	sku?: string;
	productCode?: string;
	description?: string;
	packageType?: string;
	piecesPerBox?: number;
	inStock?: boolean;
	tags?: string[];
	views?: number;
	salesCount?: number;
	defaultRating?: number;
	createdAt?: string;
	updatedAt?: string;
};

export type CartItemInput = { productId: string; qty: number };

export type ValidatedCartItem = {
	productId: string;
	name: string;
	priceAtOrder: number;
	maxQty: number;
	qtySuggested: number;
	flags: { priceChanged?: boolean; outOfStock?: boolean; qtyReduced?: boolean };
};

export type CartValidationResponse = {
	items: ValidatedCartItem[];
	summary: { subTotal: number; originalTotal?: number; savings?: number };
};