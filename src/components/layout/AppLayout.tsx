import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-dvh flex-col bg-background">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
