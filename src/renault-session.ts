import type { Optional } from './models/shared.model';

interface RenaultSessionInit {
  locale?: string;
  country?: string;
}

export class RenaultSession {

  public constructor(init?: RenaultSessionInit) {
    this.locale = init?.locale ?? 'fr_FR';
    this.country = init?.country ?? 'FR';
  }

  public readonly locale: string;
  public readonly country: string;

  public gigyaToken: Optional<string>;
  public token: Optional<string>;

  public personId: Optional<string>;
  public accountId: Optional<string>;
}
