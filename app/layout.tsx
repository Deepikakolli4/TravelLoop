import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";




export const metadata: Metadata = {
  title: {
    default: "Travel Loop",
    template: "%s | Travel Loop",
  },
  description: "Plan, save, and manage personalized travel itineraries with Travel Loop.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

const outfit = Outfit({subsets:['latin']})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={outfit.className}>
        <ConvexClientProvider>
           {children}
        </ConvexClientProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
