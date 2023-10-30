import type { AccountInfo, LoginInfo, TokenInfo } from '@remscodes/renault-api';
import { GigyaApi } from '@remscodes/renault-api';
import type { DrinoInstance, HttpRequest, RequestController } from 'drino';
import drino from 'drino';
import { RenaultSession } from './renault-session';

interface GigyaClientInit {
  session?: RenaultSession;
}

export class GigyaClient {

  public constructor(init: GigyaClientInit) {
    this.session = init.session ?? new RenaultSession();
  }

  private readonly session: RenaultSession;

  private readonly http: DrinoInstance = drino.create({
    interceptors: {
      beforeConsume: (req: HttpRequest) => {
        req.url.searchParams.set('apikey', GigyaApi.KEY);
      }
    }
  });

  public login(loginID: string, password: string): RequestController<LoginInfo> {
    return this.http.post<LoginInfo>(GigyaApi.LOGIN_URL, {}, {
      queryParams: { loginID, password }
    }).check((result: LoginInfo) => {
      this.session.gigyaToken = result.sessionInfo?.cookieValue;
    });
  }

  public getAccountInfo(): RequestController<AccountInfo> {
    return this.http.post<AccountInfo>(GigyaApi.GET_ACCOUNT_INFO_URL, {})
      .check((result: AccountInfo) => {
        this.session.personId = result.data?.personId;
      });
  }

  public getJwt(): RequestController<TokenInfo> {
    return this.http.post<TokenInfo>(GigyaApi.GET_JWT_URL, {})
      .check((token: TokenInfo) => {
        this.session.token = token.id_token;
      });
  }
}
