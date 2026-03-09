export interface EditUserFormValues {
  name: string;
  email: string;
  phoneNumber?: string;
  medicalStoreId: string;
}

export interface NormalizedEditUserValues {
  name: string;
  email: string;
  phoneNumber: string;
  medicalStoreId: string;
}
