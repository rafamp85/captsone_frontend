import { ProfilePort } from './ports/ProfilePort';
import { UpdateProfileResultDTO } from './ProfileDTO';
import { UserName } from '../domain/value-objects/UserName';
import { Email } from '../../auth/domain/value-objects/Email';

export class UpdateProfileUseCase {
  constructor(private readonly profilePort: ProfilePort) {}

  async execute(nameValue: string, emailValue: string): Promise<UpdateProfileResultDTO> {
    try {
      const name = UserName.create(nameValue);
      const email = Email.create(emailValue);
      await this.profilePort.updateProfile(name.value, email.value);
      return { success: true };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
