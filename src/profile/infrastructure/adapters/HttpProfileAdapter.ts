import { ProfilePort } from '../../application/ports/ProfilePort';
import { ProfileDTO } from '../../application/ProfileDTO';
import { HttpClient } from '../../../shared/infrastructure/http/HttpClient';
import { TokenPort } from '../../../shared/application/ports/TokenPort';
import { Endpoints } from '../../../shared/infrastructure/http/endpoints';

interface ProfileResponse {
  fullName: string;
  email: string;
}

export class HttpProfileAdapter implements ProfilePort {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenPort: TokenPort
  ) {}

  async getProfile(): Promise<ProfileDTO> {
    const response = await this.httpClient.get<ProfileResponse>(Endpoints.Profile, {
      headers: this.authHeaders(),
    });
    return { name: response.fullName, email: response.email };
  }

  async updateProfile(name: string): Promise<void> {
    await this.httpClient.patch(
      Endpoints.Profile,
      { fullName: name, phone: '' },
      {
        headers: this.authHeaders(),
      }
    );
  }

  private authHeaders(): Record<string, string> {
    const token = this.tokenPort.getToken().getOrElse('');
    return { Authorization: `Bearer ${token}` };
  }
}
