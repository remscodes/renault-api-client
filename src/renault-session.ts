import type { Optional } from './models/shared.model';

interface RenaultSessionInit {
  locale?: string;
  country?: string;
}

/**
 * Session to store user info.
 */
export class RenaultSession {

  public constructor(init?: RenaultSessionInit) {
    this.locale = init?.locale ?? 'fr_FR';
    this.country = init?.country ?? 'FR';
  }

  /**
   * Locale that will be used to format date.
   * @default "fr_FR"
   */
  public locale: string;
  /**
   * Country code that will use as http param for Kamereon.
   * @default "FR"
   */
  public country: string;

  /**
   * Token to use Gigya getJWT API.
   * Get by Gigya login API.
   */
  public gigyaToken: Optional<string>;
  /**
   * Token to use Kamereon API.
   * Get by Gigya getJWT API.
   */
  public token: Optional<string>;
  /**
   * Selected person id.
   */
  public personId: Optional<string>;
  /**
   * Selected account id.
   */
  public accountId: Optional<string>;
}
