"use client";

import { LayoutGrid, ShieldUser, Package } from "lucide-react";
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
import { WAREHOUSE } from "@/pages/warehouse/lib/warehouse.interface";
import { BRAND } from "@/pages/brand/lib/brand.interface";
import { BOX } from "@/pages/box/lib/box.interface";
import { UNIT } from "@/pages/unit/lib/unit.interface";
import { CATEGORY } from "@/pages/category/lib/category.interface";
import { PRODUCT } from "@/pages/product/lib/product.interface";
import { PRODUCT_TYPE } from "@/pages/product-type/lib/product-type.interface";
import { ROLE } from "@/pages/role/lib/role.interface";
import { CLIENT } from "@/pages/client/lib/client.interface";
import { SUPPLIER } from "@/pages/supplier/lib/supplier.interface";
import { WORKER } from "@/pages/worker/lib/worker.interface";
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

const {
  ICON_REACT: WarehouseIcon,
  ROUTE: WarehouseRoute,
  MODEL: { name: WarehouseTitle },
} = WAREHOUSE;

const {
  ICON_REACT: BrandIcon,
  ROUTE: BrandRoute,
  MODEL: { name: BrandTitle },
} = BRAND;

const {
  ICON_REACT: BoxIcon,
  ROUTE: BoxRoute,
  MODEL: { name: BoxTitle },
} = BOX;

const {
  ICON_REACT: UnitIcon,
  ROUTE: UnitRoute,
  MODEL: { name: UnitTitle },
} = UNIT;

const {
  ICON_REACT: CategoryIcon,
  ROUTE: CategoryRoute,
  MODEL: { name: CategoryTitle },
} = CATEGORY;

const {
  ICON_REACT: ProductIcon,
  ROUTE: ProductRoute,
  MODEL: { name: ProductTitle },
} = PRODUCT;

const {
  ICON_REACT: ProductTypeIcon,
  ROUTE: ProductTypeRoute,
  MODEL: { name: ProductTypeTitle },
} = PRODUCT_TYPE;

const {
  ICON_REACT: RoleIcon,
  ROUTE: RoleRoute,
  MODEL: { name: RoleTitle },
} = ROLE;

const {
  ICON_REACT: ClientIcon,
  ROUTE: ClientRoute,
  MODEL: { name: ClientTitle },
} = CLIENT;

const {
  ICON_REACT: SupplierIcon,
  ROUTE: SupplierRoute,
  MODEL: { name: SupplierTitle },
} = SUPPLIER;

const {
  ICON_REACT: WorkerIcon,
  ROUTE: WorkerRoute,
  MODEL: { name: WorkerTitle },
} = WORKER;

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
        {
          title: WarehouseTitle,
          url: WarehouseRoute,
          icon: WarehouseIcon,
        },
        {
          title: BoxTitle,
          url: BoxRoute,
          icon: BoxIcon,
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      icon: Package,
      items: [
        {
          title: CategoryTitle,
          url: CategoryRoute,
          icon: CategoryIcon,
        },
        {
          title: ProductTitle,
          url: ProductRoute,
          icon: ProductIcon,
        },
        {
          title: ProductTypeTitle,
          url: ProductTypeRoute,
          icon: ProductTypeIcon,
        },
        {
          title: BrandTitle,
          url: BrandRoute,
          icon: BrandIcon,
        },
        {
          title: UnitTitle,
          url: UnitRoute,
          icon: UnitIcon,
        },
      ],
    },
    {
      title: "Seguridad",
      url: "#",
      icon: ShieldUser,
      items: [
        {
          title: RoleTitle,
          url: RoleRoute,
          icon: RoleIcon,
        },
        {
          title: ClientTitle,
          url: ClientRoute,
          icon: ClientIcon,
        },
        {
          title: SupplierTitle,
          url: SupplierRoute,
          icon: SupplierIcon,
        },
        {
          title: WorkerTitle,
          url: WorkerRoute,
          icon: WorkerIcon,
        },
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
