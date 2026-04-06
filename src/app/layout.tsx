import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ModalProvider } from "@/lib/helpers/ModalContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaseShelf",
  description: "A management and organisation tool for your physical media collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} app-body`}>
        <ModalProvider>
          <div className="app-container">
            <Sidebar />
            <div className="content-wrapper">
              <Header />
              <main className="main-content">
                {children}
              </main>
            </div>
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}