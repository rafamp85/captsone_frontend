import { ProfilePort } from './ports/ProfilePort';
import { UpdateProfileResultDTO } from './ProfileDTO';
import { UserName } from '../domain/value-objects/UserName';

export class UpdateProfileUseCase {
  constructor(private readonly profilePort: ProfilePort) {}

  async execute(nameValue: string): Promise<UpdateProfileResultDTO> {
    try {
      const name = UserName.create(nameValue);
      await this.profilePort.updateProfile(name.value);
      return { success: true };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
