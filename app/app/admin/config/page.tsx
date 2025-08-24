"use client";

import useSWR from "swr";
import { Container, Heading, Textarea } from "@chakra-ui/react";
import { SiteConfig } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminConfigPage() {
	const { data } = useSWR<SiteConfig>("/api/config", fetcher);
	return (
		<Container maxW="4xl" py={6}>
			<Heading size="lg" mb={4}>Site Config</Heading>
			<Textarea rows={20} value={JSON.stringify(data ?? {}, null, 2)} readOnly />
		</Container>
	);
}