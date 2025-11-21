import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Near Me Admin Dashboard",
  description: "Admin dashboard for managing restaurant edit requests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // เพิ่ม Class 'animate-bg-scroll' เพื่อให้พื้นหลังเคลื่อนที่
        className={`${geistSans.variable} ${geistMono.variable} antialiased animate-bg-scroll`} 
      >
        {children}
      </body>
    </html>
  );
}