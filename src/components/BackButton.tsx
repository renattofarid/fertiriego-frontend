import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackButton = ({
  route = "",
  name = "",
  fullname = true,
  variant = "outline",
  size = "sm",
}: {
  route: string;
  name: string;
  fullname?: boolean;
  size?: "sm" | "lg" | "icon" | "default";
  variant?: "outline" | "default" | "ghost" | "link" | "destructive";
}) => (
  <div className="lg:col-span-1 space-y-6">
    <Link to={route} className="w-full flex justify-center items-center gap-2">
      <Button variant={variant} size={size}>
        <ChevronLeft className="w-4 h-4" />
        {size !== "icon"
          ? fullname
            ? "Regresar a " + name
            : "Regresar"
          : null}
      </Button>
    </Link>
  </div>
);

export default BackButton;
