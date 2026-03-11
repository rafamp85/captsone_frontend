import { TokenPort } from '../../shared/application/ports/TokenPort';

export class LogoutUseCase {
  constructor(private readonly tokenPort: TokenPort) {}

  execute(): void {
    this.tokenPort.clearToken();
  }
}
