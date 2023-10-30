import type { KamereonApi } from '@remscodes/renault-api';
import type { Prefixed } from '../../models/shared.model';

export type ReadApiUrl = keyof Omit<typeof KamereonApi, 'KEY' | Prefixed<'PERFORM_'>>
export type PerformApiUrl = keyof Pick<typeof KamereonApi, Extract<keyof typeof KamereonApi, Prefixed<'PERFORM_'>>>
