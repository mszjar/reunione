'use client'

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { contractAddress, abi } from "@/constants";
import { formatEther } from "viem";
import { Club } from "@/types";
import Image from "next/image";
import Link from "next/link";

const GetClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);

  const { data: clubsData, isError, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getClubs",
  });

  useEffect(() => {
    if (clubsData) {
      setClubs(clubsData as Club[]);
    }
  }, [clubsData]);

  useEffect(() => {
    refetch();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const dateManagement = (data: string) => {
    let date = parseInt(data)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const durationInSeconds = date - currentTimestamp;
    const durationInDays = Math.ceil(durationInSeconds / 86400);
    return durationInDays;
  }

  if (isLoading) return <div>Loading clubs...</div>;
  if (isError) return <div>Error fetching clubs</div>;

  return (
    <div className="get">
      <div className="get_inner">
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clubs.map((club: Club, index: number) => (
            <Link href={`/clubs/${index}-${generateSlug(club.title)}`} key={index}>
              <div className="group cursor-pointer overflow-hidden rounded-2xl border duration-300 ease-in-out mb-5">
                <Image
                  src={club.image}
                  alt={club.title}
                  width={600}
                  height={400}
                  className="object-contain transition-all group-hover:bg-gray-800 group-hover:opacity-80 h-40 w-full"
                />
                <div className='flex flex-col p-4 transition-all group-hover:bg-zinc-300 bg-gray-200'>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-2xl font-bold">{club.title}</p>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{club.description}</p>
                  <p className="text-gray-600 text-sm mb-2">Remaining days: {dateManagement(club.end)}</p>
                  <p className="text-gray-600 text-sm mb-2">Base Membership: {formatEther(BigInt(club.subscriptionPrice))} ETH</p>
                  <p className="text-gray-600 text-xs mb-2">Owner: {club.owner}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GetClubs
