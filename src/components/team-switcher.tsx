"use client";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export function TeamSwitcher() {
  return (
    <SidebarHeader className="group-data-[collapsible=icon]:!px-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link to="/inicio" className="group-data-[collapsible=icon]:!px-0">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
                <Leaf className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-base font-bold leading-tight">
                <span className="truncate text-primary">Fert & Riego</span>
                <span className="truncate text-xs font-normal">ERP System</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
