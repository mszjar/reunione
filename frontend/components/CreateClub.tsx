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
          <span className="create_inner_title_colored">Créer un club</span>
        </h1>
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateClub();
            }}>
              <div className="create_inner_form_item">
                <Label htmlFor="clubName">Nom du club</Label>
                <Input
                  type="text"
                  id="clubName"
                  placeholder="Ex: Club de lecture"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubDescription">Description du club</Label>
                <Input
                  type="text"
                  id="clubDescription"
                  placeholder="Ex: Un club pour les amateurs de lecture"
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubDuration">Durée du club (en minutes)</Label>
                <Input
                  type="number"
                  id="clubDuration"
                  placeholder="Ex: 1440 pour 1 jour"
                  min="1"
                  max="1051200"
                  value={clubDuration}
                  onChange={(e) => setClubDuration(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubPrice">Prix d'adhésion (en ETH)</Label>
                <Input
                  type="text"
                  id="clubPrice"
                  placeholder="Ex: 0.01"
                  value={clubPrice}
                  onChange={(e) => setClubPrice(e.target.value)}
                />
              </div>
              <div className="create_inner_form_item mt-3">
                <Label htmlFor="clubImage">URL de l'image du club</Label>
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
                className="create_inner_submit_button hover:bg-[#75fd38] mt-3"
                type="submit"
              >
                {isLoading ? 'Création en cours...' : 'Créer le club'}
              </Button>
            </form>
            {isSuccess && (
              <div className="create_inner_success_message mt-3 text-green-500">
                Le club a été créé avec succès !
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateClub;
