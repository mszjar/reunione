'use client'

import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { contractAddress, abi } from "@/constants";

interface JoinClubProps {
  clubId: number;
  members: string[];
}

const JoinClub: React.FC<JoinClubProps> = ({ clubId, members }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [joinFee, setJoinFee] = useState<bigint | null>(null);
  const { address } = useAccount();

  const { data: hash, writeContract, error } = useWriteContract();

  const { data: calculatedFee } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'calculateJoinFee',
    args: [BigInt(clubId)],
  });

  useEffect(() => {
    if (calculatedFee) {
      setJoinFee(calculatedFee as bigint);
    }
  }, [calculatedFee]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const isAlreadyMember = address ? members.includes(address) : false;

  const handleJoin = async () => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    if (isAlreadyMember) {
      console.error('You are already a member of this club');
      return;
    }

    if (!joinFee) {
      console.error('Join fee not calculated yet');
      return;
    }

    setIsJoining(true);
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'joinClub',
        args: [BigInt(clubId)],
        value: joinFee,
      });
    } catch (err) {
      console.error('Error joining club:', err);
    } finally {
      setIsJoining(false);
    }
  };

  if (!address) {
    return <div>Please connect your wallet to join the club</div>;
  }

  if (isConfirming) return <div>Confirming transaction...</div>;
  if (isConfirmed) return <div className="text-green-600 font-bold">Successfully joined the club!</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (isAlreadyMember) {
    return <div className="text-green-600 font-bold">You are a member of this club</div>;
  }

  return (
    <div>
      {joinFee && (
        <div className="text-gray-700 text-sm mb-2">
          Current Membership: {formatEther(joinFee)} ETH
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={isJoining || isAlreadyMember || !joinFee}
        className={`${
          isAlreadyMember || !joinFee ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
        } text-white font-bold py-2 px-4 rounded`}
      >
        {isJoining ? 'Joining...' : 'Join Club'}
      </button>
    </div>
  );
};

export default JoinClub;
