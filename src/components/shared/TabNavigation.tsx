"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MessageCircle } from "lucide-react";

export function TabNavigation() {
  const pathname = usePathname();

  // Determine the active tab value based on the current path.
  // Handles cases where path might be /dashboard/* or /chatbot/*
  let activeTab = "/dashboard";
  if (pathname.startsWith("/chatbot")) {
    activeTab = "/chatbot";
  } else if (pathname.startsWith("/dashboard")) {
    activeTab = "/dashboard";
  }


  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto shadow-sm">
        <TabsTrigger value="/dashboard" asChild data-testid="dashboard-tab">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-150 ease-in-out">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </TabsTrigger>
        <TabsTrigger value="/chatbot" asChild data-testid="chatbot-tab">
          <Link href="/chatbot" className="flex items-center justify-center gap-2 py-2 rounded-md transition-colors duration-150 ease-in-out">
            <MessageCircle size={18} />
            Chatbot
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
