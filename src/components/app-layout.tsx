"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  CookingPot,
  LayoutDashboard,
  DollarSign,
  Boxes,
  CreditCard,
  FileDown,
} from "lucide-react";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales", icon: DollarSign },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: FileDown },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
              <CookingPot className="h-6 w-6 text-primary" />
            </Button>
            <div className="flex flex-col">
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Zaalimmmm!
              </h2>
              <p className="text-sm text-muted-foreground -mt-1">Shawarma</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {/* User profile can be added here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
          <SidebarTrigger className="md:hidden" />
          {/* User profile button can be added here */}
        </header>
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 overflow-hidden rounded-lg shadow-md">
                 <Image
                    src="/zaalim-banner.png"
                    alt="Zaalimmm! Shawarma Banner"
                    width={1600}
                    height={350}
                    className="w-full object-cover"
                    priority
                    data-ai-hint="shawarma banner"
                />
            </div>
            <main className="flex-1">
                {children}
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
