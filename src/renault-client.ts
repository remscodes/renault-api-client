import { GigyaClient } from './gigya/gigya-client';
import { KamereonClient } from './kamereon/kamereon-client';
import { RenaultSession } from './renault-session';

interface RenaultClientInit {
  session?: RenaultSession;
}

export class RenaultClient {

  public constructor(init?: RenaultClientInit) {
    this.session = init?.session ?? new RenaultSession();

    this.gigya = new GigyaClient({ session: this.session });
    this.kamereon = new KamereonClient({ session: this.session });
  }

  public readonly session: RenaultSession;

  public readonly gigya: GigyaClient;
  public readonly kamereon: KamereonClient;
}
