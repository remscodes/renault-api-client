import type { AccountInfo, LoginInfo, TokenInfo } from '@remscodes/renault-api';
import { GigyaApi } from '@remscodes/renault-api';
import type { DrinoInstance, HttpRequest, RequestController } from 'drino';
import drino from 'drino';
import { RenaultSession } from '../renault-session';
import type { Optional } from '../models/shared.model';

interface GigyaClientInit {
  session?: RenaultSession;
}

export class GigyaClient {

  public constructor(init: GigyaClientInit) {
    this.session = init.session ?? new RenaultSession();
  }

  private readonly session: RenaultSession;

  private readonly httpClient: DrinoInstance = drino.create({
    interceptors: {
      beforeConsume: (req: HttpRequest) => {
        req.url.searchParams.set('apikey', GigyaApi.KEY);

        const token: Optional<string> = this.session.gigyaToken;
        if (token) req.url.searchParams.set('login_token', token);
      },
    },
  });

  public login(loginID: string, password: string): RequestController<LoginInfo> {
    return this.httpClient.post<LoginInfo>(GigyaApi.LOGIN_URL, {}, {
      queryParams: {
        loginID,
        password,
      },
    })
      .check((result: LoginInfo) => {
        this.session.gigyaToken = result.sessionInfo?.cookieValue;
      });
  }

  public getAccountInfo(): RequestController<AccountInfo> {
    return this.httpClient.post<AccountInfo>(GigyaApi.GET_ACCOUNT_INFO_URL, {})
      .check((result: AccountInfo) => {
        this.session.personId = result.data?.personId;
      });
  }

  public getJwt(expiration: number = 900): RequestController<TokenInfo> {
    return this.httpClient.post<TokenInfo>(GigyaApi.GET_JWT_URL, {}, {
      queryParams: {
        fields: 'data.personId,data.gigyaDataCenter',
        expiration: `${expiration}`,
      },
    })
      .check((token: TokenInfo) => {
        this.session.token = token.id_token;
      });
  }
}
