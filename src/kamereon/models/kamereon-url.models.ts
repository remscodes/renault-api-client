import type { KamereonApi } from '@remscodes/renault-api';
import type { PrefixWith } from '../../models/shared.model';

/** @internal **/
export type ReadApiUrl = keyof Omit<typeof KamereonApi, 'KEY' | PrefixWith<'PERFORM_'>>

/** @internal **/
export type PerformApiUrl = keyof Pick<typeof KamereonApi, Extract<keyof typeof KamereonApi, PrefixWith<'PERFORM_'>>>
