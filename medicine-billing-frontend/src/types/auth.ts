export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface MedicalStore {
  _id: string;
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
        role?: string;
      };
}

export interface User {
  _id: string;
  name: string;
  medicalName?: string;
  email: string;
  medicineId?: string;
  medicalStoreId?: string | MedicalStore | null;
  medicalStore?: MedicalStore | null;
  signature?: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  role: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user?: Pick<User, "_id" | "role" | "medicineId" | "medicalStoreId">;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface StatCardProps {
  title: string;
  value: string;
  color?: "blue" | "green" | "yellow" | "red";
}
