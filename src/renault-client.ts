import { GigyaClient } from './gigya/gigya-client';
import { KamereonClient } from './kamereon/kamereon-client';
import { RenaultSession } from './renault-session';

interface RenaultClientInit {
  session?: RenaultSession;
}

/**
 * Http client to use Renault API.
 */
export class RenaultClient {

  public constructor(init?: RenaultClientInit) {
    this.session = init?.session ?? new RenaultSession();

    this.gigya = new GigyaClient({ session: this.session });
    this.kamereon = new KamereonClient({ session: this.session });
  }

  /**
   * The user session.
   */
  public readonly session: RenaultSession;

  /**
   * The sub Gigya http client.
   */
  public readonly gigya: GigyaClient;

  /**
   * The sub Kamereon http client.
   */
  public readonly kamereon: KamereonClient;
}
