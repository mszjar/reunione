'use client'

import React, { useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, Address } from "viem";
import Image from "next/image";

interface GetClubProps {
  id: number;
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

const GetClub = ({ id }: GetClubProps) => {
  const { data: club, isError, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getClub",
    args: [id],
  } as const) as { data: ClubData | undefined; isError: boolean; isLoading: boolean; error: Error | null };

  useEffect(() => {
    console.log("Contract Address:", contractAddress);
    console.log("ABI:", abi);
    console.log("Club ID:", id);
  }, [id]);

  const dateManagement = (data: string) => {
    const date = parseInt(data);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const durationInSeconds = date - currentTimestamp;
    const durationInDays = Math.ceil(durationInSeconds / 86400);
    return durationInDays;
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    console.error("Error fetching club data:", error);
    return <div>Error fetching club data: {error?.message || 'Unknown error'}</div>;
  }
  if (!club) return <div>No club found for ID: {id}</div>;

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
        <p className="text-gray-600 mb-2">Remaining days: {dateManagement(club.end)}</p>
        <p className="text-gray-600 mb-2">Membership: {formatEther(club.subscriptionPrice)} ETH</p>
        <p className="text-gray-600 mb-2">Owner: {club.owner}</p>
        <p className="text-gray-600 mb-2">Members: {club.members.length}</p>
        <p className="text-gray-600">Total collected: {formatEther(club.amountCollected)} ETH</p>
      </div>
    </div>
  );
};

export default GetClub;
