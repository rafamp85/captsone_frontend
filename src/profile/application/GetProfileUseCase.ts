import { ProfilePort } from './ports/ProfilePort';
import { GetProfileResultDTO } from './ProfileDTO';

export class GetProfileUseCase {
  constructor(private readonly profilePort: ProfilePort) {}

  async execute(): Promise<GetProfileResultDTO> {
    try {
      const profile = await this.profilePort.getProfile();
      return { success: true, profile };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
