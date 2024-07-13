'use client'

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { contractAddress, abi } from "@/constants";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface CreatePostProps {
  clubId: number;
  publicPostFee: bigint;
  isMember: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ clubId, publicPostFee, isMember }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'public' | 'member'>('public');
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (content.length > 280) {
      setError('Post content must be 280 characters or less');
      return;
    }

    try {
      if (postType === 'public') {
        await writeContract({
          address: contractAddress,
          abi: abi,
          functionName: 'addPublicPost',
          args: [BigInt(clubId), content],
          value: publicPostFee,
        });
      } else {
        if (!isMember) {
          setError('You must be a member to create a member post');
          return;
        }
        await writeContract({
          address: contractAddress,
          abi: abi,
          functionName: 'addMemberPost',
          args: [BigInt(clubId), content],
        });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Error creating post. Please try again.');
    }
  };

  return (
    <div className="create-post">
      <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="content">Post Content</Label>
          <Input
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            placeholder="What's on your mind?"
          />
          <p className="text-sm text-gray-500 mt-1">{content.length}/280 characters</p>
        </div>
        <div className="mb-4">
          <Label>Post Type</Label>
          <RadioGroup value={postType} onValueChange={(value) => setPostType(value as 'public' | 'member')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public">Public Post (Fee: {parseEther(publicPostFee.toString())} ETH)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="member" id="member" disabled={!isMember} />
              <Label htmlFor="member">Member Post {!isMember && '(Members Only)'}</Label>
            </div>
          </RadioGroup>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button type="submit" disabled={isConfirming}>
          {isConfirming ? 'Creating Post...' : 'Create Post'}
        </Button>
      </form>
      {isConfirmed && (
        <p className="text-green-500 mt-4">Post created successfully!</p>
      )}
    </div>
  );
};

export default CreatePost;
