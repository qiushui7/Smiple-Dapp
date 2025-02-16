import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ProDepositContract } from "@/config/contracts";
import { ProDepositAbi } from "@/types/contracts"; // 导入生成的合约类型
import { ProDepositAbi__factory } from "@/types/contracts"; // 导入生成的合约工厂函数

export function useContract() {
  const { data: walletClient } = useWalletClient();
  const [contract, setContract] = useState<ProDepositAbi | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (!walletClient || !address) return;

    // 创建 ethers provider 和 signer
    const provider = new ethers.providers.Web3Provider(walletClient as any);
    const signer = provider.getSigner();

    // 使用 typechain 生成的工厂函数创建合约实例
    const contractInstance = ProDepositAbi__factory.connect(
      ProDepositContract.address,
      signer
    );

    setContract(contractInstance);
  }, [walletClient, address]);

  return contract;
} 