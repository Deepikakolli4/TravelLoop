
"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'
const menuOptions = [
    {
        name: 'Home',
        path: '/'
    },
    {
       name: 'Pricing',
       path: '/pricing'
    },
    {
        name: 'Contact us',
        path:  '/contact-us'
    },
    {
        name:"Booking",
        path: '/booking'
    }
]
const Header = () => {

  const {user} = useUser();
  return (
    <div className='flex justify-between items-center p-4'>

        {/* Logo */}
        <div className='flex gap-2 items-center'>
        <Image src = {'/logo.svg'} alt = 'logo' width={30} height={30}/>
        <h2 className='font-bold text-2xl'>Travel Loop</h2>
        </div>

        {/* Menu Options */}
        <div className='flex gap-8 items-center'>
            {menuOptions.map((menu, index) => (
               <Link key={menu.path} href={menu.path}>
                   <h2 className='text-lg hover:scale-105 transition-all hover:text-primary'>{menu.name}</h2>
                </Link>
            ))}
        </div>

        {/* Get Started Button */}
        {!user ? <SignInButton mode='modal'>
            <Button>Get Started!</Button>
        </SignInButton> :
        <Link href={'/create-new-trip'}>
        <Button>Create New Trip!</Button>
        </Link>
        }
    </div>
  )
}

export default Header