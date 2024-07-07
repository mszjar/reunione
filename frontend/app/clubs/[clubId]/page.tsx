'use client'

import GetClub from '@/components/GetClub'
import React from 'react'
import { useParams } from 'next/navigation'

const Page = () => {
  const params = useParams()
  const clubId = params.clubId

  return (
    <div className="container mx-auto px-4 py-8">
      <GetClub id={parseInt(clubId)} />
    </div>
  )
}

export default Page
