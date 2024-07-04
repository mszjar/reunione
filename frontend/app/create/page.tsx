'use client'

import CreateClub from "@/components/CreateClub";
import NotConnected from "@/components/NotConnected";
import { useAccount } from "wagmi";

const page = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      { isConnected ? (<CreateClub />) : (<NotConnected />)}
    </div>
  )
}

export default page
