'use client'

import { LayoutChildrenProps } from "@/types";

import Header from './Header'
import Footer from './Footer'

export const Layout = ({ children }: LayoutChildrenProps ) => {
  return (
    <div className="h-screen flex flex-col justify-between get min-h-screen font-serif bg-[#f5f3ef]">
      <Header/>
      <div className="px-12">
        {children}
      </div>
      <Footer/>
    </div>
  )
}
