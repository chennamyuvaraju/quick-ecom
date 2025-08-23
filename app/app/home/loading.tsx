import { Container, Flex, Skeleton, SkeletonText, Stack } from "@chakra-ui/react";

export default function Loading() {
	return (
		<Container maxW={{ base: "full", md: "6xl" }} px={{ base: 4, md: 6 }} py={{ base: 6, md: 12 }}>
			<Flex direction={{ base: "column", md: "row" }} align="center" gap={{ base: 6, md: 10 }}>
				<Stack flex="1" gap={4}>
					<Skeleton height="24px" width="60%" />
					<SkeletonText noOfLines={3} spacing="2" />
					<Skeleton height="40px" width="180px" />
				</Stack>
				<Skeleton flex="1" height={{ base: "200px", md: "360px" }} />
			</Flex>
		</Container>
	);
}