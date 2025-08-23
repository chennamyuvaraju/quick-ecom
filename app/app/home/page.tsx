"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Button, CloseButton, Container, Flex, HStack, Heading, Icon, Image as CImage, Link as CLink, SimpleGrid, Stack, Text, useDisclosure, useToast } from "@chakra-ui/react";
import NextImage from "next/image";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { SiteConfig } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";

const MotionBox = motion(Box);

const ANNOUNCEMENT_KEY = "uc_announcement_dismissed_v1";

export default function HomePage() {
	const toast = useToast();
	const { data } = useQuery<SiteConfig>({
		queryKey: ["config"],
		queryFn: async () => {
			const res = await fetch("/api/config", { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load config");
			return res.json();
		},
		staleTime: 60_000,
	});

	const [announcementClosed, setAnnouncementClosed] = useState(false);
	useEffect(() => {
		setAnnouncementClosed(localStorage.getItem(ANNOUNCEMENT_KEY) === "1");
	}, []);

	const closeAnnouncement = () => {
		localStorage.setItem(ANNOUNCEMENT_KEY, "1");
		setAnnouncementClosed(true);
	};

	const siteInactive = data && data.siteActive === false;

	return (
		<Box>
			{data?.announcement?.enabled && !announcementClosed && (
				<Flex bg="teal.600" color="white" py={2} px={4} align="center" justify="center" gap={3} position="sticky" top={0} zIndex={20}>
					<Text fontSize="sm" textAlign="center">{data.announcement.message}</Text>
					<CloseButton size="sm" onClick={closeAnnouncement} aria-label="Dismiss" />
				</Flex>
			)}

			{siteInactive && (
				<Flex position="fixed" inset={0} bg="blackAlpha.700" color="white" align="center" justify="center" zIndex={50}>
					<Container textAlign="center">
						<Heading size="lg" mb={2}>Maintenance</Heading>
						<Text>{data?.announcement?.message ?? "We will be back soon."}</Text>
					</Container>
				</Flex>
			)}

			<Container maxW={{ base: "full", md: "6xl" }} px={{ base: 4, md: 6 }} py={{ base: 6, md: 12 }}>
				<Flex direction={{ base: "column", md: "row" }} align="center" gap={{ base: 6, md: 10 }}>
					<Stack flex="1" spacing={4}>
						<Heading as="h1" size={{ base: "lg", md: "2xl" }}>
							{data?.hero?.title ?? "UniqueCrackers"}
						</Heading>
						<Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
							{data?.hero?.subtitle ?? "Quick-buy ecommerce with OTP enquiries"}
						</Text>
						<HStack spacing={4}>
							{data?.hero?.ctas?.map((cta) => (
								<MotionBox key={cta.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
									<Button as={NextLink} href={cta.href} colorScheme="teal" size="md">
										{cta.label}
									</Button>
								</MotionBox>
							))}
						</HStack>
					</Stack>
					<Box flex="1" w="full" position="relative" minH={{ base: 200, md: 360 }}>
						{data?.hero?.image?.url && (
							<NextImage
								src={data.hero.image.url}
								alt={data.hero.image.alt ?? "Hero"}
								fill
								priority
								style={{ objectFit: "contain" }}
							/>
						)}
					</Box>
				</Flex>
			</Container>

			{/* Carousel */}
			{(data?.carouselImages?.length ?? 0) > 0 && (
				<Container maxW={{ base: "full", md: "6xl" }} px={{ base: 2, md: 6 }} py={{ base: 2, md: 6 }}>
					<Carousel images={data!.carouselImages!} />
				</Container>
			)}

			{/* KPIs */}
			{(data?.kpis?.length ?? 0) > 0 && (
				<Container maxW={{ base: "full", md: "6xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 10 }}>
					<SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
						{data!.kpis!.map((k, idx) => (
							<MotionBox key={idx} p={4} borderWidth="1px" rounded="md" whileHover={{ y: -2 }}>
								<Text fontSize="sm" color="gray.500">{k.label}</Text>
								<Heading size="md">{k.value}</Heading>
							</MotionBox>
						))}
					</SimpleGrid>
				</Container>
			)}

			{/* Footer */}
			<Box as="footer" py={8} textAlign="center" color="gray.600">
				<Text fontSize="sm">© {new Date().getFullYear()} UniqueCrackers</Text>
			</Box>
		</Box>
	);
}

function Carousel({ images }: { images: { url: string; alt?: string; href?: string }[] }) {
	const [idx, setIdx] = useState(0);
	const count = images.length;
	useEffect(() => {
		const id = setInterval(() => setIdx((i) => (i + 1) % count), 4000);
		return () => clearInterval(id);
	}, [count]);

	const handlers = useSwipeable({
		onSwipedLeft: () => setIdx((i) => (i + 1) % count),
		onSwipedRight: () => setIdx((i) => (i - 1 + count) % count),
		trackMouse: true,
	});

	return (
		<Box {...handlers} role="region" aria-roledescription="carousel" position="relative" overflow="hidden" rounded="md" borderWidth="1px">
			<Flex w="full" h={{ base: 160, md: 240 }} position="relative">
				{images.map((img, i) => (
					<Box key={img.url} position="absolute" inset={0} opacity={i === idx ? 1 : 0} transition="opacity 0.5s ease">
						{img.href ? (
							<NextLink href={img.href}>
								<NextImage src={img.url} alt={img.alt ?? ""} fill sizes="(max-width: 768px) 100vw, 1200px" style={{ objectFit: "cover" }} />
							</NextLink>
						) : (
							<NextImage src={img.url} alt={img.alt ?? ""} fill sizes="(max-width: 768px) 100vw, 1200px" style={{ objectFit: "cover" }} />
						)}
					</Box>
				))}
			</Flex>
			<HStack position="absolute" bottom={2} left="50%" transform="translateX(-50%)" gap={2}>
				{images.map((_, i) => (
					<Box key={i} w={2} h={2} rounded="full" bg={i === idx ? "teal.500" : "whiteAlpha.800"} borderColor="blackAlpha.300" borderWidth="1px" />
				))}
			</HStack>
		</Box>
	);
}