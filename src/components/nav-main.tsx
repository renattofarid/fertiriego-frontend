"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  const location = useLocation();
  const { state, setOpen } = useSidebar();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Función para verificar si algún subitem coincide con la ruta actual
  const isItemActive = (item: (typeof items)[0]): boolean => {
    if (!item.items) {
      return location.pathname === item.url;
    }
    return item.items.some(
      (subItem) =>
        location.pathname === subItem.url ||
        location.pathname.startsWith(subItem.url + "/"),
    );
  };

  // Función para verificar si un subitem está activo
  const isSubItemActive = (url: string): boolean => {
    // Coincidencia exacta o coincidencia con sub-ruta (seguida de /)
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  // Efecto para abrir automáticamente el collapsible que contiene la ruta actual
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.items) {
        const shouldBeOpen = isItemActive(item);
        newOpenItems[item.title] = shouldBeOpen;
      }
    });
    setOpenItems(newOpenItems);
  }, [location.pathname, items]);

  // Función para manejar el clic en un item cuando el sidebar está colapsado
  const handleItemClick = (itemTitle: string, isOpen: boolean) => {
    if (state === "collapsed") {
      // Si el sidebar está colapsado, abrirlo primero
      setOpen(true);
      // Luego abrir el item
      setOpenItems((prev) => ({
        ...prev,
        [itemTitle]: true,
      }));
    } else {
      // Si el sidebar está expandido, comportamiento normal de toggle
      setOpenItems((prev) => ({
        ...prev,
        [itemTitle]: isOpen,
      }));
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              open={openItems[item.title]}
              onOpenChange={(isOpen) => {
                handleItemClick(item.title, isOpen);
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem className="p-0">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="pr-0 mr-0">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubItemActive(subItem.url)}
                        >
                          <Link to={subItem.url}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive(item)}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
