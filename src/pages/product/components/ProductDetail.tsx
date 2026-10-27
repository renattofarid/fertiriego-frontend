import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Package,
  List,
  Pencil,
} from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductTechnicalSheets } from "./ProductTechnicalSheets";
import { ProductPriceManager } from "./ProductPriceManager";
import { ProductComponentManager } from "./ProductComponentManager";
import { ProductWarehouseStock } from "./ProductWarehouseStock";
import FormWrapper from "@/components/FormWrapper";
import TitleComponent from "@/components/TitleComponent";
import { PRODUCT } from "../lib/product.interface";
import { GroupFormSection } from "@/components/GroupFormSection";

export default function ProductDetail() {
  const { ICON, ROUTE } = PRODUCT;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isFinding, fetchProduct } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id, fetchProduct]);

  const handleBackToList = () => {
    navigate(ROUTE);
  };

  if (isFinding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Producto no encontrado</p>
          <Button onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  const productId = parseInt(id!);

  const formatNumber = (value: number | string | null, max: number) =>
    value != null && value !== ""
      ? Number(value).toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: max,
        })
      : "-";

  const weight = Number(product.weight ?? 0);

  return (
    <FormWrapper>
      <TitleComponent
        title={product.name}
        subtitle={[product.category_name, product.brand_name]
          .filter(Boolean)
          .join(" · ")}
        icon={ICON}
        backRoute={ROUTE}
        className="min-w-0"
      >
        <Button
          size="sm"
          className="mt-3 md:mt-0"
          onClick={() => navigate(`${ROUTE}/actualizar/${productId}`)}
        >
          <Pencil className="size-4" />
          Editar
        </Button>
      </TitleComponent>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        {/* Columna principal: datos, stock, componentes y precios */}
        <div className="space-y-4 lg:col-span-2">
          <GroupFormSection
            title="Información General"
            cols={{ sm: 1 }}
            icon={List}
          >
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              {(
                [
                  ["PEN", "Costo (S/)"],
                  ["USD", "Costo (US$)"],
                  ["EUR", "Costo (€)"],
                ] as const
              ).map(([currency, label]) => (
                <div key={currency}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatNumber(
                      product.costs?.[currency] ??
                        (currency === "PEN" ? product.cost : 0),
                      4,
                    )}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-muted-foreground">Unidad</dt>
                <dd className="font-medium">{product.unit_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Peso</dt>
                <dd className="font-medium tabular-nums">
                  {weight > 0
                    ? `${weight.toLocaleString("es-PE", {
                        maximumFractionDigits: 3,
                      })} kg`
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">IGV</dt>
                <dd className="font-medium">
                  {product.is_igv ? "Incluye IGV" : "No incluye IGV"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Tipo</dt>
                <dd className="pt-0.5">
                  <Badge variant="outline">{product.product_type_name}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Categoría</dt>
                <dd className="font-medium">{product.category_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Marca</dt>
                <dd className="font-medium">{product.brand_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Creado el</dt>
                <dd className="font-medium">
                  {new Date(product.created_at).toLocaleDateString("es-PE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>

              {product.observations && (
                <div className="col-span-2 md:col-span-4">
                  <dt className="text-xs text-muted-foreground">
                    Observaciones
                  </dt>
                  <dd className="max-w-prose whitespace-pre-line text-sm">
                    {product.observations}
                  </dd>
                </div>
              )}
            </dl>
          </GroupFormSection>

          <ProductWarehouseStock productId={productId} />

          <GroupFormSection
            title="Componentes del Producto"
            cols={{ sm: 1 }}
            icon={Package}
          >
            <ProductComponentManager productId={productId} />
          </GroupFormSection>

          <GroupFormSection
            title="Lista de Precios"
            cols={{ sm: 1 }}
            icon={DollarSign}
          >
            <ProductPriceManager productId={productId} />
          </GroupFormSection>
        </div>

        {/* Columna lateral: material de apoyo */}
        <div className="space-y-4">
          <GroupFormSection
            title="Galería de Imágenes"
            cols={{ sm: 1 }}
            icon={ImageIcon}
          >
            <ProductImageGallery productId={productId} />
          </GroupFormSection>

          <GroupFormSection
            title="Fichas Técnicas"
            cols={{ sm: 1 }}
            icon={FileText}
          >
            <ProductTechnicalSheets
              technicalSheets={product.technical_sheet ?? []}
              productId={productId}
            />
          </GroupFormSection>

        </div>
      </div>
    </FormWrapper>
  );
}
