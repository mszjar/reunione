'use client'

import { LayoutChildrenProps } from "@/types";

import Header from './Header'
import Footer from './Footer'

export const Layout = ({ children }: LayoutChildrenProps ) => {
  return (
    <div className="h-screen flex flex-col justify-between">
      <Header/>
      <div className="container mx-auto  px-12 flex flex-col w-full">
        {children}
      </div>
      <Footer/>
    </div>
  )
}
