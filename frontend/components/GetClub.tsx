'use client'

import React, { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, Address } from "viem";
import Image from "next/image";
import { Button } from './ui/button';

interface GetClubProps {
  id: number;
  onDataFetched: (data: any) => void;
}

interface ClubData {
  owner: Address;
  title: string;
  description: string;
  end: string;
  amountCollected: bigint;
  image: string;
  members: Address[];
  subscriptionPrice: bigint;
}

const GetClub = ({ id, onDataFetched }: GetClubProps) => {
  const [showAllMembers, setShowAllMembers] = useState(true);
  const [currentBlockTime, setCurrentBlockTime] = useState<number | null>(null);

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const { data: club, isError, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getClub",
    args: [id],
  } as const) as { data: ClubData | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({hash});

  useEffect(() => {
    if (club) {
      onDataFetched(club);
    }
  }, [club, onDataFetched]);

  const fetchBlockTimestamp = async () => {
    if (publicClient) {
      try {
        const block = await publicClient.getBlock({ blockTag: 'latest' });
        setCurrentBlockTime(Number(block.timestamp));
      } catch (error) {
        console.error("Error fetching block timestamp:", error);
      }
    }
  };

  useEffect(() => {
    fetchBlockTimestamp();
    const timer = setInterval(fetchBlockTimestamp, 10000); // Refetch every 10 seconds

    return () => clearInterval(timer);
  }, [publicClient]);

  const hasClubEnded = (endTime: string): boolean => {
    if (currentBlockTime === null) return false;
    const end = parseInt(endTime);
    return currentBlockTime >= end;
  };

  const getTimeRemaining = (endTime: string) => {
    if (currentBlockTime === null) return "Loading...";

    const end = parseInt(endTime);
    const timeLeft = end - currentBlockTime;

    if (timeLeft <= 0) return "Club has ended";

    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
    }
  }

  const handleWithdraw = async () => {
    if (!club || !hasClubEnded(club.end)) {
      console.error("Cannot withdraw: Club has not ended yet");
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'withdraw',
        args: [id],
      });
    } catch (err) {
      console.error("Error withdrawing funds:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    console.error("Error fetching club data:", error);
    return <div>Error fetching club data: {error?.message}</div>;
  }
  if (!club) return <div>No club found for ID: {id}</div>;

  const toggleMemberDisplay = () => {
    setShowAllMembers(!showAllMembers);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMember = club.members.includes(address as Address);
  const clubEnded = hasClubEnded(club.end);

  return (
    <div className="club-details">
      <Image
        src={club.image}
        alt={club.title}
        width={600}
        height={400}
        className="object-contain h-60 w-full rounded-t-2xl"
      />
      <div className='p-4 bg-gray-100 rounded-b-2xl'>
        <h1 className="text-3xl font-bold mb-2">{club.title}</h1>
        <p className="text-gray-600 mb-4">{club.description}</p>
        <p className="text-gray-600 mb-2">Status: {clubEnded ? "Ended" : "Active"}</p>
        <p className="text-gray-600 mb-2">Time remaining: {getTimeRemaining(club.end)}</p>
        <p className="text-gray-600 mb-2">Current Block Time: {currentBlockTime ? new Date(currentBlockTime * 1000).toLocaleString() : 'Loading...'}</p>
        <p className="text-gray-600 mb-2">Membership: {formatEther(club.subscriptionPrice)} ETH</p>
        <p className="text-gray-600 mb-2">Owner: {truncateAddress(club.owner)}</p>
        <p className="text-gray-600 mb-2">Total collected: {formatEther(club.amountCollected)} ETH</p>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Members ({club.members.length})</h2>
          <ul className="list-disc list-inside">
            {club.members.slice(0, showAllMembers ? undefined : 5).map((member, index) => (
              <li key={index} className="text-gray-600">{truncateAddress(member)}</li>
            ))}
          </ul>
          <button
            onClick={toggleMemberDisplay}
            className="text-gray-500 text-xs mb-2"
          >
            {showAllMembers ? 'Show Less' : 'Show All'}
          </button>
          {!showAllMembers && club.members.length > 5 && (
            <p className="text-gray-500 mt-2">...and {club.members.length - 5} more</p>
          )}
        </div>

        {isMember && (
          <div className="mt-4">
            <p className="text-gray-600 mb-2">You are a member of this club</p>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawLoading || !clubEnded}
            >
              {isWithdrawLoading ? 'Withdrawing...' : 'Withdraw Funds'}
            </Button>
            {!clubEnded && <div className="text-gray-500 text-xs mt-2">Club has not ended yet. Withdrawal not available.</div>}
            {isWithdrawSuccess && <div className="text-green-500 text-xs mt-2">Funds withdrawn successfully!</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetClub;
