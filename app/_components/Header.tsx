"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

const menuOptions = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact us', path: '/contact-us' },
  { name: 'Booking', path: '/booking' }
]

const Header = () => {

  const { user } = useUser()
  const pathname = usePathname()

  return (
    <div className='flex justify-between items-center p-4'>

      {/* Logo */}
      <div className='flex gap-2 items-center'>
        <Image src={'/logo.svg'} alt='logo' width={30} height={30}/>
        <h2 className='font-bold text-2xl'>Travel Loop</h2>
      </div>

      {/* Menu Options */}
      <div className='flex gap-8 items-center'>
        {menuOptions.map((menu) => {

          const isActive = pathname === menu.path

          return (
            <Link key={menu.path} href={menu.path}>
              <div className='flex flex-col items-center'>

                <span
                  className={`text-lg transition-all duration-200 transform hover:scale-105
                  ${isActive ? "text-purple-700 font-semibold" : "hover:text-primary"}`}
                >
                  {menu.name}
                </span>

                {/* Active underline */}
                {isActive && (
                  <span className="h-[2px] w-full bg-purple-700 mt-1"></span>
                )}

              </div>
            </Link>
          )
        })}
      </div>

      {/* Button */}
      {!user ?
        <SignInButton mode='modal'>
          <Button>Get Started!</Button>
        </SignInButton>
        :
        <Link href={'/create-new-trip'}>
          <Button className=' bg-purple-700'>Create New Trip!</Button>
        </Link>
      }

    </div>
  )
}

export default Header