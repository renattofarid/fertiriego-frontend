export interface PermissionResource {
  id: number;
  name: string;
  action: string;
  route: string;
  type: null;
  status: string;
}

export interface OptionMenuResponse {
  data: OptionMenuResource[];
}

export interface OptionMenuResource {
  id: number;
  name: string;
  action: string;
  route: string;
  type: string;
  status: string;
  group_menu_id: number;
  group_menu_name: string;
  created_at: string;
}

export interface getOptionMenuProps {
  params?: Record<string, any>;
}
