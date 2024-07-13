'use client'

import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { contractAddress, abi } from "@/constants";
import { formatEther, Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [hasMore, setHasMore] = useState(true);

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
    <Card>
      <CardHeader>
        <CardTitle>Posts ({totalPosts})</CardTitle>
      </CardHeader>
      <CardContent>
        {totalPosts === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <p className="font-semibold">{post.isMemberPost ? 'Member Post' : 'Public Post'}</p>
                  <p className="text-sm text-gray-500">By: {post.author}</p>
                  <p className="text-sm text-gray-500">Posted on: {formatDate(post.timestamp)}</p>
                  {!post.isMemberPost && (
                    <p className="text-sm text-gray-500">Fee: {formatEther(post.fee)} ETH</p>
                  )}
                  <p className="mt-2">{post.content}</p>
                </CardContent>
              </Card>
            ))}
            {isPostsLoading && <Skeleton className="w-full h-20" />}
          </div>
        )}
        {hasMore && (
          <Button onClick={loadMorePosts} className="mt-4" disabled={isPostsLoading}>
            {isPostsLoading ? 'Loading...' : 'Load More Posts'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PostList;
