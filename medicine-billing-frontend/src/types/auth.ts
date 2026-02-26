

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


export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface LoginResponse {
  message: string; // "OTP sent to your email"
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
}

export interface SignupResponse {
  message: string;
  user: User;
}



export interface User {
  _id: string;
  name: string;
  medicalName?: string;
  email: string;
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

export interface StatCardProps {
  title: string;
  value: string;
  color?: "blue" | "green" | "yellow" | "red";
}

