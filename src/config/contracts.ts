import { ContractConfig } from "@/types/contract";
import proDepositAbi from "@/abi/proDepositAbi.json";

// 可以根据不同环境配置不同的合约地址
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const ProDepositContract: ContractConfig = {
  address: CONTRACT_ADDRESS,
  abi: proDepositAbi,
} as const;

// 如果有多个合约，可以都在这里配置
export const contracts = {
  proDeposit: ProDepositContract,
} as const; 