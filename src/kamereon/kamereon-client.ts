import type { ActionChargeMode, AdapterInfo, BatteryStatus, ChargeHistory, ChargeMode, ChargeModeInputs, Charges, ChargeScheduleInputs, ChargingSettings, Cockpit, DateFilter, HvacHistory, HvacScheduleInputs, HvacSessions, HvacSettings, HvacStartInputs, HvacStatus, LockStatus, NotificationSettingsData, Person, ResStateData, VehicleContract, VehicleDetails, VehicleLocation, Vehicles } from '@remscodes/renault-api';
import { KamereonApi, PERIOD_TZ_FORMAT } from '@remscodes/renault-api';
import type { DrinoInstance, HttpErrorResponse, HttpRequest } from 'drino';
import drino from 'drino';
import { emitError } from 'thror';
import type { ClientInit } from '../models/client-init.model';
import type { Optional } from '../models/shared.model';
import { RenaultSession } from '../renault-session';
import { dateFilterToParams, formatDate } from '../utils/date-utils';
import type { KamereonMethod, PerformArgs, ReadArgs } from './models/kamereon-client.models';

/**
 * Http client to use Kamereon API.
 */
export class KamereonClient {

  public constructor(init?: ClientInit) {
    this.session = init?.session ?? new RenaultSession();

    this.httpClient = drino.create({
      requestsConfig: {
        headers: {
          apikey: KamereonApi.KEY,
          accept: 'application/json',
          'content-type': 'application/vnd.api+json',
        },
        progress: { download: { inspect: false } },
      },
      interceptors: {
        beforeConsume: (req: HttpRequest) => {
          const token: Optional<string> = this.session.token;
          if (token) req.headers.set('x-gigya-id_token', token);

          req.url.searchParams.set('country', this.session.country);
        },
        beforeError: (res: HttpErrorResponse) => init?.onError?.(res, this.session),
      },
    });
  }

  /**
   * The user session.
   */
  public readonly session: RenaultSession;

  /** @internal */
  private readonly httpClient: DrinoInstance;

  /**
   * Get user person info.
   * @param {string?} [personId = the personId stored in the session] - The person id.
   */
  public getPerson(personId?: string): Promise<Person> {
    const requiredPersonId: string = this.getPersonIdOrThrow(personId, 'getPerson');
    return this.httpClient
      .get<Person>(KamereonApi.PERSON_URL(requiredPersonId))
      .consume();
  }

  /**
   * Get user vehicles.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public getAccountVehicles(accountId?: string): Promise<Vehicles> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId, 'getAccountVehicles');
    return this.httpClient
      .get<Vehicles>(KamereonApi.ACCOUNT_VEHICLES_URL(requiredAccountId))
      .consume();
  }

  /**
   * Get user vehicle contracts.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public getVehicleContracts(vin?: string, accountId?: string): Promise<VehicleContract[]> {
    return this.read({
      apiUrl: 'VEHICLE_CONTRACTS_URL',
      method: 'getVehicleContracts',
      accountId,
      vin,
      queryParams: new URLSearchParams({
        locale: this.session.locale,
        brand: 'RENAULT',
        connectedServicesContracts: 'true',
        warranty: 'true',
        warrantyMaintenanceContracts: 'true',
      }),
    });
  }

  /**
   * Get user vehicle details.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public getVehicleDetails(vin?: string, accountId?: string): Promise<VehicleDetails> {
    return this.read({
      apiUrl: 'VEHICLE_DETAILS_URL',
      method: 'getVehicleDetails',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle adapter info.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readAdapter(vin?: string, accountId?: string): Promise<AdapterInfo> {
    return this.read({
      apiUrl: 'READ_ADAPTER_URL',
      method: 'readAdapter',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle battery status.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readBatteryStatus(vin?: string, accountId?: string): Promise<BatteryStatus> {
    return this.read({
      apiUrl: 'READ_BATTERY_STATUS_URL',
      method: 'readBatteryStatus',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle charge history.
   * @param {DateFilter} filter - The date filter.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readChargeHistory(filter: DateFilter, vin?: string, accountId?: string): Promise<ChargeHistory> {
    return this.read({
      apiUrl: 'READ_CHARGE_HISTORY_URL',
      method: 'readChargeHistory',
      accountId,
      vin,
      queryParams: dateFilterToParams(filter, this.session.locale),
    });
  }

  /**
   * Get vehicle charge mode.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readChargeMode(vin?: string, accountId?: string): Promise<ChargeMode> {
    return this.read({
      apiUrl: 'READ_CHARGE_MODE_URL',
      method: 'readChargeMode',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle charges.
   * @param {Omit<DateFilter, 'period'>} filter - The date filter.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readCharges(filter: Omit<DateFilter, 'period'>, vin?: string, accountId?: string): Promise<Charges> {
    return this.read({
      apiUrl: 'READ_CHARGES_URL',
      method: 'readCharges',
      accountId,
      vin,
      queryParams: dateFilterToParams(filter, this.session.locale),
    });
  }

  /**
   * Get vehicle charging settings.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readChargingSettings(vin?: string, accountId?: string): Promise<ChargingSettings> {
    return this.read({
      apiUrl: 'READ_CHARGING_SETTINGS_URL',
      method: 'readChargingSettings',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle cockpit.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readCockpit(vin?: string, accountId?: string): Promise<Cockpit> {
    return this.read({
      apiUrl: 'READ_COCKPIT_URL',
      method: 'readCockpit',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle hvac history.
   * @param {DateFilter} filter - The date filter.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readHvacHistory(filter: DateFilter, vin?: string, accountId?: string): Promise<HvacHistory> {
    return this.read({
      apiUrl: 'READ_HVAC_HISTORY_URL',
      method: 'readHvacHistory',
      accountId,
      vin,
      queryParams: dateFilterToParams(filter, this.session.locale),
    });
  }

  /**
   * Get vehicle hvac sessions.
   * @param {Omit<DateFilter, 'period'>} filter - The date filter.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readHvacSessions(filter: Omit<DateFilter, 'period'>, vin?: string, accountId?: string): Promise<HvacSessions> {
    return this.read({
      apiUrl: 'READ_HVAC_SESSIONS_URL',
      method: 'readHvacSessions',
      accountId,
      vin,
      queryParams: dateFilterToParams(filter, this.session.locale),
    });
  }

  /**
   * Get vehicle hvac status.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readHvacStatus(vin?: string, accountId?: string): Promise<HvacStatus> {
    return this.read({
      apiUrl: 'READ_HVAC_STATUS_URL',
      method: 'readHvacStatus',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle hvac settings.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readHvacSettings(vin?: string, accountId?: string): Promise<HvacSettings> {
    return this.read({
      apiUrl: 'READ_HVAC_SETTINGS_URL',
      method: 'readHvacSettings',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle location.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readLocation(vin?: string, accountId?: string): Promise<VehicleLocation> {
    return this.read({
      apiUrl: 'READ_LOCATION_URL',
      method: 'readLocation',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle lock status.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readLockStatus(vin?: string, accountId?: string): Promise<LockStatus> {
    return this.read({
      apiUrl: 'READ_LOCK_STATUS_URL',
      method: 'readLockStatus',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle notification settings.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readNotificationSettings(vin?: string, accountId?: string): Promise<NotificationSettingsData> {
    return this.read({
      apiUrl: 'READ_NOTIFICATION_SETTINGS_URL',
      method: 'readNotificationSettings',
      accountId,
      vin,
    });
  }

  /**
   * Get vehicle res state.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public readResState(vin?: string, accountId?: string): Promise<ResStateData> {
    return this.read({
      apiUrl: 'READ_RES_STATE_URL',
      method: 'readResState',
      accountId,
      vin,
    });
  }

  /**
   * Select vehicle charge mode.
   * @param {ChargeModeInputs} inputs - The charge mode inputs.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargeMode(inputs: ChargeModeInputs, vin?: string, accountId?: string): Promise<ActionChargeMode> {
    const { action } = inputs;
    return this.perform({
      apiUrl: 'PERFORM_CHARGE_MODE_URL',
      method: 'performChargeMode',
      accountId,
      vin,
      data: {
        type: 'ChargeMode',
        attributes: { action },
      },
    });
  }

  /**
   * Set vehicle charge schedule.
   * @param {ChargeScheduleInputs} inputs - The charge schedules inputs.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargeSchedule(inputs: ChargeScheduleInputs, vin?: string, accountId?: string): Promise<any> {
    const { schedules } = inputs;
    return this.perform({
      apiUrl: 'PERFORM_CHARGE_SCHEDULE_URL',
      method: 'performChargeSchedule',
      accountId,
      vin,
      data: {
        type: 'ChargeSchedule',
        attributes: { schedules },
      },
    });
  }

  /**
   * Set vehicle hvac schedule.
   * @param {HvacScheduleInputs} inputs - The hvac schedule inputs.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performHvacSchedule(inputs: HvacScheduleInputs, vin?: string, accountId?: string): Promise<any> {
    const { schedules } = inputs;
    return this.perform({
      apiUrl: 'PERFORM_HVAC_SCHEDULE_URL',
      method: 'performHvacSchedule',
      accountId,
      vin,
      data: {
        type: 'HvacSchedule',
        attributes: { schedules },
      },
    });
  }

  /**
   * Start vehicle hvac.
   * @param {HvacStartInputs} inputs - The hvac inputs.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performHvacStart(inputs: HvacStartInputs, vin?: string, accountId?: string): Promise<any> {
    const { targetTemperature, startDateTime } = inputs;
    const data: any = {
      type: 'HvacStart',
      attributes: { action: 'start', targetTemperature },
    };
    if (startDateTime) data.attributes.startDateTime = formatDate(startDateTime, PERIOD_TZ_FORMAT, this.session.locale);
    return this.perform({
      apiUrl: 'PERFORM_HVAC_START_URL',
      method: 'performHvacStart',
      accountId,
      vin,
      data,
    });
  }

  /**
   * Stop vehicle hvac.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performHvacStop(vin?: string, accountId?: string): Promise<any> {
    return this.perform({
      apiUrl: 'PERFORM_HVAC_START_URL',
      method: 'performHvacStop',
      accountId,
      vin,
      data: {
        type: 'HvacStart',
        attributes: { action: 'cancel' },
      },
    });
  }

  /**
   * Start vehicle charging.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargeStart(vin?: string, accountId?: string): Promise<any> {
    return this.perform({
      apiUrl: 'PERFORM_CHARGING_START_URL',
      method: 'performChargeStart',
      accountId,
      vin,
      data: {
        type: 'ChargingStart',
        attributes: { action: 'start' },
      },
    });
  }

  /**
   * Stop vehicle charging.
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargeStop(vin?: string, accountId?: string): Promise<any> {
    return this.perform({
      apiUrl: 'PERFORM_CHARGING_START_URL',
      method: 'performChargeStop',
      accountId,
      vin,
      data: {
        type: 'ChargingStart',
        attributes: { action: 'stop' },
      },
    });
  }

  /**
   * Start vehicle charging (Dacia Spring ONLY).
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargeResume(vin?: string, accountId?: string): Promise<any> {
    return this.perform({
      apiUrl: 'PERFORM_PAUSE_RESUME_URL',
      method: 'performChargeResume',
      accountId,
      vin,
      data: {
        type: 'ChargingStart',
        attributes: { action: 'start' },
      },
    });
  }

  /**
   * Stop vehicle charging (Dacia Spring ONLY).
   * @param {string?} [vin = the vin stored in the session] - The vehicle vin.
   * @param {string?} [accountId = the accountId stored in the session] - The account id.
   */
  public performChargePause(vin?: string, accountId?: string): Promise<any> {
    return this.perform({
      apiUrl: 'PERFORM_PAUSE_RESUME_URL',
      method: 'performChargePause',
      accountId,
      vin,
      data: {
        type: 'ChargingStart',
        attributes: { action: 'stop' },
      },
    });
  }

  /** @internal */
  private read<T>({ apiUrl, method, accountId, vin, queryParams }: ReadArgs): Promise<T> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId, method);
    const requiredVin: string = this.getVinOrThrow(vin, method);
    return this.httpClient
      .get<T>(KamereonApi[apiUrl](requiredAccountId, requiredVin), { queryParams })
      .consume();
  }

  /** @internal */
  private perform<T>({ apiUrl, method, accountId, vin, data }: PerformArgs): Promise<T> {
    const requiredAccountId: string = this.getAccountIdOrThrow(accountId, method);
    const requiredVin: string = this.getVinOrThrow(vin, method);
    return this.httpClient
      .post<T>(KamereonApi[apiUrl](requiredAccountId, requiredVin), { data })
      .consume();
  }

  /** @internal */
  private getPersonIdOrThrow(personId: Optional<string>, method: KamereonMethod): string {
    return personId || this.getFromSessionOrThrow('personId', method);
  }

  /** @internal */
  private getAccountIdOrThrow(accountId: Optional<string>, method: KamereonMethod): string {
    return accountId || this.getFromSessionOrThrow('accountId', method);
  }

  /** @internal */
  private getVinOrThrow(vin: Optional<string>, method: KamereonMethod): string {
    return vin || this.getFromSessionOrThrow('vin', method);
  }

  /** @internal */
  private getFromSessionOrThrow(key: keyof RenaultSession, method: KamereonMethod): string {
    const value: Optional<string> = this.session[key];
    if (!value) emitError('KamereonException', `Cannot ${method} because "${key}" is falsy or not stored in session.`);

    return value;
  }
}
