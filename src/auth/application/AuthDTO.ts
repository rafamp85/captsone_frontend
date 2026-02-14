export interface RequestOtpResultDTO {
  success: boolean;
  message: string;
}

export interface VerifyOtpResultDTO {
  success: boolean;
  token?: string;
  message?: string;
}
