export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  person_id: number;
  person_names: string;
  rol_id: number;
  rol_name: string;
}
