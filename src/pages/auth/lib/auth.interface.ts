export interface AuthResponse {
  token: string;
  user: User;
  role: string;
  access: Access[];
  message: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  person_id: number;
  person: Person;
  rol_id: number;
  rol_name: string;
}

export interface Person {
  id: number;
  type_document: string;
  type_person: string;
  number_document: string;
  names: string;
  father_surname: string;
  mother_surname: string;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  ocupation: string;
  status: string;
}

export interface Access {
  id: number;
  name: string;
  icon: string;
  nivel: number;
  permissions: Permission[];
  children?: Access[];
}

export interface Permission {
  name: string;
  actions: string[];
  routes: string[];
  status: string;
}
