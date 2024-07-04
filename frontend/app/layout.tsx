'use client'
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hardhat
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { Layout } from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Reunione",
//   description: "Defi clubs",
// };

const config = getDefaultConfig({
  appName: 'Reunione',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '',
  chains: [hardhat],
  ssr: true, // If your dApp uses server side rendering (SSR)
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
            <RainbowKitProvider theme={darkTheme({accentColor: '#dfbe2c', accentColorForeground: 'black'})}>
              <Layout>
                {children}
              </Layout>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
