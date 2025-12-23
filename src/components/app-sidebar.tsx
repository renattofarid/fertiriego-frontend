"use client";

import {
  LayoutGrid,
  ShieldUser,
  Package,
  ShoppingCart,
  ShoppingBag,
  Warehouse,
  Activity,
} from "lucide-react";
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
import { CLIENT } from "@/pages/client/lib/client.interface";
import { SUPPLIER } from "@/pages/supplier/lib/supplier.interface";
import { WORKER } from "@/pages/worker/lib/worker.interface";
import { PURCHASE_ORDER } from "@/pages/purchase-order/lib/purchase-order.interface";
import { PURCHASE_SHIPPING_GUIDE } from "@/pages/purchase-shipping-guide/lib/purchase-shipping-guide.interface";
import { SALE } from "@/pages/sale/lib/sale.interface";
import { ACCOUNTS_RECEIVABLE } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { ACCOUNTS_PAYABLE } from "@/pages/accounts-payable/lib/accounts-payable.interface";
import { WAREHOUSE_PRODUCT } from "@/pages/warehouse-product/lib/warehouse-product.interface";
import { WAREHOUSE_DOCUMENT } from "@/pages/warehouse-document/lib/warehouse-document.interface";
import { BOX_SHIFT } from "@/pages/box-shift/lib/box-shift.interface";
import { hasAccessToRoute } from "@/App";
import { useEffect, useState } from "react";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { QUOTATION } from "@/pages/quotation/lib/quotation.interface";
import { ORDER } from "@/pages/order/lib/order.interface";
import { PURCHASE } from "@/pages/purchase/lib/purchase.interface";
import { VEHICLE } from "@/pages/vehicle/lib/vehicle.interface";
import { CREDIT_NOTE } from "@/pages/credit-note/lib/credit-note.interface";

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

const {
  ICON_REACT: PurchaseOrderIcon,
  ROUTE: PurchaseOrderRoute,
  MODEL: { name: PurchaseOrderTitle },
} = PURCHASE_ORDER;

const {
  ICON_REACT: PurchaseIcon,
  ROUTE: PurchaseRoute,
  MODEL: { name: PurchasesTitle },
} = PURCHASE;

const {
  ICON_REACT: PurchaseShippingGuideIcon,
  ROUTE: PurchaseShippingGuideRoute,
  MODEL: { name: PurchaseShippingGuideTitle },
} = PURCHASE_SHIPPING_GUIDE;

const {
  ICON_REACT: WarehouseProductIcon,
  ROUTE: WarehouseProductRoute,
  MODEL: { plural: WarehouseProductTitle },
} = WAREHOUSE_PRODUCT;

const {
  ICON_REACT: WarehouseDocumentIcon,
  ROUTE: WarehouseDocumentRoute,
  MODEL: { plural: WarehouseDocumentTitle },
} = WAREHOUSE_DOCUMENT;

const {
  ICON_REACT: BoxShiftIcon,
  ROUTE: BoxShiftRoute,
  MODEL: { plural: BoxShiftTitle },
} = BOX_SHIFT;

const {
  ICON_REACT: QuotationIcon,
  ROUTE: QuotationRoute,
  MODEL: { name: QuotationTitle },
} = QUOTATION;

const {
  ICON_REACT: OrderIcon,
  ROUTE: OrderRoute,
  MODEL: { name: OrderTitle },
} = ORDER;

const {
  ICON_REACT: SaleIcon,
  ROUTE: SaleRoute,
  MODEL: { name: SaleTitle },
} = SALE;

const {
  ROUTE: AccountsReceivableRoute,
  ICON_REACT: AccountsReceivableIcon,
  MODEL: { name: AccountsReceivableTitle },
} = ACCOUNTS_RECEIVABLE;

const {
  ROUTE: AccountsPayableRoute,
  ICON_REACT: AccountsPayableIcon,
  MODEL: { name: AccountsPayableTitle },
} = ACCOUNTS_PAYABLE;

const {
  ICON_REACT: VehicleIcon,
  ROUTE: VehicleRoute,
  MODEL: { name: VehicleTitle },
} = VEHICLE;

const {
  ICON_REACT: CreditNoteIcon,
  ROUTE: CreditNoteRoute,
  MODEL: { name: CreditNoteTitle },
} = CREDIT_NOTE;

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: "Compras",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: PurchaseOrderTitle,
          url: PurchaseOrderRoute,
          icon: PurchaseOrderIcon,
        },
        {
          title: PurchasesTitle,
          url: PurchaseRoute,
          icon: PurchaseIcon,
        },
        {
          title: PurchaseShippingGuideTitle,
          url: PurchaseShippingGuideRoute,
          icon: PurchaseShippingGuideIcon,
        },
        {
          title: AccountsPayableTitle,
          url: AccountsPayableRoute,
          icon: AccountsPayableIcon,
        },
      ],
    },
    {
      title: "Ventas",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: QuotationTitle,
          url: QuotationRoute,
          icon: QuotationIcon,
        },
        {
          title: OrderTitle,
          url: OrderRoute,
          icon: OrderIcon,
        },
        {
          title: SaleTitle,
          url: SaleRoute,
          icon: SaleIcon,
        },
        {
          title: CreditNoteTitle,
          url: CreditNoteRoute,
          icon: CreditNoteIcon,
        },
        {
          title: AccountsReceivableTitle,
          url: AccountsReceivableRoute,
          icon: AccountsReceivableIcon,
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
          title: WarehouseProductTitle,
          url: WarehouseProductRoute,
          icon: WarehouseProductIcon,
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
      title: "Personas",
      url: "#",
      icon: ClientIcon,
      items: [
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
      ],
    },
    {
      title: "Organización",
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
      ],
    },
    {
      title: "Operaciones",
      url: "#",
      icon: BoxIcon,
      items: [
        {
          title: WarehouseDocumentTitle,
          url: WarehouseDocumentRoute,
          icon: WarehouseDocumentIcon,
        },
        {
          title: "Kardex",
          url: "/kardex",
          icon: Activity,
        },
        {
          title: "Inventario Valorizado",
          url: "/inventario-valorizado",
          icon: Warehouse,
        },
        {
          title: BoxTitle,
          url: BoxRoute,
          icon: BoxIcon,
        },
        {
          title: BoxShiftTitle,
          url: BoxShiftRoute,
          icon: BoxShiftIcon,
        },
        {
          title: VehicleTitle,
          url: VehicleRoute,
          icon: VehicleIcon,
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
