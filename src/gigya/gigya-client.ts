import type { AccountInfo, LoginInfo, LogoutInfo, TokenInfo, TokenPublicInfo } from '@remscodes/renault-api';
import { GigyaApi } from '@remscodes/renault-api';
import type { DrinoInstance, HttpRequest, HttpResponse } from 'drino';
import drino from 'drino';
import type { Optional } from '../models/shared.model';
import { RenaultSession } from '../renault-session';
import { fixGigyaResponse } from './gigya-fix';

interface GigyaClientInit {
  session?: RenaultSession;
}

export class GigyaClient {

  public constructor(init: GigyaClientInit) {
    this.session = init.session ?? new RenaultSession();
  }

  public readonly session: RenaultSession;

  private readonly httpClient: DrinoInstance = drino.create({
    requestsConfig: {
      queryParams: { apikey: GigyaApi.KEY },
      progress: { download: { inspect: false } },
    },
    interceptors: {
      beforeConsume: (req: HttpRequest) => {
        const token: Optional<string> = this.session.gigyaToken;
        if (token) req.url.searchParams.set('login_token', token);
      },
    },
  });

  public login(loginID: string, password: string): Promise<LoginInfo> {
    return this.httpClient
      .post<LoginInfo>(GigyaApi.LOGIN_URL, {}, {
        queryParams: { loginID, password },
        wrapper: 'response',
      })
      .transform((res: HttpResponse<LoginInfo>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<LoginInfo>) => res.body)
      .check((result: LoginInfo) => this.session.gigyaToken = result.sessionInfo?.cookieValue)
      .consume();
  }

  public getAccountInfo(): Promise<AccountInfo> {
    return this.httpClient
      .post<AccountInfo>(GigyaApi.GET_ACCOUNT_INFO_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<AccountInfo>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<AccountInfo>) => res.body)
      .check((result: AccountInfo) => this.session.personId = result.data?.personId)
      .consume();
  }

  public getJwt(expiration: number = 900): Promise<TokenInfo> {
    return this.httpClient
      .post<TokenInfo>(GigyaApi.GET_JWT_URL, {}, {
        queryParams: { fields: 'data.personId,data.gigyaDataCenter', expiration: `${expiration}` },
        wrapper: 'response',
      })
      .transform((res: HttpResponse<TokenInfo>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<TokenInfo>) => res.body)
      .check((token: TokenInfo) => this.session.token = token.id_token)
      .consume();
  }

  public getJwtPublicKey(): Promise<TokenPublicInfo> {
    return this.httpClient
      .post<TokenPublicInfo>(GigyaApi.GET_JWT_PUBLIC_KEY_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<TokenPublicInfo>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<TokenPublicInfo>) => res.body)
      .consume();
  }

  public logout(): Promise<LogoutInfo> {
    return this.httpClient
      .post<LogoutInfo>(GigyaApi.LOGOUT_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<LogoutInfo>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<LogoutInfo>) => res.body)
      .consume();
  }
}
