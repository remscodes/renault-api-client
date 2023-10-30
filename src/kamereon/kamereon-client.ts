import type { AdapterInfo, BatteryStatus, ChargeHistory, ChargeMode, ChargeModeInputs, Charges, ChargeScheduleInputs, ChargingSettings, Cockpit, DateFilter, HvacHistory, HvacScheduleInputs, HvacSessions, HvacSettings, HvacStartInputs, HvacStatus, LockStatus, NotificationSettingsData, Person, ResStateData, VehicleContract, VehicleDetails, VehicleLocation, Vehicles } from '@remscodes/renault-api';
import { KamereonApi, PERIOD_TZ_FORMAT } from '@remscodes/renault-api';
import type { DrinoInstance, HttpRequest, RequestController } from 'drino';
import drino from 'drino';
import { emitError } from 'thror';
import { RenaultSession } from '../renault-session';
import { dateFilterToParams, formatDate } from '../utils/date-utils';
import type { PerformApiUrl, ReadApiUrl } from './models/kamereon-url.models';

interface KamereonClientInit {
  session?: RenaultSession;
}

export class KamereonClient {

  public constructor(init: KamereonClientInit) {
    this.session = init.session ?? new RenaultSession();
  }

  private readonly session: RenaultSession;

  private readonly httpClient: DrinoInstance = drino.create({
    interceptors: {
      beforeConsume: (req: HttpRequest) => {
        req.headers.set('apikey', KamereonApi.KEY);
        req.headers.set('accept', 'application/json');
        req.headers.set('content-type', 'application/vnd.api+json');
        req.url.searchParams.set('country', this.session.country);
      },
    },
  });

  public getPerson(personId: string): RequestController<Person> {
    return this.httpClient.get(KamereonApi.PERSON_URL(personId));
  }

  public getAccountVehicles(accountId?: string): RequestController<Vehicles> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.httpClient.get(KamereonApi.ACCOUNT_VEHICLES_URL(requiredAccountId));
  }

  public getVehicleContracts(vin: string, accountId?: string): RequestController<VehicleContract[]> {
    const queryParams: Record<string, string> = {
      locale: this.session.locale,
      brand: 'RENAULT',
      connectedServicesContracts: 'true',
      warranty: 'true',
      warrantyMaintenanceContracts: 'true',
    };
    return this.readKamereon('VEHICLE_CONTRACTS_URL', vin, accountId, queryParams);
  }

  public getVehicleDetails(vin: string, accountId?: string): RequestController<VehicleDetails> {
    return this.readKamereon('VEHICLE_DETAILS_URL', vin, accountId);
  }

  public readAdapter(vin: string, accountId?: string): RequestController<AdapterInfo> {
    return this.readKamereon('READ_ADAPTER_URL', vin, accountId);
  }

  public readBatteryStatus(vin: string, accountId?: string): RequestController<BatteryStatus> {
    return this.readKamereon('READ_BATTERY_STATUS_URL', vin, accountId);
  }

  public readChargeHistory(filter: DateFilter, vin: string, accountId?: string): RequestController<ChargeHistory> {
    const queryParams: URLSearchParams = dateFilterToParams(filter, this.session.locale);
    return this.readKamereon('READ_CHARGE_HISTORY_URL', vin, accountId, queryParams);
  }

  public readChargeMode(vin: string, accountId?: string): RequestController<ChargeMode> {
    return this.readKamereon('READ_CHARGE_MODE_URL', vin, accountId);
  }

  public readCharges(filter: Omit<DateFilter, 'period'>, vin: string, accountId?: string): RequestController<Charges> {
    const queryParams: URLSearchParams = dateFilterToParams(filter, this.session.locale);
    return this.readKamereon('READ_CHARGES_URL', vin, accountId, queryParams);
  }

  public readChargingSettings(vin: string, accountId?: string): RequestController<ChargingSettings> {
    return this.readKamereon('READ_CHARGING_SETTINGS_URL', vin, accountId);
  }

  public readCockpit(vin: string, accountId?: string): RequestController<Cockpit> {
    return this.readKamereon('READ_COCKPIT_URL', vin, accountId);
  }

  public readHvacHistory(filter: DateFilter, vin: string, accountId?: string): RequestController<HvacHistory> {
    const queryParams: URLSearchParams = dateFilterToParams(filter, this.session.locale);
    return this.readKamereon('READ_HVAC_HISTORY_URL', vin, accountId, queryParams);
  }

  public readHvacSessions(filter: Omit<DateFilter, 'period'>, vin: string, accountId?: string): RequestController<HvacSessions> {
    const queryParams: URLSearchParams = dateFilterToParams(filter, this.session.locale);
    return this.readKamereon('READ_HVAC_SESSIONS_URL', vin, accountId, queryParams);
  }

  public readHvacStatus(vin: string, accountId?: string): RequestController<HvacStatus> {
    return this.readKamereon('READ_HVAC_STATUS_URL', vin, accountId);
  }

  public readHvacSettings(vin: string, accountId?: string): RequestController<HvacSettings> {
    return this.readKamereon('READ_HVAC_SETTINGS_URL', vin, accountId);
  }

  public readLocation(vin: string, accountId?: string): RequestController<VehicleLocation> {
    return this.readKamereon('READ_LOCATION_URL', vin, accountId);
  }

  public readLockStatus(vin: string, accountId?: string): RequestController<LockStatus> {
    return this.readKamereon('READ_LOCK_STATUS_URL', vin, accountId);
  }

  public readNotificationSettings(vin: string, accountId?: string): RequestController<NotificationSettingsData> {
    return this.readKamereon('READ_NOTIFICATION_SETTINGS_URL', vin, accountId);
  }

  public readResState(vin: string, accountId?: string): RequestController<ResStateData> {
    return this.readKamereon('READ_RES_STATE_URL', vin, accountId);
  }

  public performChargeMode({ action }: ChargeModeInputs, vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargeMode',
      attributes: { action },
    };
    return this.performKamereon('PERFORM_CHARGE_MODE_URL', body, vin, accountId);
  }

  public performChargeSchedule({ schedules }: ChargeScheduleInputs, vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargeSchedule',
      attributes: { schedules },
    };
    return this.performKamereon('PERFORM_CHARGE_SCHEDULE_URL', body, vin, accountId);
  }

  public performHvacSchedule({ schedules }: HvacScheduleInputs, vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'HvacSchedule',
      attributes: { schedules },
    };
    return this.performKamereon('PERFORM_HVAC_SCHEDULE_URL', body, vin, accountId);
  }

  public performHvacStart({ targetTemperature, startDateTime }: HvacStartInputs, vin: string, accountId?: string): RequestController<any> {
    const body: any = {
      type: 'HvacStart',
      attributes: {
        action: 'start',
        targetTemperature,
      },
    };
    if (startDateTime) body.attributes.startDateTime = formatDate(startDateTime, PERIOD_TZ_FORMAT, this.session.locale);
    return this.performKamereon('PERFORM_HVAC_START_URL', body, vin, accountId);
  }

  public performHvacStop(vin: string, accountId: string): RequestController<any> {
    const body = {
      type: 'HvacStart',
      attributes: {
        action: 'cancel',
      },
    };
    return this.performKamereon('PERFORM_HVAC_START_URL', body, vin, accountId);
  }

  public performChargeStart(vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargingStart',
      attributes: { action: 'start' },
    };
    return this.performKamereon('PERFORM_CHARGING_START_URL', body, vin, accountId);
  }

  public performChargeStop(vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargingStart',
      attributes: { action: 'stop' },
    };
    return this.performKamereon('PERFORM_CHARGING_START_URL', body, vin, accountId);
  }

  public performChargeResume(vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargingStart',
      attributes: { action: 'start' },
    };
    return this.performKamereon('PERFORM_PAUSE_RESUME_URL', body, vin, accountId);
  }

  public performChargePause(vin: string, accountId?: string): RequestController<any> {
    const body = {
      type: 'ChargingStart',
      attributes: { action: 'stop' },
    };
    return this.performKamereon('PERFORM_PAUSE_RESUME_URL', body, vin, accountId);
  }

  private readKamereon<T>(apiUrl: ReadApiUrl, vin: string, accountId: string | undefined, queryParams?: URLSearchParams | Record<string, string>): RequestController<T> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.httpClient.get(KamereonApi[apiUrl](requiredAccountId, vin), { queryParams });
  }

  private performKamereon<T>(apiUrl: PerformApiUrl, body: any, vin: string, accountId: string | undefined): RequestController<T> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId);
    return this.httpClient.post(KamereonApi[apiUrl](requiredAccountId, vin), body);
  }

  private getAccountIdOrThrow(accountId?: string): string {
    const finalAccountId = accountId || this.session.accountId;
    if (!finalAccountId) emitError('KamereonException', '"accountId" is not defined or not stored in session.');

    return finalAccountId;
  }
}
