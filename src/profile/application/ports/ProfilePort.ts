import { ProfileDTO } from '../ProfileDTO';

export interface ProfilePort {
  getProfile(): Promise<ProfileDTO>;
  updateProfile(name: string): Promise<void>;
}
