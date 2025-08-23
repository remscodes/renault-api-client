interface SessionInit {
  locale?: string;
  country?: string;
}

/**
 * Session to store user info.
 */
export class RenaultSession {

  public constructor(init: SessionInit = {}) {
    const { locale = 'fr_FR', country = 'FR' } = init;
    this.locale = locale;
    this.country = country;
  }

  /**
   * Locale that will be used to format date.
   *
   * @default "fr_FR"
   */
  public locale: string;
  /**
   * Country code that will use as http param for Kamereon.
   *
   * @default "FR"
   */
  public country: string;

  /**
   * Token to use Gigya getJWT API.
   *
   * Automatically set when Gigya login API is called and succeeds.
   */
  public gigyaToken: string | undefined;
  /**
   * Token to use Kamereon API.
   *
   * Automatically set when Gigya getJWT API is called and succeeds.
   */
  public token: string | undefined;
  /**
   * Selected person id.
   *
   * Automatically set when Gigya getAccountInfo API is called and succeeds.
   */
  public personId: string | undefined;
  /**
   * Selected account id.
   *
   * To be set to be automatically passed into each Kamereon API function that needs it.
   *
   * Otherwise, it needs to be manually passed as a function argument using `KamereonClient`.
   */
  public accountId: string | undefined;
  /**
   * Selected vehicle vin.
   *
   * To be set to be automatically passed into each Kamereon API function that needs it.
   *
   * Otherwise, it needs to be manually passed as a function argument using `KamereonClient`.
   */
  public vin: string | undefined;
}
