export type Address = `0x${string}`;

// 合约配置类型
export interface ContractConfig {
  address: Address;
  abi: any[];
} 