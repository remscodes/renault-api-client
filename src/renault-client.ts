import { GigyaClient } from './gigya/gigya-client';
import { KamereonClient } from './kamereon/kamereon-client';
import type { ClientInit } from './models/client-init.model';
import { RenaultSession } from './renault-session';

/**
 * Http client to use Renault API.
 */
export class RenaultClient {

  public constructor(init: ClientInit = {}) {
    const { session = new RenaultSession(), onError } = init;

    this.session = session;

    this.gigya = new GigyaClient({ session: this.session, onError });
    this.kamereon = new KamereonClient({ session: this.session, onError });
  }

  /**
   * The user session.
   */
  public session: RenaultSession;

  /**
   * The Gigya http client.
   */
  public readonly gigya: GigyaClient;

  /**
   * The Kamereon http client.
   */
  public readonly kamereon: KamereonClient;
}
