import type { Links, Meta } from "@/lib/pagination.interface";

export interface BoxMovementHistoryResource {
  id: number;
  box_movement_id: number;
  action: string;
  user_id: number;
  previous_data: any;
  new_data: any;
  created_at: string;
  updated_at: string;
}

export interface BoxMovementHistoryResponse {
  data: BoxMovementHistoryResource[];
  links: Links;
  meta: Meta;
}

export interface GetBoxMovementHistoryProps {
  params?: {
    box_movement_id?: number;
    action?: string;
    page?: number;
    per_page?: number;
  };
}

export interface GetHistoriesByMovementProps {
  box_movement_id: number;
}
