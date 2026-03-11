import { ProfilePort } from '../../application/ports/ProfilePort';
import { ProfileDTO } from '../../application/ProfileDTO';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { Endpoints } from '../../../shared/infrastructure/http/endpoints';

export class HttpProfileAdapter implements ProfilePort {
  constructor(private readonly httpClient: HttpClient) {}

  async getProfile(): Promise<ProfileDTO> {
    return this.httpClient.get<ProfileDTO>(Endpoints.Profile);
  }

  async updateProfile(name: string, email: string): Promise<void> {
    await this.httpClient.put(Endpoints.Profile, { name, email });
  }
}
