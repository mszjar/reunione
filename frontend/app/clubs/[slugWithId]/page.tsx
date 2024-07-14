'use client'

import GetClub from '@/components/GetClub'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'

interface ClubData {
  end: string;
  members: string[];
}

const Page = () => {
  const params = useParams()
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const { address } = useAccount();

  console.log("Route params:", params);

  const idParam = params.clubId || params.slugWithId;

  const parseId = (param: string | string[] | undefined): number | null => {
    if (typeof param === 'string') {
      if (/^\d+$/.test(param)) {
        return parseInt(param, 10);
      }
      const match = param.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    }
    if (Array.isArray(param) && param.length > 0) {
      return parseId(param[0]);
    }
    return null;
  };

  const clubId = parseId(idParam);

  if (clubId === null) {
    return <div>Invalid or missing club ID</div>;
  }

  const handleClubDataFetched = (data: ClubData) => {
    setClubData(data);
  };

  const isClubEnded = clubData ? Date.now() / 1000 > parseInt(clubData.end) : false;
  const isMember = clubData && address ? clubData.members.includes(address) : false;

  return (
    <div className="px-4">
      <GetClub id={clubId} onDataFetched={handleClubDataFetched} />
    </div>
  )
}

export default Page
