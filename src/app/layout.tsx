import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Navbar from "@/components/NavBar"
import Footer from "@/components/Footer"
import Home from "@/app/page"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Semear | Home",
  description: "Página home do semear",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={poppins.className}>
        <Navbar />
        <Home />
        {children}
        <Footer />
      </body>
    </html>
  )
}
