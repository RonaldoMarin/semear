"use client"

import "./index.css"
import Link from "next/link"
import Image from "next/image"
import NavItem, { NavIntemInterface } from "../NavItem"
import { usePathname } from "next/navigation"
import { FaBars, FaXmark } from "react-icons/fa6"
import { useState } from "react"

export default function Navbar() {
  const items: NavIntemInterface[] = [
    {
      url: "/",
      label: "Início",
    },
    {
      url: "/inscricao",
      label: "Inscrição",
    },
    {
      url: "/faq",
      label: "FAQ",
    },
    {
      url: "/about",
      label: "Sobre",
    },
  ]

  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<boolean>(false)

  return (
    <header>
      <nav className="navbar">
        <Link href="/" className={`logo ${openMenu ? "open" : ""}`}>
          <Image
            src="/semear-logo-texto.svg"
            width={120}
            height={100}
            alt="Logo do semear"
          />
        </Link>

        <ul className={`nav-items ${openMenu ? "open" : ""}`}>
          {items.map((item, index) => (
            <NavItem
              key={index}
              url={item.url}
              label={item.label}
              isActive={pathname === item.url}
            />
          ))}
        </ul>

        <button className="btn-mobile" onClick={() => setOpenMenu(!openMenu)}>
          {openMenu ? <FaXmark /> : <FaBars />}
        </button>

        <button className="btn-default">Login</button>
      </nav>
    </header>
  )
}
