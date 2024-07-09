'use client'

import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, abi } from "@/constants";

interface JoinClubProps {
  clubId: number;
  subscriptionPrice: bigint;
  members: string[];
}

const JoinClub: React.FC<JoinClubProps> = ({ clubId, subscriptionPrice, members }) => {
  const [isJoining, setIsJoining] = useState(false);
  const { address } = useAccount();

  const { data: hash, writeContract, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const isAlreadyMember = members.includes(address);

  const handleJoin = async () => {
    if (isAlreadyMember) {
      console.error('You are already a member of this club');
      return;
    }

    setIsJoining(true);
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'joinClub',
        args: [BigInt(clubId)],
        value: subscriptionPrice,
      });
    } catch (err) {
      console.error('Error joining club:', err);
    } finally {
      setIsJoining(false);
    }
  };

  if (isConfirming) return <div>Confirming transaction...</div>;
  if (isConfirmed) return <div className="text-green-600 font-bold">Successfully joined the club!</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (isAlreadyMember) {
    return <div className="text-green-600 font-bold">You are a member of this club</div>;
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isJoining || isAlreadyMember}
      className={`${
        isAlreadyMember ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
      } text-white font-bold py-2 px-4 rounded`}
    >
      {isJoining ? 'Joining...' : 'Join Club'}
    </button>
  );
};

export default JoinClub;
