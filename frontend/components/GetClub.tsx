'use client'

import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, Address } from "viem";
import Image from "next/image";

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
  const [showAllMembers, setShowAllMembers] = useState(false);

  const { data: club, isError, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getClub",
    args: [id],
  } as const) as { data: ClubData | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  useEffect(() => {
    if (club) {
      onDataFetched(club);
    }
  }, [club, onDataFetched]);

  const getTimeRemaining = (endTime: string) => {
    const end = parseInt(endTime);
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = end - now;

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
        <p className="text-gray-600 mb-2">Time remaining: {getTimeRemaining(club.end)}</p>
        <p className="text-gray-600 mb-2">Membership: {formatEther(club.subscriptionPrice)} ETH</p>
        <p className="text-gray-600 mb-2">Owner: {truncateAddress(club.owner)}</p>
        <p className="text-gray-600 mb-2">Total collected: {formatEther(club.amountCollected)} ETH</p>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Members ({club.members.length})</h2>
          <button
            onClick={toggleMemberDisplay}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm mb-2"
          >
            {showAllMembers ? 'Show Less' : 'Show All'}
          </button>
          <ul className="list-disc list-inside">
            {club.members.slice(0, showAllMembers ? undefined : 5).map((member, index) => (
              <li key={index} className="text-gray-600">{truncateAddress(member)}</li>
            ))}
          </ul>
          {!showAllMembers && club.members.length > 5 && (
            <p className="text-gray-500 mt-2">...and {club.members.length - 5} more</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetClub;
