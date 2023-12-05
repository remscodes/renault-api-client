import type { KamereonApi } from '@remscodes/renault-api';
import type { MethodsOf, Optional, PrefixWith } from '../../models/shared.model';
import type { KamereonClient } from '../kamereon-client';

/** @internal **/
export interface ReadArgs extends CommonArgs {
  apiUrl: ReadApiUrl;
  queryParams?: URLSearchParams;
}

/** @internal **/
export interface PerformArgs extends CommonArgs {
  apiUrl: PerformApiUrl;
  data: any;
}

/** @internal **/
interface CommonArgs {
  method: KamereonMethod;
  accountId: Optional<string>;
  vin: Optional<string>;
}

/** @internal **/
export type ReadApiUrl = keyof Omit<typeof KamereonApi, 'KEY' | PrefixWith<'PERFORM_'>>

/** @internal **/
export type PerformApiUrl = keyof Pick<typeof KamereonApi, Extract<keyof typeof KamereonApi, PrefixWith<'PERFORM_'>>>

/** @internal **/
export type KamereonMethod = keyof MethodsOf<KamereonClient> & string;
