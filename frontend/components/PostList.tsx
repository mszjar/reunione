'use client'

import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ScrollArea } from "@/components/ui/scroll-area"

interface Post {
  author: Address;
  content: string;
  timestamp: bigint;
  fee: bigint;
  isMemberPost: boolean;
}

interface PostListProps {
  clubId: number;
  pageSize?: number;
}

const PostList: React.FC<PostListProps> = ({ clubId, pageSize = 10 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const { data: postCount, isLoading: isCountLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getPostCount",
    args: [BigInt(clubId)],
  });

  const { data: fetchedPosts, isLoading: isPostsLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getPosts",
    args: [BigInt(clubId), BigInt(currentPage * pageSize), BigInt(Math.min((currentPage + 1) * pageSize, Number(postCount || 0)))],
  });

  useEffect(() => {
    if (!isCountLoading && postCount !== undefined && Number(postCount) > 0) {
      refetch();
    }
  }, [isCountLoading, postCount, refetch]);

  useEffect(() => {
    if (fetchedPosts && Array.isArray(fetchedPosts)) {
      setPosts(prevPosts => {
        const newPosts = [...prevPosts];
        fetchedPosts.forEach((post, index) => {
          newPosts[currentPage * pageSize + index] = post;
        });
        return newPosts;
      });
      setHasMore(posts.length < Number(postCount || 0));
    }
  }, [fetchedPosts, currentPage, pageSize, postCount]);

  const loadMorePosts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (isCountLoading) {
    return <Skeleton className="w-full h-40" />;
  }

  const totalPosts = Number(postCount || 0);

  return (
    <div className='bg-[#f5f3ef] rounded-xl'>
      <CardHeader>
        <CardTitle>Wall ({totalPosts})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex justify-end'>
          {hasMore && (
            <ReloadIcon
            onClick={loadMorePosts}
            className={`mb-4 cursor-pointer ${isPostsLoading ? 'animate-spin' : ''} text-gray-600 hover:text-gray-800`}
            />
          )}
        </div>
        {totalPosts === 0 ? (
          <p>No posts yet.</p>
        ) : (
        <ScrollArea className="overflow-y-auto h-[450px] w-full px-4">
          {posts.map((post, index) => (
            <Card key={index} className='mb-4'>
              <CardContent className="p-2">
                <p className="text-xs text-gray-500">{post.author} ({post.isMemberPost ? 'Member' : 'Public'})</p>
                <p className="mt-2 text-sm">{post.content}</p>
                <p className="flex text-xs text-gray-500 justify-end">{formatDate(post.timestamp)}</p>
                {!post.isMemberPost && (
                  <p className="flex text-xs text-gray-500 justify-end">Fee: {formatEther(post.fee)} ETH</p>
                )}
              </CardContent>
            </Card>
          ))}
          {isPostsLoading && <Skeleton className="w-full h-20" />}
        </ScrollArea>
        )}
      </CardContent>
    </div>
  );
};

export default PostList;
