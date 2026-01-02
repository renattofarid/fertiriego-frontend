import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { SHIPPING_GUIDE_CARRIER } from "../lib/shipping-guide-carrier.interface";

const { ROUTE_ADD } = SHIPPING_GUIDE_CARRIER;

export default function ShippingGuideCarrierActions() {
  return (
    <ActionsWrapper>
      <Button size="sm" asChild>
        <Link to={ROUTE_ADD}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Link>
      </Button>
    </ActionsWrapper>
  );
}
