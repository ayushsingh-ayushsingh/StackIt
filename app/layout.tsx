import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q&A Platform",
  description: "A modern Q&A platform for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SignedOut>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-md p-6">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome to Q&A Platform
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Join our community of developers
                    </p>
                  </div>
                  <SignIn routing="hash" />
                </div>
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
