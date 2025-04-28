import type React from "react"
import { Inter, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] ,display: 'swap'})
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" ,display: 'swap'})


export const metadata: Metadata = {

  title: {
    default: "Google Generative AI Cache Experiment",
    template: "%s | CS Studio",
  },
  description: "Experiment with Google Generative AI file upload and cache functionality",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} ${geistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
