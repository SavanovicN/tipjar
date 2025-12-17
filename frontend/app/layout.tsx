import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Tip Jar dApp",
	description: "A community tip jar dApp on Polygon Amoy Testnet",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
