import type { AccountInfo, Person } from '@remscodes/renault-api';
import type { RequestController } from 'drino';
import { GigyaClient } from './gigya/gigya-client';
import { KamereonClient } from './kamereon/kamereon-client';
import { RenaultSession } from './renault-session';
import type { Optional } from './models/shared.model';

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

  public readonly gigya: GigyaClient;
  public readonly kamereon: KamereonClient;

  public accountId: Optional<string>;

  public getAuthInfos(): RequestController<Person> {
    return this.gigya.getJwt()
      .follow(() => this.gigya.getAccountInfo())
      .follow((info: AccountInfo) => this.kamereon.getPerson(info.data!.personId!));
  }
}
