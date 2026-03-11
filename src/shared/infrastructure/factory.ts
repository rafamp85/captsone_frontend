import { HttpClient } from './http/HttpClient';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { HttpHealthRepository } from '../../health/infrastructure/adapters/HttpHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { TokenPort } from '../application/ports/TokenPort';
import { LocalStorageTokenAdapter } from './adapters/LocalStorageTokenAdapter';
import { AuthPort } from '../../auth/application/ports/AuthPort';
import { HttpAuthAdapter } from '../../auth/infrastructure/adapters/HttpAuthAdapter';
import { RequestOtpUseCase } from '../../auth/application/RequestOtpUseCase';
import { VerifyOtpUseCase } from '../../auth/application/VerifyOtpUseCase';
import { ProfilePort } from '../../profile/application/ports/ProfilePort';
import { HttpProfileAdapter } from '../../profile/infrastructure/adapters/HttpProfileAdapter';
import { GetProfileUseCase } from '../../profile/application/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../profile/application/UpdateProfileUseCase';
import { LogoutUseCase } from '../../profile/application/LogoutUseCase';

export class Factory {
  private static readonly apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  private static httpClient?: HttpClient;
  private static healthRepository?: HealthRepository;
  private static tokenPort?: TokenPort;
  private static authPort?: AuthPort;
  private static profilePort?: ProfilePort;

  static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.apiBaseUrl);
    }
    return this.httpClient;
  }

  static getHealthRepository(): HealthRepository {
    if (!this.healthRepository) {
      this.healthRepository = new HttpHealthRepository(this.getHttpClient());
    }
    return this.healthRepository;
  }

  static createHealthUseCase(): HealthUseCase {
    return new HealthUseCase(this.getHealthRepository());
  }

  static getTokenPort(): TokenPort {
    if (!this.tokenPort) {
      this.tokenPort = new LocalStorageTokenAdapter();
    }
    return this.tokenPort;
  }

  static getAuthPort(): AuthPort {
    if (!this.authPort) {
      this.authPort = new HttpAuthAdapter(this.getHttpClient());
    }
    return this.authPort;
  }

  static createRequestOtpUseCase(): RequestOtpUseCase {
    return new RequestOtpUseCase(this.getAuthPort());
  }

  static createVerifyOtpUseCase(): VerifyOtpUseCase {
    return new VerifyOtpUseCase(this.getAuthPort(), this.getTokenPort());
  }

  static getProfilePort(): ProfilePort {
    if (!this.profilePort) {
      this.profilePort = new HttpProfileAdapter(this.getHttpClient());
    }
    return this.profilePort;
  }

  static createGetProfileUseCase(): GetProfileUseCase {
    return new GetProfileUseCase(this.getProfilePort());
  }

  static createUpdateProfileUseCase(): UpdateProfileUseCase {
    return new UpdateProfileUseCase(this.getProfilePort());
  }

  static createLogoutUseCase(): LogoutUseCase {
    return new LogoutUseCase(this.getTokenPort());
  }
}
