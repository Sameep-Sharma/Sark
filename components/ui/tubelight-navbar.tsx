"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button as MovingBorderContainer } from "./moving-border"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(() => {
    const current = items.find(item => item.url === '/' ? pathname === '/' : pathname?.startsWith(item.url))
    return current ? current.name : items[0].name
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const current = items.find(item => item.url === '/' ? pathname === '/' : pathname?.startsWith(item.url))
    if (current && current.name !== activeTab) {
      setActiveTab(current.name)
    }
  }, [pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <MovingBorderContainer
        as="div"
        borderRadius="9999px"
        containerClassName="shadow-lg rounded-full"
        className="flex items-center gap-3 py-1 px-1 rounded-full bg-transparent border-0"
        borderClassName="opacity-[0.8]"
        duration={3000}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  {/* <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-10 h-10">
                    <svg width="0" height="0" className="absolute">
                      <filter id="batman-recolor">
                        <feColorMatrix type="matrix" values="
                          -0.290  0  0  0.85  0
                          -0.823  0  0  0.85  0
                          -0.772  0  0  0.85  0
                           0      0  0  1     0" 
                        />
                      </filter>
                    </svg>
                    <Image 
                      src="/image-10.png" 
                      alt="Active Tab" 
                      width={40} 
                      height={40} 
                      className="object-contain w-full h-full" 
                      style={{ filter: "url(#batman-recolor)" }}
                    />
                  </div> */}
                </motion.div>
              )}
            </Link>
          )
        })}
      </MovingBorderContainer>
    </div>
  )
}
