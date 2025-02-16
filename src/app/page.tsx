'use client'

import { ContractInteraction } from "@/components/ContractInteraction";
import { Web3Provider } from "@/components/Web3Provider";
import { ConnectKitButton } from "connectkit";

export default function Home() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8">
        <div className="max-w-4xl mx-auto">
          {/* 导航栏 */}
          <nav className="backdrop-blur-md bg-white/30 rounded-lg p-4 mb-8 flex justify-between items-center shadow-lg">
            <h1 className="text-2xl font-bold text-white">Simple DApp</h1>
            <ConnectKitButton />
          </nav>

          {/* 主要内容区域 */}
          <main className="backdrop-blur-md bg-white/20 rounded-lg p-6 shadow-lg">
            <ContractInteraction />
          </main>
        </div>
      </div>
    </Web3Provider>
  );
}
