import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useContract } from "@/hooks/useContract";
import { ethers } from "ethers";
import { ProDepositAbi } from "@/types/contracts"; // 导入合约类型

// 定义错误类型
interface ErrorState {
  type: 'error' | 'warning' | 'success';
  message: string;
}

export function ContractInteraction() {
  const { address } = useAccount();
  const contract = useContract();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [interest, setInterest] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState<ErrorState | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerDepositAmount, setOwnerDepositAmount] = useState("");

  // 自动清除错误信息
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // 5秒后自动清除错误信息
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 检查是否为 owner
  useEffect(() => {
    const checkOwner = async () => {
      if (!contract || !address) return;
      try {
        const ownerAddress = await contract.owner();
        setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error("检查 owner 失败:", error);
      }
    };

    checkOwner();
  }, [contract, address]);

  // 处理错误信息
  const handleError = (error: any) => {
    let message = error.message;
    let type: ErrorState['type'] = 'error';

    // 处理常见错误类型
    if (message.includes("insufficient funds")) {
      message = "余额不足，请检查您的钱包余额";
    } else if (message.includes("user rejected")) {
      message = "您取消了交易";
      type = 'warning';
    } else if (message.includes("cannot withdraw more than balance")) {
      message = "提款金额超过可用余额";
    } else if (message.toLowerCase().includes("nonce")) {
      message = "交易 nonce 错误，请刷新页面重试";
    }

    setError({ type, message });
  };

  // 查询余额和利息
  const fetchBalanceAndInterest = async () => {
    if (!contract || !address) return;
    
    try {
      // 使用生成的类型，获得更好的类型提示
      const userDeposit = await contract.userDeposits(address);
      const interestWei = await contract.calculateInterest(address);
      
      // userDeposit 现在有正确的类型提示
      setBalance(ethers.utils.formatEther(userDeposit.amount));
      setInterest(ethers.utils.formatEther(interestWei));
      setError({ type: 'success', message: '数据更新成功' });
    } catch (error: any) {
      console.error("查询失败:", error);
      handleError(error);
    }
  };

  // 存款
  const handleDeposit = async () => {
    if (!contract || !depositAmount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 使用类型化的合约方法
      const tx = await contract.deposit({
        value: ethers.utils.parseEther(depositAmount)
      });
      setError({ type: 'success', message: '交易已提交，等待确认...' });
      await tx.wait();
      setError({ type: 'success', message: '存款成功！' });
      await fetchBalanceAndInterest();
      setDepositAmount("");
    } catch (error: any) {
      console.error("存款失败:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // 提款
  const handleWithdraw = async () => {
    if (!contract || !withdrawAmount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 使用类型化的合约方法
      const tx = await contract.withdraw(
        ethers.utils.parseEther(withdrawAmount)
      );
      setError({ type: 'success', message: '交易已提交，等待确认...' });
      await tx.wait();
      setError({ type: 'success', message: '提款成功！' });
      await fetchBalanceAndInterest();
      setWithdrawAmount("");
    } catch (error: any) {
      console.error("提款失败:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // 添加 owner 存款功能
  const handleOwnerDeposit = async () => {
    if (!contract || !ownerDepositAmount || !isOwner) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const tx = await contract.ownerDeposit({
        value: ethers.utils.parseEther(ownerDepositAmount)
      });
      setError({ type: 'success', message: '交易已提交，等待确认...' });
      await tx.wait();
      setError({ type: 'success', message: 'Owner 存款成功！' });
      await fetchBalanceAndInterest();
      setOwnerDepositAmount("");
    } catch (error: any) {
      console.error("Owner 存款失败:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">存款合约</h2>
        
        {/* 地址显示 */}
        <div className="backdrop-blur-sm bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white/80">
            当前连接地址: 
            <span className="font-mono text-white ml-2 break-all">
              {address || '未连接'}
            </span>
          </p>
          {isOwner && (
            <p className="text-white/80 mt-2">
              ✨ 您是合约拥有者
            </p>
          )}
        </div>

        {/* 余额和利息显示 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="backdrop-blur-sm bg-white/5 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">当前存款</p>
            <p className="text-white font-mono text-lg">{balance} ETH</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-1">当前利息</p>
            <p className="text-white font-mono text-lg">{interest} ETH</p>
          </div>
        </div>

        {/* Owner 专属功能 */}
        {isOwner && (
          <div className="mb-6 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Owner 功能</h3>
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                step="0.01"
                value={ownerDepositAmount}
                onChange={(e) => setOwnerDepositAmount(e.target.value)}
                placeholder="输入 Owner 存款金额"
                className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white 
                         placeholder-white/50 outline-none focus:ring-2 ring-purple-500"
              />
              <button
                onClick={handleOwnerDeposit}
                disabled={loading || !ownerDepositAmount}
                className="bg-gradient-to-r from-green-600 to-teal-600 
                         hover:from-green-500 hover:to-teal-500
                         text-white font-medium py-2 px-6 rounded-lg
                         transition-all duration-200 transform hover:scale-105
                         shadow-lg hover:shadow-xl
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⚡</span>
                    处理中...
                  </>
                ) : (
                  'Owner 存款'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 存款操作 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">存款功能</h3>
          <div className="flex gap-4 mb-4">
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="输入存款金额"
              className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white 
                       placeholder-white/50 outline-none focus:ring-2 ring-purple-500"
            />
            <button
              onClick={handleDeposit}
              disabled={!address || loading || !depositAmount}
              className="bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-500 hover:to-pink-500
                       text-white font-medium py-2 px-6 rounded-lg
                       transition-all duration-200 transform hover:scale-105
                       shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {loading ? '处理中...' : '存款'}
            </button>
          </div>
        </div>

        {/* 提款操作 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">提款功能</h3>
          <div className="flex gap-4 mb-4">
            <input
              type="number"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="输入提款金额"
              className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white 
                       placeholder-white/50 outline-none focus:ring-2 ring-purple-500"
            />
            <button
              onClick={handleWithdraw}
              disabled={!address || loading || !withdrawAmount}
              className="bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-500 hover:to-pink-500
                       text-white font-medium py-2 px-6 rounded-lg
                       transition-all duration-200 transform hover:scale-105
                       shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {loading ? '处理中...' : '提款'}
            </button>
          </div>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={fetchBalanceAndInterest}
          disabled={!address || loading}
          className="w-full bg-white/10 hover:bg-white/20
                   text-white font-medium py-2 rounded-lg
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          刷新余额和利息
        </button>

        {/* 优化后的错误/提示信息显示 */}
        {error && (
          <div className={`mt-4 p-4 rounded-lg flex items-center justify-between
                        ${error.type === 'error' ? 'bg-red-500/20' : ''}
                        ${error.type === 'warning' ? 'bg-yellow-500/20' : ''}
                        ${error.type === 'success' ? 'bg-green-500/20' : ''}`}>
            <div className="flex items-center gap-2">
              {error.type === 'error' && (
                <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {error.type === 'warning' && (
                <svg className="w-5 h-5 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {error.type === 'success' && (
                <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <p className={`${error.type === 'error' ? 'text-red-200' : ''}
                           ${error.type === 'warning' ? 'text-yellow-200' : ''}
                           ${error.type === 'success' ? 'text-green-200' : ''}`}>
                {error.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 