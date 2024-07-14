'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import Link from 'next/link';


const Header = () => {
  return (
    <div className='flex p-3 justify-between px-5 text-sm font-serif bg-[#f5f3ef]'>
      <Link href="/"><h1 className='p-3 text-[#3d2b13] text-xl font-extrabold'>Reunione</h1></Link>
      <div className='flex gap-4 mt-2 text-sm'>
      <Button
        asChild
        className="
          h-10 px-4 rounded-md
          bg-gradient-to-b from-[#8B3E2F] to-[#6B2D23]
          border border-[#5A1F1A]
          text-[#FDF0D5] font-semibold
          shadow-sm
          hover:from-[#9B4E3F] hover:to-[#7B3D33]
          active:from-[#7B3D33] active:to-[#5A1F1A]
          transition-all duration-150
          focus:ring-2 focus:ring-[#FDF0D5] focus:ring-opacity-30
          text-sm
        "
      >
        <Link href="/create">Create a Club</Link>
      </Button>
        <div className='text-sm'><ConnectButton showBalance={false}/></div>
        </div>
    </div>
  )
}

export default Header
