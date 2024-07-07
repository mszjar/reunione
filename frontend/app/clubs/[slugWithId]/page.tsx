'use client'

import GetClub from '@/components/GetClub'
import JoinClub from '@/components/JoinClub'
import WithdrawFunds from '@/components/WithdrawFunds'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'

const Page = () => {
  const params = useParams()
  const [clubData, setClubData] = useState(null);
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

  const handleClubDataFetched = (data) => {
    setClubData(data);
  };

  const isClubEnded = clubData ? Date.now() / 1000 > parseInt(clubData.end) : false;
  const isMember = clubData ? clubData.members.includes(address) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <GetClub id={clubId} onDataFetched={handleClubDataFetched} />
      {clubData && (
        <div className="mt-4 space-y-4">
          <JoinClub
            clubId={clubId}
            subscriptionPrice={clubData.subscriptionPrice}
            members={clubData.members}
          />
          <WithdrawFunds
            clubId={clubId}
            clubEnded={isClubEnded}
            isMember={isMember}
          />
        </div>
      )}
    </div>
  )
}

export default Page
