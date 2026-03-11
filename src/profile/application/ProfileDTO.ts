export interface ProfileDTO {
  name: string;
  email: string;
}

export interface GetProfileResultDTO {
  success: boolean;
  profile?: ProfileDTO;
  message?: string;
}

export interface UpdateProfileResultDTO {
  success: boolean;
  message?: string;
}
