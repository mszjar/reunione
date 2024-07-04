'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import Link from 'next/link';


const Header = () => {
  return (
    <div className='flex p-3 justify-between px-5 text-sm bg-gray-300'>
      <Link href="/"><h1 className='p-3 text-black text-xl font-extrabold'>Reunione</h1></Link>
      <div className='flex gap-4 mt-2 text-sm'>
        <Button asChild className='h-10 rounded-xl'>
          <Link href="/create">Create a Club</Link>
        </Button>
        <div className='text-sm'><ConnectButton showBalance={false}/></div>
        </div>
    </div>
  )
}

export default Header
