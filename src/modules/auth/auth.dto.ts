export type SignupDTO = {
  name: string;
  email: string;
  password: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type ConfirmEmailDTO = {
  email: string;
  otp: string;
};

export type ResendOtpDTO = {
  email: string;
};

export type ForgotPasswordDTO = {
  email: string;
};

export type ChangePasswordDTO = {
  email: string;
  otp: string;
  newPassword: string;
};

export type RefreshTokenDTO = {
  token: string;
};