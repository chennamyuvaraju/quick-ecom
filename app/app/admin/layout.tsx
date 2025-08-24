export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			<nav style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
				<a href="/admin/orders" style={{ marginRight: 12 }}>Orders</a>
				<a href="/admin/products" style={{ marginRight: 12 }}>Stock</a>
				<a href="/admin/config">Config</a>
			</nav>
			<div>{children}</div>
		</div>
	);
}