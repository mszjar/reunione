'use client'

import GetClub from '@/components/GetClub'
import React from 'react'
import { useParams } from 'next/navigation'

const Page = () => {
  const params = useParams()

  // Log the params to see what we're actually receiving
  console.log("Route params:", params);

  // Check if we have a clubId or slugWithId
  const idParam = params.clubId || params.slugWithId;

  // Function to safely parse the ID
  const parseId = (param: string | string[] | undefined): number | null => {
    if (typeof param === 'string') {
      // If it's just a number, parse it
      if (/^\d+$/.test(param)) {
        return parseInt(param, 10);
      }
      // If it's a slug, try to extract the number from the beginning
      const match = param.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    }
    // If it's an array, try to parse the first element
    if (Array.isArray(param) && param.length > 0) {
      return parseId(param[0]);
    }
    return null;
  };

  const clubId = parseId(idParam);

  if (clubId === null) {
    return <div>Invalid or missing club ID</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GetClub id={clubId} />
    </div>
  )
}

export default Page
