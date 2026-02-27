export interface EditUserFormValues {
  name: string;
  medicalName: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
}

export interface NormalizedEditUserValues {
  name: string;
  medicalName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
}

