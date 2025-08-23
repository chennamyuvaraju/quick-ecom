"use client";

import useSWR from "swr";
import { Container, Heading, Table, Thead, Tr, Th, Tbody, Td, NumberInput, NumberInputField } from "@chakra-ui/react";
import { useState } from "react";
import { Product } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ProductsResp = { items: Product[] };

export default function AdminProductsPage() {
	const { data } = useSWR<ProductsResp>("/api/products?limit=100", fetcher);
	const [edits, setEdits] = useState<Record<string, { price?: number; stock?: number }>>({});
	return (
		<Container maxW="7xl" py={6}>
			<Heading size="lg" mb={4}>Stock Management</Heading>
			<Table size="sm">
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th>SKU</Th>
						<Th isNumeric>Price</Th>
						<Th isNumeric>Stock</Th>
					</Tr>
				</Thead>
				<Tbody>
					{data?.items?.map((p) => (
						<Tr key={p._id}>
							<Td>{p.name}</Td>
							<Td>{p.sku}</Td>
							<Td isNumeric>
								<NumberInput size="sm" value={edits[p._id]?.price ?? p.price} onChange={(_, v) => setEdits((e) => ({ ...e, [p._id]: { ...e[p._id], price: v } }))}>
									<NumberInputField />
								</NumberInput>
							</Td>
							<Td isNumeric>
								<NumberInput size="sm" value={edits[p._id]?.stock ?? p.stock} onChange={(_, v) => setEdits((e) => ({ ...e, [p._id]: { ...e[p._id], stock: v } }))}>
									<NumberInputField />
								</NumberInput>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</Container>
	);
}