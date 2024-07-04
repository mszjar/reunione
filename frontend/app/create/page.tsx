'use client'

import FormClub from "@/components/FormClub";
import NotConnected from "@/components/NotConnected";
import { useAccount } from "wagmi";

const page = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      { isConnected ? (<FormClub />) : (<NotConnected />)}
    </div>
  )
}

export default page
