import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import HeaderComponent from "./header";

interface Props {
  children: React.ReactNode;
}

export default function LayoutComponent({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <HeaderComponent />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
