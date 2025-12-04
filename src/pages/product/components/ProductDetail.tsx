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
} from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductTechnicalSheets } from "./ProductTechnicalSheets";
import { ProductPriceManager } from "./ProductPriceManager";
import { ProductComponentManager } from "./ProductComponentManager";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PRODUCT } from "../lib/product.interface";
import { GroupFormSection } from "@/components/GroupFormSection";

export default function ProductDetail() {
  const { MODEL, ICON } = PRODUCT;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isFinding, fetchProduct } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id, fetchProduct]);

  const handleBackToList = () => {
    navigate("/productos");
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

  return (
    <FormWrapper>
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles del Producto
            </CardTitle>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader> */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="detail" icon={ICON} />
        </div>
      </div>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Basic Information */}
        <GroupFormSection
          title="Información General"
          cols={{ sm: 1 }}
          icon={List}
          className="col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nombre
              </label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tipo
              </label>
              <div>
                <Badge variant="outline" className="text-sm">
                  {product.product_type_name}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Categoría
              </label>
              <p className="font-medium">{product.category_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Marca
              </label>
              <p className="font-medium">{product.brand_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Unidad
              </label>
              <p className="font-medium">{product.unit_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Fecha de Creación
              </label>
              <p className="font-medium">
                {new Date(product.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </GroupFormSection>

        {/* Technical Sheets */}
        <GroupFormSection
          title="Fichas Técnicas"
          cols={{ sm: 1 }}
          icon={FileText}
        >
          <ProductTechnicalSheets
            technicalSheets={product.technical_sheet}
            productId={parseInt(id!)}
          />
        </GroupFormSection>

        {/* Prices */}
        <GroupFormSection
          title="Lista de Precios"
          cols={{ sm: 1 }}
          icon={DollarSign}
        >
          <ProductPriceManager productId={parseInt(id!)} />
        </GroupFormSection>

        {/* Components */}
        <GroupFormSection
          title="Componentes del Producto"
          cols={{ sm: 1 }}
          icon={Package}
        >
          <ProductComponentManager productId={parseInt(id!)} />
        </GroupFormSection>

        {/* Images */}
        <GroupFormSection
          title="Galería de Imágenes"
          cols={{ sm: 1 }}
          icon={ImageIcon}
        >
          <ProductImageGallery productId={parseInt(id!)} />
        </GroupFormSection>
      </div>
      {/* </Card> */}
    </FormWrapper>
  );
}
