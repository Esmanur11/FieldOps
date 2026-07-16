export interface User {
  id: number;
  username: string;
  role: string;
  personnelId: number | null;
  personnelName: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  personnelId: number;
}
