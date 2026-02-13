import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { NotificationPopover } from "./NotificationPopover";

export default function HeaderComponent() {
  const { user } = useAuthStore();

  if (!user) {
    return null; // or a loading state, or redirect to login
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-quaternary">
      <div className="flex">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <div className="flex flex-col items-start">
          <p className="font-medium text-sm tracking-wider uppercase">
            Bienvenido <span className="font-bold">{user.name}</span>
          </p>
          <p className="capitalize text-xs text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <NotificationPopover />
        <NavUser user={user} />
      </div>
    </header>
  );
}
