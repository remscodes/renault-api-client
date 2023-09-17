import type { AdapterInfo, BatteryStatus, ChargeHistory, DateFilter, Person, VehicleContract, VehicleDetails, Vehicles } from '@remscodes/renault-api';
import { KamereonApi } from '@remscodes/renault-api';
import type { DrinoInstance, HttpRequest, RequestController } from 'drino';
import drino from 'drino';
import { emitError } from 'thror';
import { RenaultSession } from './renault-session';
import { dateFilterToParams } from './utils';

interface KamereonClientInit {
  session?: RenaultSession;
}

export class KamereonClient {

  public constructor(init: KamereonClientInit) {
    this.session = init.session ?? new RenaultSession();
  }

  private readonly session: RenaultSession;

  private readonly http: DrinoInstance = drino.create({
    interceptors: {
      beforeConsume: (req: HttpRequest) => {
        req.headers.set('apikey', KamereonApi.KEY);
        req.headers.set('Accept', 'application/json');
        req.headers.set('Content-Type', 'application/vnd.api+json');
        req.url.searchParams.set('country', this.session.country);
      }
    }
  });

  public getPerson(personId: string): RequestController<Person> {
    return this.http.get(KamereonApi.PERSON_URL(personId));
  }

  public getAccountVehicles(accountId?: string): RequestController<Vehicles> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.http.get(KamereonApi.ACCOUNT_VEHICLES_URL(requiredAccountId));
  }

  public getVehicleContracts(vin: string, accountId?: string): RequestController<VehicleContract[]> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    const queryParams: Record<string, string> = {
      locale: this.session.locale,
      brand: 'RENAULT',
      connectedServicesContracts: 'true',
      warranty: 'true',
      warrantyMaintenanceContracts: 'true'
    };
    return this.http.get(KamereonApi.VEHICLE_CONTRACTS_URL(requiredAccountId, vin), { queryParams });
  }

  public getVehicleDetails(vin: string, accountId?: string): RequestController<VehicleDetails> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.http.get(KamereonApi.VEHICLE_DETAILS_URL(requiredAccountId, vin));
  }

  public readAdapter(vin: string, accountId?: string): RequestController<AdapterInfo> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.http.get(KamereonApi.READ_ADAPTER_URL(requiredAccountId, vin));
  }

  public readBatteryStatus(vin: string, accountId?: string): RequestController<BatteryStatus> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.http.get(KamereonApi.READ_BATTERY_STATUS_URL(requiredAccountId, vin));
  }

  public readChargeHistory(filter: DateFilter, vin: string, accountId?: string): RequestController<ChargeHistory> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    const queryParams: URLSearchParams = dateFilterToParams(filter, this.session.locale);
    return this.http.get(KamereonApi.READ_CHARGE_HISTORY_URL(requiredAccountId, vin), { queryParams });
  }

  private getAccountIdOrThrow(accountId?: string): string {
    const finalAccountId = accountId || this.session.accountId;
    if (!finalAccountId) emitError('NotFiredRequest', '"accountId" is not defined or not stored in session.');

    return finalAccountId;
  }
}
