import type { Metadata } from "next"
import { Lora } from "next/font/google"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Curriq — AI Instructional Designer",
  description:
    "Stop guessing your course structure. Get a Bloom-mapped curriculum in 30 seconds — backed by real pedagogical thinking.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
