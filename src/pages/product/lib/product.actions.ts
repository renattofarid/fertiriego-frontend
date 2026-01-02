import { api } from "@/lib/config";
import {
  PRODUCT,
  type getProductProps,
  type ProductResource,
  type ProductResourceById,
  type ProductResponse,
  type DeleteTechnicalSheetRequest,
  type ProductImageResponse,
  type ProductImageResourceById,
  type CreateProductImageRequest,
  type GetProductImagesProps,
  type ProductPriceResourceById,
  type CreateProductPriceRequest,
  type UpdateProductPriceRequest,
  type GetProductPricesProps,
  type ProductComponentResponse,
  type ProductComponentResourceById,
  type CreateProductComponentRequest,
  type UpdateProductComponentRequest,
  type GetProductComponentsProps,
  type ProductPriceResource,
} from "./product.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PRODUCT;

export async function getProduct({
  params,
}: getProductProps): Promise<ProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProducts(): Promise<ProductResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ProductResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductById(
  id: number
): Promise<ProductResourceById> {
  const response = await api.get<ProductResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeProduct(data: FormData): Promise<ProductResponse> {
  const response = await api.post<ProductResponse>(ENDPOINT, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updateProduct(
  id: number,
  data: FormData
): Promise<ProductResponse> {
  // Para el update usamos POST con _method=PUT como mencionaste
  const response = await api.post<ProductResponse>(`${ENDPOINT}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}

export async function deleteTechnicalSheet(
  productId: number,
  request: DeleteTechnicalSheetRequest
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `${ENDPOINT}/${productId}/technical-sheet`,
    { data: request }
  );
  return data;
}

// Product Images CRUD
export async function getProductImages({
  productId,
  params,
}: GetProductImagesProps): Promise<ProductImageResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductImageResponse>(
    `/productimage?product_id=${productId}`,
    config
  );
  return data;
}

export async function getProductImageById(
  id: number
): Promise<ProductImageResourceById> {
  const response = await api.get<ProductImageResourceById>(
    `/productimage/${id}`
  );
  return response.data;
}

export async function createProductImage(
  request: CreateProductImageRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("product_id", request.product_id.toString());
  formData.append("alt_text", request.alt_text);

  // Agregar múltiples imágenes
  request.image_url.forEach((file, index) => {
    formData.append(`image_url[${index}]`, file);
  });

  const { data } = await api.post<{ message: string }>(
    "/productimage",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function deleteProductImage(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/productimage/${id}`);
  return data;
}

// Product Prices CRUD
export async function getProductPrices({
  productId,
  params,
}: GetProductPricesProps): Promise<ProductPriceResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
      product_id: productId,
    },
  };
  const { data } = await api.get<ProductPriceResource[]>(
    `/productprice`,
    config
  );
  return data;
}

export async function getProductPriceById(
  id: number
): Promise<ProductPriceResourceById> {
  const response = await api.get<ProductPriceResourceById>(
    `/productprice/${id}`
  );
  return response.data;
}

export async function createProductPrice(
  request: CreateProductPriceRequest
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/productprice",
    request
  );
  return data;
}

export async function updateProductPrice(
  id: number,
  request: UpdateProductPriceRequest
): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    `/productprice/${id}`,
    request
  );
  return data;
}

export async function deleteProductPrice(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/productprice/${id}`);
  return data;
}

// Product Components CRUD
export async function getProductComponents({
  productId,
  params,
}: GetProductComponentsProps): Promise<ProductComponentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ProductComponentResponse>(
    `/combocomponent?product_id=${productId}`,
    config
  );
  return data;
}

export async function getProductComponentById(
  id: number
): Promise<ProductComponentResourceById> {
  const response = await api.get<ProductComponentResourceById>(
    `/combocomponent/${id}`
  );
  return response.data;
}

export async function createProductComponent(
  request: CreateProductComponentRequest
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/combocomponent",
    request
  );
  return data;
}

export async function updateProductComponent(
  id: number,
  request: UpdateProductComponentRequest
): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(
    `/combocomponent/${id}`,
    request
  );
  return data;
}

export async function deleteProductComponent(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/combocomponent/${id}`
  );
  return data;
}
