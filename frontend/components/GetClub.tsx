import React, { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, parseEther, Address } from "viem";
import Image from "next/image";
import { Button } from './ui/button';
import JoinClub from './JoinClub';
import CreatePost from './CreatePost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PostList from './PostList';

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
  publicPostFee: bigint;
}

const GetClub: React.FC<GetClubProps> = ({ id, onDataFetched }) => {
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [currentBlockTime, setCurrentBlockTime] = useState<number | null>(null);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [memberShare, setMemberShare] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  const { data: club, isError, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getClub",
    args: [id],
  } as const) as { data: ClubData | undefined; isError: boolean; isLoading: boolean; error: Error | null; refetch: () => void };

  const { data: isMember, isLoading: isMemberLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "isMember",
    args: isConnected ? [id, address] : undefined,
  } as const);

  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({hash});

  useEffect(() => {
    if (club) {
      onDataFetched(club);
      if (isConnected && club.members.length > 0) {
        const calculatedShare = club.amountCollected / BigInt(club.members.length);
        setMemberShare(formatEther(calculatedShare));
      } else {
        setMemberShare(null);
      }
    }
  }, [club, onDataFetched, isConnected]);

  useEffect(() => {
    if (isConnected && !isMemberLoading && isMember !== undefined) {
      setHasWithdrawn(!isMember);
    }
  }, [isMember, isMemberLoading, isConnected]);

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
    if (!club || !hasClubEnded(club.end) || !address) {
      console.error("Cannot withdraw: Club has not ended yet or no wallet connected");
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'withdraw',
        args: [id],
      });

      setHasWithdrawn(true);
      refetch(); // Refetch club data after withdrawal
    } catch (err) {
      console.error("Error withdrawing funds:", err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) return <Skeleton className="w-full h-60" />;
  if (isError) {
    console.error("Error fetching club data:", error);
    return <div>Error fetching club data: {error?.message}</div>;
  }
  if (!club) return <div>No club found for ID: {id}</div>;

  const clubEnded = hasClubEnded(club.end);
  const isCurrentMember = isConnected && club.members.includes(address as Address);

  return (
    <div className="">

      <div className='flex justify-between'>

        <Card>
          <CardContent className="p-6">
            <div className="gap-6">
              <div className="">
                <Image
                  src={club.image}
                  alt={club.title}
                  width={150}
                  height={100}
                  className="object-contain h-60 w-full p-6 rounded-lg"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <h1 className="text-2xl font-bold">{club.title}</h1>
                <p className="pb-2">{club.description}</p>
                <p className="text-sm">Status: {clubEnded ? "Ended" : "Active"}</p>
                <p className="text-sm">Time remaining: {getTimeRemaining(club.end)}</p>
                <p className="text-sm">Base Membership: {formatEther(club.subscriptionPrice)} ETH</p>
                <p className="text-sm">Created by: {truncateAddress(club.owner)}</p>
                <p className="text-sm">Total collected: {formatEther(club.amountCollected)} ETH</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full px-12 space-y-2 overflow-y-auto">
          <Card className="h-full relative">
            <PostList clubId={id} />
            <div className="absolute bottom-0 left-0 right-0">
              <CardContent className="w-full">
                <CreatePost
                  clubId={id}
                  publicPostFee={club.publicPostFee}
                  isMember={isCurrentMember}
                />
              </CardContent>
            </div>
          </Card>
        </div>


      <div className='space-y-4'>
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Club Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCurrentMember && <JoinClub clubId={id} members={club.members} />}
              {isCurrentMember && (
                <>
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawLoading || !clubEnded || hasWithdrawn}
                    className={`${hasWithdrawn ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                  >
                    {isWithdrawLoading ? 'Withdrawing...' :
                    hasWithdrawn ? 'Funds Withdrawn' :
                    !clubEnded ? 'Withdraw Funds (Not Available)' : 'Withdraw Funds'}
                  </Button>
                  {!clubEnded && <p className="text-gray-500 text-sm">Club has not ended yet. Withdrawal not available.</p>}
                  {isWithdrawSuccess && <p className="text-green-500 text-sm">Funds withdrawn successfully!</p>}
                  {memberShare && (
                    <p className="text-blue-500 text-sm">
                      {hasWithdrawn
                        ? `Your withdrawn share: ${memberShare} ETH`
                        : `Your share: ${memberShare} ETH`}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Members ({club.members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {club.members.length > 0 ? (
              <>
                <ul className="list-disc list-inside">
                  {club.members.slice(0, showAllMembers ? undefined : 5).map((member, index) => (
                    <li key={index} className="text-gray-600">{truncateAddress(member)}</li>
                  ))}
                </ul>
                {club.members.length > 5 && (
                  <Button
                    variant="link"
                    onClick={() => setShowAllMembers(!showAllMembers)}
                    className="mt-2"
                  >
                    {showAllMembers ? 'Show Less' : 'Show All'}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-gray-600">No members yet</p>
            )}
          </CardContent>
        </Card>

        </div>
      </div>

    </div>
  );
};

export default GetClub;
