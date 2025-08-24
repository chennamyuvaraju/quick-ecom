"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const theme = extendTheme({
	config: {
		initialColorMode: "system",
		useSystemColorMode: true,
	},
	styles: {
		global: {
			"html, body, #__next": {
				height: "100%",
			},
		},
	},
});

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<ChakraProvider theme={theme}>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
				<Toaster position="top-right" />
			</QueryClientProvider>
		</ChakraProvider>
	);
}