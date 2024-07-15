'use client'
import { Inter } from "next/font/google";
import "./globals.css";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import MedievalRainbowKitProvider from "./MedievalRainbowKitProvider";

const inter = Inter({ subsets: ["latin"] });

const config = getDefaultConfig({
  appName: 'Reunione',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '',
  chains: [sepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <MedievalRainbowKitProvider>
              <Layout>
                {children}
              </Layout>
            </MedievalRainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
