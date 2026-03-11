import { LogoutUseCase } from '../../../application/LogoutUseCase';
import { TokenPort } from '../../../../shared/application/ports/TokenPort';
import { Maybe } from '../../../../shared/domain/Maybe';

function stubTokenPort(): TokenPort {
  return {
    savedToken: Maybe.some('existing-token'),
    saveToken() {},
    getToken() {
      return this.savedToken;
    },
    clearToken() {
      this.savedToken = Maybe.none();
    },
  } as TokenPort & { savedToken: Maybe<string> };
}

describe('The Logout', () => {
  it('clears the authentication token', () => {
    const tokenPort = stubTokenPort();
    const useCase = new LogoutUseCase(tokenPort);

    useCase.execute();

    expect(tokenPort.getToken().isNone()).toBe(true);
  });
});
