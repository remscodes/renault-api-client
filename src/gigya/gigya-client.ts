import type { AccountInfoResponse, LoginInfoResponse, LogoutInfoResponse, TokenInfoResponse, TokenPublicInfoResponse } from '@remscodes/renault-api';
import { GigyaApi } from '@remscodes/renault-api';
import type { DrinoInstance, HttpErrorResponse, HttpRequest, HttpResponse } from 'drino';
import drino from 'drino';
import type { ClientInit } from '../models/client-init.model';
import { RenaultSession } from '../renault-session';
import { fixGigyaResponse } from './gigya-fix';

/**
 * Http client to use Gigya API.
 */
export class GigyaClient {

  public constructor(init: ClientInit = {}) {
    const { session = new RenaultSession(), onError } = init;

    this.session = session;

    this.httpClient = drino.create({
      requestsConfig: {
        queryParams: { apikey: GigyaApi.KEY },
        progress: { download: { inspect: false } },
      },
      interceptors: {
        beforeConsume: (req: HttpRequest) => {
          const token: string | undefined = this.session.gigyaToken;
          if (token) req.url.searchParams.set('login_token', token);
        },
        beforeError: (res: HttpErrorResponse) => onError?.(res, this.session),
      },
    });
  }

  /**
   * The user session.
   */
  public session: RenaultSession;

  /** @internal */
  private readonly httpClient: DrinoInstance;

  /**
   * Login to Gigya service.
   * @param {string} loginID - The user login.
   * @param {string} password - The user password.
   */
  public login(loginID: string, password: string): Promise<LoginInfoResponse> {
    return this.httpClient
      .post<LoginInfoResponse>(GigyaApi.LOGIN_URL, {}, {
        queryParams: { loginID, password },
        wrapper: 'response',
      })
      .transform((res: HttpResponse<LoginInfoResponse>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<LoginInfoResponse>) => res.body)
      .check((result: LoginInfoResponse) => this.session.gigyaToken = result.sessionInfo?.cookieValue)
      .consume();
  }

  /**
   * Get account info.
   */
  public getAccountInfo(): Promise<AccountInfoResponse> {
    return this.httpClient
      .post<AccountInfoResponse>(GigyaApi.GET_ACCOUNT_INFO_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<AccountInfoResponse>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<AccountInfoResponse>) => res.body)
      .check((result: AccountInfoResponse) => this.session.personId = result.data?.personId)
      .consume();
  }

  /**
   * Get JWT.
   * @param {number} [expiration = 900] - The chosen expiration (in milliseconds) of the JWT.
   */
  public getJwt(expiration: number = 900): Promise<TokenInfoResponse> {
    return this.httpClient
      .post<TokenInfoResponse>(GigyaApi.GET_JWT_URL, {}, {
        queryParams: {
          fields: ['data.personId', 'data.gigyaDataCenter'],
          expiration: `${expiration}`,
        },
        wrapper: 'response',
      })
      .transform((res: HttpResponse<TokenInfoResponse>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<TokenInfoResponse>) => res.body)
      .check((token: TokenInfoResponse) => this.session.token = token.id_token)
      .consume();
  }

  /**
   * Get public info about JWT key.
   */
  public getJwtPublicKey(): Promise<TokenPublicInfoResponse> {
    return this.httpClient
      .post<TokenPublicInfoResponse>(GigyaApi.GET_JWT_PUBLIC_KEY_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<TokenPublicInfoResponse>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<TokenPublicInfoResponse>) => res.body)
      .consume();
  }

  /**
   * Logout from Gigya service.
   */
  public logout(): Promise<LogoutInfoResponse> {
    return this.httpClient
      .post<LogoutInfoResponse>(GigyaApi.LOGOUT_URL, {}, {
        wrapper: 'response',
      })
      .transform((res: HttpResponse<LogoutInfoResponse>) => fixGigyaResponse(res))
      .transform((res: HttpResponse<LogoutInfoResponse>) => res.body)
      .consume();
  }
}
