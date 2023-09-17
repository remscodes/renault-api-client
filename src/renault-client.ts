import { GigyaClient } from './gigya-client';
import { KamereonClient } from './kamereon-client';
import { RenaultSession } from './renault-session';
import type { Optional } from './shared.model';

interface RenaultClientInit {
  session?: RenaultSession;
}

export class RenaultClient {

  public constructor(init?: RenaultClientInit) {
    this.session = init?.session ?? new RenaultSession();

    this.gigya = new GigyaClient({ session: this.session });
    this.kamereon = new KamereonClient({ session: this.session });
  }

  private readonly session: RenaultSession;

  public accessor accountId: Optional<string>;

  public readonly gigya: GigyaClient;
  public readonly kamereon: KamereonClient;
}
