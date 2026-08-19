import { api } from "@/lib/config";
import { PRODUCT_TAG } from "./product-tag.interface";
import type {
  AssignClassificationRequest,
  AssignClassificationResponse,
  ClassificationResponse,
} from "./classification.interface";

const { ENDPOINT } = PRODUCT_TAG;

export async function assignClassification(
  data: AssignClassificationRequest,
): Promise<AssignClassificationResponse> {
  const response = await api.post<AssignClassificationResponse>(
    `${ENDPOINT}/assign-classification`,
    data,
  );
  return response.data;
}

export async function getProductClassifications(
  productId: number,
): Promise<ClassificationResponse> {
  const response = await api.get<ClassificationResponse>(
    `${ENDPOINT}/${productId}/classifications`,
  );
  return response.data;
}
