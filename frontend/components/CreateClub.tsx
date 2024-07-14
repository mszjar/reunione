'use client'
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, abi } from "@/constants";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { parseEther } from "viem";
import { useRouter } from 'next/navigation';

const CreateClub = () => {
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubDuration, setClubDuration] = useState("");
  const [clubPrice, setClubPrice] = useState("");
  const [clubImage, setClubImage] = useState("");
  const [publicPostFee, setPublicPostFee] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { address } = useAccount();
  const router = useRouter();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const handleCreateClub = async () => {
    setErrorMessage("");
    if (!clubName || !clubDescription || !clubDuration || !clubPrice || !clubImage || !publicPostFee) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    const duration = parseInt(clubDuration);
    if (isNaN(duration) || duration <= 0 || duration > 730) {
      setErrorMessage("Duration must be between 1 and 730 days");
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'createClub',
        args: [clubName, clubDescription, duration, parseEther(clubPrice), clubImage, parseEther(publicPostFee)],
        account: address,
      });
    } catch (err) {
      console.error("Error creating club:", err);
      setErrorMessage("Error creating club. Please try again.");
    }
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({hash});

  useEffect(() => {
    if (isSuccess) {
      router.push('/');
    }
  }, [isSuccess, router]);

  return (
    <div className="container">
      <div className="px-64">
        <h1 className="mb-10">
          <span className="text-2xl flex justify-center">Create a Club</span>
        </h1>
        <Card className="bg-[#f5f3ef]">
          <CardContent className="pt-5">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateClub();
            }}>
              <div className="create_inner_form_item">
                <Label htmlFor="clubName">Name</Label>
                <Input
                  type="text"
                  id="clubName"
                  placeholder="Ex: Book Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubDescription">Description</Label>
                <Input
                  type="text"
                  id="clubDescription"
                  placeholder="Ex: A club for book lovers"
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubDuration">Duration (days)</Label>
                <Input
                  type="number"
                  id="clubDuration"
                  placeholder="Ex: 30"
                  min="1"
                  max="730"
                  value={clubDuration}
                  onChange={(e) => setClubDuration(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubPrice">Membership Price (ETH)</Label>
                <Input
                  type="text"
                  id="clubPrice"
                  placeholder="Ex: 0.01"
                  value={clubPrice}
                  onChange={(e) => setClubPrice(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="publicPostFee">Public Post Fee (ETH)</Label>
                <Input
                  type="text"
                  id="publicPostFee"
                  placeholder="Ex: 0.001"
                  value={publicPostFee}
                  onChange={(e) => setPublicPostFee(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubImage">Image URL</Label>
                <Input
                  type="text"
                  id="clubImage"
                  placeholder="Ex: https://example.com/club-image.jpg"
                  value={clubImage}
                  onChange={(e) => setClubImage(e.target.value)}
                />
              </div>
              {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
              <Button
                variant="outline"
                disabled={isLoading}
                className="create_inner_submit_button bg-[#46954a] hover:bg-[#73c077] mt-3"
                type="submit"
              >
                {isLoading ? 'Creating Club...' : 'Create Club'}
              </Button>
            </form>
            {isSuccess && (
              <div className="create_inner_success_message mt-3 text-green-500">
                Club created successfully! Redirecting to home page...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateClub;
