'use client'

import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { contractAddress, abi } from "@/constants";

interface WithdrawFundsProps {
  clubId: number;
  clubEnded: boolean;
  isMember: boolean;
}

const WithdrawFunds: React.FC<WithdrawFundsProps> = ({ clubId, clubEnded, isMember }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { address } = useAccount();

  const { data: hash, writeContract, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWithdraw = async () => {
    if (!clubEnded || !isMember) {
      console.error('Cannot withdraw: Club not ended or not a member');
      return;
    }

    setIsWithdrawing(true);
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'withdraw',
        args: [BigInt(clubId)],
      });
    } catch (err) {
      console.error('Error withdrawing funds:', err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isConfirming) return <div>Confirming withdrawal...</div>;
  if (isConfirmed) return <div>Successfully withdrawn funds!</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!clubEnded) {
    return <div className="text-yellow-600 font-bold">Club has not ended yet. Withdrawal not available.</div>;
  }

  if (!isMember) {
    return <div className="text-red-600 font-bold">You are not a member of this club.</div>;
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={isWithdrawing || !clubEnded || !isMember}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      {isWithdrawing ? 'Withdrawing...' : 'Withdraw Funds'}
    </button>
  );
};

export default WithdrawFunds;
