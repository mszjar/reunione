'use client'
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contractAddress, abi } from "@/constants";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Informations from "./Informations";
import { parseEther, formatEther, Abi, Address } from "viem";
import { ClubProps, Club } from "@/types";
import Image from "next/image";

const GetClubs = ({ id, title, description, end, amountCollected, image, subscriptionPrice, owner }: ClubProps) => {
  const [enable, setEnable] = useState(false);

  const { address } = useAccount();

  const { data: clubs, refetch } = useReadContract<Club[]>({
    address: contractAddress,
    abi: abi,
    functionName: "getClubs",
    query: {
      enabled: enable,
    }
  });

  const handleGetClubs = async () => {
    setEnable(true);
  }

  useEffect(() => {
    refetch();
  }, [enable]);

  return (
    <div className="get">
      <div className="get_inner">
        {clubs && (
          <Card className="mt-5">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Durée (jours)</TableHead>
                    <TableHead>Prix (ETH)</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.map((club: Club) => (
                    <TableRow key={club.id}>
                      <TableCell>{club.title}</TableCell>
                      <TableCell>{club.description}</TableCell>
                      <TableCell>{parseInt(club.end) / (1000 * 60 * 60 * 24)}</TableCell>
                      <TableCell>{formatEther(club.subscriptionPrice)}</TableCell>
                      <TableCell>{club.owner}</TableCell>
                      <TableCell><Image alt='club image' width={100} height={100} src={club.image}/></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GetClubs
