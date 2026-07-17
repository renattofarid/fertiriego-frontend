import type { TagResource } from "./product-tag.interface";

export interface AssignClassificationRequest {
  product_ids: number[];
  tag_ids: number[];
  priority: "A" | "B" | "C";
  notes?: string;
}

export interface AssignClassificationResponse {
  message: string;
  data: {
    assigned: number;
    updated: number;
    total: number;
  };
}

export interface ClassificationTag {
  id: number;
  name: string;
  slug: string;
  color: string;
  type: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassificationItem {
  id: number;
  product_id: number;
  tag_id: number;
  priority: "A" | "B" | "C";
  notes: string | null;
  assigned_at: string;
  tag: TagResource;
  assigned_by: { id: number; name: string };
  created_at: string;
}

export interface ClassificationProduct {
  id: number;
  name: string;
  product_type: string;
  category: string;
  brand: string;
}

export interface ClassificationResponse {
  message: string;
  data: {
    product: ClassificationProduct;
    current_classifications: ClassificationItem[];
    classification_history: ClassificationItem[];
  };
}
