import type { HttpErrorResponse } from 'drino';
import type { RenaultSession } from '../renault-session';

export interface ClientInit {
  session?: RenaultSession;
  onError?: (errorResponse: HttpErrorResponse) => void;
}
