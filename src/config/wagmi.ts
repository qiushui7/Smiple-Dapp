import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    // 从 WalletConnect Cloud 获取的 Project ID
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    // 你的dApp名称，可以自定义
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Simple DApp",
    // 支持的链
    chains: [sepolia],
    transports: {
      // RPC URL for each chain
      [sepolia.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    },
  })
); 