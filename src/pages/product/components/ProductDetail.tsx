import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Eye,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Package,
} from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductTechnicalSheets } from "./ProductTechnicalSheets";
import { ProductPriceManager } from "./ProductPriceManager";
import { ProductComponentManager } from "./ProductComponentManager";

export default function ProductDetail() {
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
    <div className="space-y-6 mx-auto max-w-(--breakpoint-lg) w-full pb-10">
      <Card>
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
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Información General</h3>
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
          </div>

          <Separator />

          {/* Technical Sheets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Fichas Técnicas</h3>
            </div>
            <ProductTechnicalSheets
              technicalSheets={product.technical_sheet}
              productId={parseInt(id!)}
            />
          </div>

          <Separator />

          {/* Prices */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Lista de Precios</h3>
            </div>
            <ProductPriceManager productId={parseInt(id!)} />
          </div>

          <Separator />

          {/* Components */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Componentes del Producto
              </h3>
            </div>
            <ProductComponentManager productId={parseInt(id!)} />
          </div>

          <Separator />

          {/* Images */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
            </div>
            <ProductImageGallery productId={parseInt(id!)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
