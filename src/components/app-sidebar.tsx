"use client";

import { LayoutGrid, ShieldUser } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { TYPE_USER } from "@/pages/type-users/lib/typeUser.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { USER } from "@/pages/users/lib/User.interface";
import { COMPANY } from "@/pages/company/lib/company.interface";
import { BRANCH } from "@/pages/branch/lib/branch.interface";
import { hasAccessToRoute } from "@/App";
import { useEffect, useState } from "react";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";

const {
  ICON_REACT: TypeUserIcon,
  ROUTE: TypeUserRoute,
  MODEL: { name: TypeUserTitle },
} = TYPE_USER;

const {
  ICON_REACT: UserIcon,
  ROUTE: UserRoute,
  MODEL: { name: UserTitle },
} = USER;

const {
  ICON_REACT: CompanyIcon,
  ROUTE: CompanyRoute,
  MODEL: { name: CompanyTitle },
} = COMPANY;

const {
  ICON_REACT: BranchIcon,
  ROUTE: BranchRoute,
  MODEL: { name: BranchTitle },
} = BRANCH;

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: "Gestión",
      url: "#",
      icon: CompanyIcon,
      items: [
        {
          title: CompanyTitle,
          url: CompanyRoute,
          icon: CompanyIcon,
        },
        {
          title: BranchTitle,
          url: BranchRoute,
          icon: BranchIcon,
        },
      ],
    },
    {
      title: "Seguridad",
      url: "#",
      icon: ShieldUser,
      items: [
        {
          title: UserTitle,
          url: UserRoute,
          icon: UserIcon,
        },
        {
          title: TypeUserTitle,
          url: TypeUserRoute,
          icon: TypeUserIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, access } = useAuthStore();
  const [filteredNav, setFilteredNav] = useState<any[]>([]);

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      // Si no está habilitada la validación, mostrar todos los elementos
      setFilteredNav(data.navMain);
      return;
    }

    if (!access) return;

    const filterNav = (items: any[]) =>
      items.filter((item) => {
        if (item.url === "#" && item.items) {
          item.items = filterNav(item.items);
          return item.items.length > 0;
        }
        return hasAccessToRoute(access, item.url);
      });

    setFilteredNav(filterNav(data.navMain));
  }, [access]);

  if (!user) {
    return null; // o spinner
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
