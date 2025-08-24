"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/lib/cartStore";
import { useState } from "react";
import { Button, Container, FormControl, FormErrorMessage, FormLabel, HStack, Heading, Input, Stack, Textarea, useToast } from "@chakra-ui/react";
import { CartValidationResponse, ValidatedCartItem } from "@/lib/types";

const schema = z.object({
	name: z.string().min(2),
	phone: z.string().min(8),
	email: z.string().email().optional().or(z.literal("")),
	address: z.string().min(5),
	notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
	const cart = useCartStore();
	const toast = useToast();
	const [otpSent, setOtpSent] = useState(false);
	const [otpVerified, setOtpVerified] = useState<string | null>(null);
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

	const sendOtp = async (phone: string) => {
		const res = await fetch("/api/otp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone }) });
		if (res.ok) { setOtpSent(true); toast({ title: "OTP sent", status: "success" }); } else { toast({ title: "Failed to send OTP", status: "error" }); }
	};
	const verifyOtp = async (phone: string) => {
		const res = await fetch("/api/otp/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone, otp }) });
		if (res.ok) { const json = await res.json(); setOtpVerified(json.otpToken as string); toast({ title: "OTP verified", status: "success" }); } else { toast({ title: "Invalid OTP", status: "error" }); }
	};

	const onSubmit = async (values: FormValues) => {
		if (!otpVerified) { toast({ title: "Verify phone via OTP", status: "warning" }); return; }
		setLoading(true);
		// final validate
		const valRes = await fetch("/api/cart/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: cart.items.map((i) => ({ productId: i.id, qty: i.qty })) }) });
		const validation = (await valRes.json()) as CartValidationResponse;
		const mismatch = validation.items.some((it: ValidatedCartItem, idx: number) => it.qtySuggested !== cart.items[idx]?.qty);
		if (mismatch) {
			toast({ title: "Cart updated on server. Please review.", status: "warning" });
			setLoading(false);
			return;
		}
		const orderRes = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customer: { name: values.name, phone: values.phone, email: values.email }, address: { line1: values.address }, transport: {}, items: cart.items.map((i) => ({ productId: i.id, qty: i.qty })), otpToken: otpVerified, notes: values.notes }) });
		if (orderRes.status === 409) {
			toast({ title: "Items changed. Please confirm & resubmit.", status: "warning" });
		} else if (orderRes.ok) {
			const json = await orderRes.json();
			toast({ title: `Enquiry submitted #${json.orderId}`, status: "success" });
			cart.clear();
		} else {
			toast({ title: "Failed to submit order", status: "error" });
		}
		setLoading(false);
	};

	return (
		<Container maxW={{ base: "full", md: "2xl" }} py={6}>
			<Heading size="lg" mb={4}>Checkout / Submit Enquiry</Heading>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={4}>
					<FormControl isInvalid={!!errors.name}>
						<FormLabel>Name</FormLabel>
						<Input {...register("name")} />
						<FormErrorMessage>{errors.name?.message}</FormErrorMessage>
					</FormControl>
					<FormControl isInvalid={!!errors.phone}>
						<FormLabel>Phone</FormLabel>
						<Input {...register("phone")} />
						<FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
					</FormControl>
					<HStack>
						<Button size="sm" onClick={(e) => { e.preventDefault(); const phone = (document.querySelector("input[name='phone']") as HTMLInputElement)?.value; if (phone) sendOtp(phone); }}>Send OTP</Button>
						<Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
						<Button size="sm" onClick={(e) => { e.preventDefault(); const phone = (document.querySelector("input[name='phone']") as HTMLInputElement)?.value; if (phone) verifyOtp(phone); }} isDisabled={!otp}>Verify</Button>
					</HStack>
					<FormControl isInvalid={!!errors.address}>
						<FormLabel>Address</FormLabel>
						<Textarea rows={3} {...register("address")} />
						<FormErrorMessage>{errors.address?.message}</FormErrorMessage>
					</FormControl>
					<FormControl>
						<FormLabel>Notes</FormLabel>
						<Textarea rows={3} {...register("notes")} />
					</FormControl>
					<Button colorScheme="teal" type="submit" isLoading={isSubmitting || loading} isDisabled={!otpVerified || cart.items.length === 0}>Place Enquiry</Button>
				</Stack>
			</form>
		</Container>
	);
}