import { useState } from "react";
import { useProductImages } from "../lib/product-image.hook";
import { useProductImageStore } from "../lib/product-image.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { Upload, Plus, Trash2, Eye } from "lucide-react";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { useProductStore } from "../lib/product.store";
import { prodAssetURL } from "@/lib/config";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ProductImageGalleryProps {
  productId: number;
}

export function ProductImageGallery({ productId }: ProductImageGalleryProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [altText, setAltText] = useState("");
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: productImages } = useProductImages({
    productId,
    params: {},
  });

  const {
    createProductImage: createProductImageStore,
    deleteProductImage: deleteProductImageStore,
    isSubmitting: isSubmittingImage,
  } = useProductImageStore();

  const { fetchProduct } = useProductStore();

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;
    try {
      await deleteProductImageStore(deleteImageId);
      await fetchProduct(productId);
      successToast("Imagen eliminada exitosamente");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al eliminar la imagen";
      errorToast(errorMessage);
    } finally {
      setDeleteImageId(null);
    }
  };

  const handleUploadImages = async () => {
    if (!productId || selectedFiles.length === 0) return;
    try {
      await createProductImageStore({
        product_id: productId,
        image_url: selectedFiles,
        alt_text: altText,
      });
      await fetchProduct(productId);
      successToast("Imágenes subidas exitosamente");
      setShowImageUpload(false);
      setSelectedFiles([]);
      setAltText("");
    } catch (error: any) {
      errorToast(
        error.response.data.message ?? error.response.data.error,
        ERROR_MESSAGE(
          {
            name: "Imagen de Producto",
            gender: true,
          },
          "create"
        )
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {productImages?.data.length || 0} imagen(es) disponible(s)
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageUpload(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Imágenes
        </Button>
      </div>

      {/* Images Grid */}
      {productImages?.data && productImages.data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {productImages.data.map((imageData) => (
            <div
              key={imageData.id}
              className="group relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-muted hover:border-border transition-all duration-200"
            >
              <img
                src={prodAssetURL + imageData.image_url}
                alt={imageData.alt_text}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedImage(imageData.image_url)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteImageId(imageData.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Alt text overlay */}
              {imageData.alt_text && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="truncate">{imageData.alt_text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Upload />
            </EmptyMedia>
            <EmptyTitle>No hay imágenes</EmptyTitle>
            <EmptyDescription>
              Sube la primera imagen de este producto
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size={"sm"}
              onClick={() => setShowImageUpload(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir primera imagen
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl max-w-md w-full mx-4 border">
            <h3 className="text-lg font-semibold mb-4">Subir Imágenes</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="images">Seleccionar Imágenes</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="altText">Texto Alternativo</Label>
                <Input
                  id="altText"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descripción de las imágenes"
                  className="mt-1"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    {selectedFiles.length} archivo(s) seleccionado(s)
                  </p>
                  <div className="max-h-20 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <p
                        key={index}
                        className="text-xs text-muted-foreground truncate"
                      >
                        {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageUpload(false);
                  setSelectedFiles([]);
                  setAltText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUploadImages}
                disabled={selectedFiles.length === 0 || isSubmittingImage}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isSubmittingImage ? "Subiendo..." : "Subir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={prodAssetURL + selectedImage}
              alt="Vista previa"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteImageId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteImageId(null)}
          onConfirm={handleDeleteImage}
        />
      )}
    </div>
  );
}
