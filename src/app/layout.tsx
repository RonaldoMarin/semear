import { ChakraProvider } from "@chakra-ui/react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Navbar from "@/components/NavBar"
import Footer from "@/components/Footer"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Semear | Home",
  description: "Página home do Semear",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={poppins.className}>
        <ChakraProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ChakraProvider>
      </body>
    </html>
  )
}
