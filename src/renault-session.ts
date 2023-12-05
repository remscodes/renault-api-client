import type { Optional } from './models/shared.model';

interface SessionInit {
  locale?: string;
  country?: string;
}

/**
 * Session to store user info.
 */
export class RenaultSession {

  public constructor(init?: SessionInit) {
    this.locale = init?.locale ?? 'fr_FR';
    this.country = init?.country ?? 'FR';
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
   * Automatically set when Gigya login API is called and succeed.
   */
  public gigyaToken: Optional<string>;
  /**
   * Token to use Kamereon API.
   *
   * Automatically set when Gigya getJWT API is called and succeed.
   */
  public token: Optional<string>;
  /**
   * Selected person id.
   *
   * Automatically set when Gigya getAccountInfo API is called and succeed.
   */
  public personId: Optional<string>;
  /**
   * Selected account id.
   *
   * To be set in order to be automatically passed into each Kamereon API functions that needs it.
   *
   * Otherwise, it needs to be manually passed as function argument using `KamereonClient`.
   */
  public accountId: Optional<string>;
  /**
   * Selected vehicle vin.
   *
   * To be set in order to be automatically passed into each Kamereon API functions that needs it.
   *
   * Otherwise, it needs to be manually passed as function argument using `KamereonClient`.
   */
  public vin: Optional<string>;
}
