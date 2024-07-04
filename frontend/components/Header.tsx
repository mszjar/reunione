'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import Link from 'next/link';


const Header = () => {
  return (
    <div className='flex p-3 justify-between px-5 text-sm bg-gray-300'>
      <h1 className='p-3 text-gray-700 text-xl font-extrabold'>Reunione</h1>
      <div className='flex gap-4 mt-2 text-sm'>
        <Button asChild>
          <Link href="/create">Create a Club</Link>
        </Button>
        <ConnectButton showBalance={false}/>
        </div>
    </div>
  )
}

export default Header
