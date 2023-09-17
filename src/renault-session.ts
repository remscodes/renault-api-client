import type { Optional } from './shared.model';

interface RenaultSessionInit {
  locale?: string;
  country?: string;
}

export class RenaultSession {

  public constructor(init?: RenaultSessionInit) {
    this.locale = init?.locale ?? 'fr_FR';
    this.country = init?.country ?? 'FR';
  }

  public accessor locale: string;
  public accessor country: string;

  public accessor gigyaToken: Optional<string>;
  public accessor token: Optional<string>;
  public accessor personId: Optional<string>;
  public accessor accountId: Optional<string>;
}
