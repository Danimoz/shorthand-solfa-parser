import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers"
import { Inter } from 'next/font/google'
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "Solfa Notation Parser",
  description: "Convert shorthand solfa notation to structured JSON",
}

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider
          defaultOpen={defaultOpen}
        >
          <div className="grid grid-cols-[16rem_1fr] w-full">
            <div>
              <AppSidebar />
            </div>
            <div className="p-8">
              <SidebarTrigger />
              {children}
            </div>
          </div>
          <Toaster richColors position="top-right" closeButton />
        </SidebarProvider>
      </body>
    </html>
  );
}
