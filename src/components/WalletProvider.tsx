"use client";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import {
  arbitrum,
  celo,
  base,
  scroll,
  mainnet,
  polygon,
  filecoin,
  zetachainAthensTestnet,
  mantle,
  xdc,
} from "viem/chains";

const projectId = "2a2a5978a58aad734d13a2d194ec469a";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [
  arbitrum,
  celo,
  base,
  scroll,
  mainnet,
  polygon,
  filecoin,
  zetachainAthensTestnet,
  mantle,
  xdc,
];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeVariables: {
    "--w3m-color-mix": "#8095f8",
    "--w3m-color-mix-strength": 15,
    "--w3m-border-radius-master": "0.1rem",
  },
});
export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}

export default WalletContextProvider;
