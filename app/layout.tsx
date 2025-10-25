import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import './globals.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboMono = Roboto_Mono({
  variable: "--font-robo-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitLink - Easy Expense Sharing",
  description: "Create a group, share a link, and let everyone add their expenses — no sign-up, no hassle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${roboMono.variable} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
