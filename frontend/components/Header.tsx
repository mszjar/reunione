'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';


const Header = () => {
  return (
    <div className='flex p-3 justify-between px-5 text-sm bg-slate-50'>
      <h1 className='p-3 text-slate-900 text-xl font-bold'>Reunione</h1>
      <ConnectButton />
    </div>
  )
}

export default Header
