const PHONE_REGEX = /^[0-9]{10}$/;
const GST_REGEX = /^[0-9A-Z]{15}$/;
const OTP_REGEX = /^[0-9]{6}$/;

export const requiredRule = (label: string) => ({
  required: true,
  message: `${label} is required`,
});

export const emailRule = {
  type: "email" as const,
  message: "Please enter a valid email address",
};

export const phoneRule = {
  pattern: PHONE_REGEX,
  message: "Phone number must be 10 digits",
};

export const gstRule = {
  pattern: GST_REGEX,
  message: "GST number must be 15 uppercase alphanumeric characters",
};

export const otpRule = {
  pattern: OTP_REGEX,
  message: "OTP must be exactly 6 digits",
};

export const passwordMinRule = {
  min: 6,
  message: "Password must be at least 6 characters",
};
