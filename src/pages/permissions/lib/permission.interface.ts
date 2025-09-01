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
}

export interface getOptionMenuProps {
  params?: Record<string, any>;
}
