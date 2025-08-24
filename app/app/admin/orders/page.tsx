"use client";

import useSWR from "swr";
import { Container, Heading, Table, Thead, Tr, Th, Tbody, Td, Badge } from "@chakra-ui/react";

type Order = {
	id: string;
	createdAt: string;
	status: string;
	customer: { name: string; phone: string };
	items: { qty: number }[];
	subtotal: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminOrdersPage() {
	const { data } = useSWR<{ items: Order[] }>("/api/admin/orders", fetcher);
	return (
		<Container maxW="6xl" py={6}>
			<Heading size="lg" mb={4}>Orders</Heading>
			<Table size="sm">
				<Thead>
					<Tr>
						<Th>ID</Th>
						<Th>Created</Th>
						<Th>Customer</Th>
						<Th isNumeric>Items</Th>
						<Th isNumeric>Subtotal</Th>
						<Th>Status</Th>
					</Tr>
				</Thead>
				<Tbody>
					{data?.items?.map((o) => (
						<Tr key={o.id}>
							<Td>{o.id.slice(0, 8)}</Td>
							<Td>{new Date(o.createdAt).toLocaleString()}</Td>
							<Td>{o.customer.name}</Td>
							<Td isNumeric>{o.items.reduce((s, i) => s + i.qty, 0)}</Td>
							<Td isNumeric>₹{o.subtotal.toFixed(0)}</Td>
							<Td><Badge>{o.status}</Badge></Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Container>
	);
}