export interface TAuth {
  email: string;
  password: string;
}

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: string;
  isDeleted: boolean;
}
