"use client";

import { useInfiniteQuery, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Box, Button, Container, Flex, HStack, Heading, IconButton, Image, Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Select, SimpleGrid, Spacer, Spinner, Table, Tbody, Td, Th, Thead, Tr, Text, Drawer, DrawerContent, DrawerHeader, DrawerOverlay, DrawerBody, useDisclosure, useToast, Badge, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import NextLink from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { Product } from "@/lib/types";

const PAGE_SIZE = 50;

export default function QuickBuyPage() {
	const toast = useToast();
	const [search, setSearch] = useState("");
	const [brand, setBrand] = useState("");
	const [category, setCategory] = useState("");
	const [page, setPage] = useState(1);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cart = useCartStore();

	const { data, isLoading } = useQuery<{ items: Product[]; page: number; pageSize: number; total: number }>({
		queryKey: ["products", { page, search, brand, category }],
		queryFn: async () => {
			const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), search, brand, category });
			const res = await fetch(`/api/products?${params.toString()}`);
			if (!res.ok) throw new Error("Failed to load products");
			return res.json();
		},
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		// on first add, open cart on mobile
		if (cart.items.length > 0 && window.innerWidth < 768) onOpen();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart.items.length]);

	const totalPages = useMemo(() => Math.ceil((data?.total || 0) / PAGE_SIZE), [data?.total]);

	return (
		<Container maxW={{ base: "full", md: "7xl" }} px={{ base: 2, md: 4 }} py={4}>
			<Heading size="lg" mb={4}>Quick Buy</Heading>
			<Flex gap={2} wrap="wrap" mb={3}>
				<Input placeholder="Search by name/SKU/slug" value={search} onChange={(e) => setSearch(e.target.value)} maxW="sm" />
				<Select placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} maxW="xs">
					<option value="Mixed">Mixed</option>
					<option value="BrandA">BrandA</option>
					<option value="BrandB">BrandB</option>
				</Select>
				<Select placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} maxW="xs">
					<option value="family-packs">family-packs</option>
					<option value="sparklers">sparklers</option>
					<option value="rockets">rockets</option>
				</Select>
				<Spacer />
				<Button onClick={() => setPage(1)}>Apply</Button>
			</Flex>

			<Flex gap={4} align="start">
				<Box flex="1" overflowX="auto">
					<Table size="sm" variant="simple">
						<Thead>
							<Tr>
								<Th>SNo</Th>
								<Th>Image</Th>
								<Th>Name</Th>
								<Th>SKU</Th>
								<Th>Brand</Th>
								<Th>Category</Th>
								<Th isNumeric>Price</Th>
								<Th isNumeric>Stock</Th>
								<Th isNumeric>Qty</Th>
								<Th isNumeric>Amount</Th>
							</Tr>
						</Thead>
						<Tbody>
							{isLoading && (
								<Tr><Td colSpan={10}><Spinner size="sm" /></Td></Tr>
							)}
							{data?.items.map((p, idx) => (
								<ProductRow key={p._id} index={(page - 1) * PAGE_SIZE + idx + 1} product={p} />
							))}
						</Tbody>
					</Table>

					<Flex justify="space-between" mt={3}>
						<Button onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page === 1}>Previous</Button>
						<Text>Page {page} / {totalPages || 1}</Text>
						<Button onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))} isDisabled={page >= (totalPages || 1)}>Next</Button>
					</Flex>
				</Box>

				<CartSummary isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
			</Flex>
		</Container>
	);
}

function ProductRow({ index, product }: { index: number; product: Product }) {
	const cart = useCartStore();
	const [qty, setQty] = useState<number>(0);
	useEffect(() => {
		const found = cart.items.find((i) => i.id === product._id);
		setQty(found?.qty || 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart.items.length]);

	const clampQty = (n: number) => Math.max(0, Math.min(n, Math.max(0, product.stock)));

	useEffect(() => {
		setQty((q) => clampQty(q));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product.stock]);

	const update = (n: number) => {
		const v = clampQty(n);
		setQty(v);
		if (v === 0) cart.remove(product._id);
		else cart.updateQty(product._id, v);
	};

	const add = () => {
		if (qty === 0) {
			cart.add({ id: product._id, name: product.name, image: product.image, priceClient: product.price, qty: 1 });
			setQty(1);
		} else update(qty + 1);
	};

	return (
		<Tr opacity={product.stock === 0 ? 0.6 : 1}>
			<Td>{index}</Td>
			<Td>
				<Box position="relative" w="60px" h="40px">
					<NextImage src={product.image} alt={product.name} fill sizes="120px" style={{ objectFit: "cover" }} />
				</Box>
			</Td>
			<Td>
				<VStack align="start" spacing={0}>
					<Text fontWeight="medium" noOfLines={1}>{product.name}</Text>
					<Text fontSize="xs" color="gray.500">{product.packageType} · {product.piecesPerBox || 1} pcs</Text>
				</VStack>
			</Td>
			<Td>{product.sku}</Td>
			<Td>{product.brand}</Td>
			<Td>{product.category}</Td>
			<Td isNumeric>₹{product.price}</Td>
			<Td isNumeric>
				{product.stock > 0 ? product.stock : <Badge colorScheme="red">Out</Badge>}
			</Td>
			<Td isNumeric>
				<NumberInput size="sm" value={qty} min={0} max={Math.max(0, product.stock)} onChange={(_, v) => update(v)} isDisabled={product.stock === 0}>
					<NumberInputField />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</NumberInput>
			</Td>
			<Td isNumeric>₹{(qty * product.price).toFixed(0)}</Td>
		</Tr>
	);
}

function CartSummary({ isOpen, onOpen, onClose }: { isOpen: boolean; onOpen: () => void; onClose: () => void }) {
	const cart = useCartStore();
	const subtotal = cart.items.reduce((s, i) => s + i.qty * i.priceClient, 0);
	return (
		<Box position={{ base: "fixed", md: "sticky" }} bottom={{ base: 0, md: "auto" }} top={{ md: 4 }} right={{ md: 0 }} w={{ base: "full", md: 80 }} borderWidth="1px" rounded="md" p={3} bg={{ base: "white", _dark: "gray.800" }} zIndex={10}>
			<Flex justify="space-between" align="center">
				<Heading size="sm">Cart</Heading>
				<Button size="sm" onClick={onOpen} display={{ base: "inline-flex", md: "none" }}>Open</Button>
			</Flex>
			<VStack align="stretch" mt={3} spacing={2} maxH={{ md: "60vh" }} overflowY="auto">
				{cart.items.length === 0 && <Text fontSize="sm" color="gray.500">No items</Text>}
				{cart.items.map((it) => (
					<Flex key={it.id} justify="space-between" align="center">
						<Text noOfLines={1}>{it.name}</Text>
						<Text>×{it.qty}</Text>
						<Text>₹{(it.qty * it.priceClient).toFixed(0)}</Text>
					</Flex>
				))}
			</VStack>
			<Flex justify="space-between" mt={3}>
				<Text fontWeight="bold">Subtotal</Text>
				<Text fontWeight="bold">₹{subtotal.toFixed(0)}</Text>
			</Flex>
			<Button colorScheme="teal" as={NextLink} href="/checkout" mt={3} isDisabled={cart.items.length === 0}>Proceed to Enquiry</Button>

			<Drawer isOpen={isOpen} onClose={onClose} placement="right">
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader>Cart</DrawerHeader>
					<DrawerBody>
						<VStack align="stretch" spacing={2}>
							{cart.items.map((it) => (
								<Flex key={it.id} justify="space-between" align="center">
									<Text noOfLines={1}>{it.name}</Text>
									<Text>×{it.qty}</Text>
									<Text>₹{(it.qty * it.priceClient).toFixed(0)}</Text>
								</Flex>
							))}
						</VStack>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</Box>
	);
}