'use client'
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, abi } from "@/constants";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { parseEther } from "viem";

const CreateClub = () => {
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubDuration, setClubDuration] = useState("");
  const [clubPrice, setClubPrice] = useState("");
  const [clubImage, setClubImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { address } = useAccount();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const handleCreateClub = async () => {
    setErrorMessage("");
    if (!clubName || !clubDescription || !clubDuration || !clubPrice || !clubImage) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    const duration = parseInt(clubDuration);
    if (isNaN(duration) || duration <= 0 || duration > 1051200) {
      setErrorMessage("Duration must be between 1 and 1,051,200 minutes (730 days)");
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'createClub',
        args: [clubName, clubDescription, duration, parseEther(clubPrice), clubImage],
        account: address,
      });
    } catch (err) {
      console.error("Error creating club:", err);
      setErrorMessage("Error creating club. Please try again.");
    }
  }

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({hash});

  return (
    <div className="create">
      <div className="create_inner">
        <h1 className="create_inner_title">
          <span className="text-2xl flex justify-center">Create a Club</span>
        </h1>
        <Card>
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
                <Label htmlFor="clubDuration">Duration(days)</Label>
                <Input
                  type="number"
                  id="clubDuration"
                  placeholder="Ex: 30"
                  min="1"
                  max="1051200"
                  value={clubDuration}
                  onChange={(e) => setClubDuration(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubPrice">Membership (ETH)</Label>
                <Input
                  type="text"
                  id="clubPrice"
                  placeholder="Ex: 0.01"
                  value={clubPrice}
                  onChange={(e) => setClubPrice(e.target.value)}
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
                className="create_inner_submit_button hover:bg-[#fddf38] mt-3"
                type="submit"
              >
                {isLoading ? 'Création en cours...' : 'Create Club'}
              </Button>
            </form>
            {isSuccess && (
              <div className="create_inner_success_message mt-3 text-green-500">
                Club created successfully!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateClub;
