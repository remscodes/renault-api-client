import { GigyaClient } from './gigya/gigya-client';
import { KamereonClient } from './kamereon/kamereon-client';
import type { ClientInit } from './models/client-init.model';
import { RenaultSession } from './renault-session';

/**
 * Http client to use Renault API.
 */
export class RenaultClient {

  public constructor(init?: ClientInit) {
    this.session = init?.session ?? new RenaultSession();

    this.gigya = new GigyaClient({ session: this.session, onError: init?.onError });
    this.kamereon = new KamereonClient({ session: this.session, onError: init?.onError });
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
