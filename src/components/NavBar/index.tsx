"use client"

import Link from "next/link"
import Image from "next/image"
import NavItem, { NavIntemInterface } from "../NavItem"
import "./index.css"
import { usePathname } from "next/navigation"

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

  return (
    <header>
      <nav className="navbar">
        <Link href="/" className="logo">
          <Image
            src="/semear-logo.svg"
            width={120}
            height={100}
            alt="Logo do semear"
          />
        </Link>

        <ul className="nav-items">
          {items.map((item, index) => (
            <NavItem
              key={index}
              url={item.url}
              label={item.label}
              isActive={pathname === item.url}
            />
          ))}
        </ul>

        <button className="btn-default">Contatar</button>
      </nav>
    </header>
  )
}
