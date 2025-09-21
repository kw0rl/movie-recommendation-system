import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  title: "Movie Recommendation - Hand Drawn Style",
  description: "Discover popular movies with a beautiful hand-drawn interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap" 
          rel="preconnect" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${patrickHand.variable} antialiased`} style={{ fontFamily: 'Patrick Hand, cursive' }}>
        {children}
      </body>
    </html>
  );
}
