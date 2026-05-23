import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(
    map((res) => {
      if (!res.success) {
        throw new Error(res.message || 'Request failed');
      }
      return res.data;
    }),
  );
}

export type UtilityPeriod = 'Monthly' | 'Quarterly' | 'Annual';

export interface UsageChartPoint {
  label: string;
  yearMonth: string | null;
  electricityKwh: number;
  waterM3: number;
  powerPct: number;
  waterPct: number;
}

export interface UsageReport {
  period: UtilityPeriod;
  points: UsageChartPoint[];
  totals: { electricityKwh: number; waterM3: number };
  latestMonth: string | null;
}

export type UtilityMeasurementPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface UtilityAvailabilityGate {
  canUsePower: boolean;
  canUseWater: boolean;
  reasonPower: string | null;
  reasonWater: string | null;
}

export interface ResidentUtilitySubscription {
  measurementPeriod: UtilityMeasurementPeriod;
  periodKey: string;
  periodStartsAt: string;
  periodEndsAt: string;
  paidForPeriod: boolean;
  serviceChargeMinor: number;
  currency: string;
  quotaPowerKwh: number;
  quotaWaterM3: number;
  usedPowerKwh: number;
  usedWaterM3: number;
  remainingPowerKwh: number;
  remainingWaterM3: number;
  canUsePower: boolean;
  canUseWater: boolean;
}

export interface UtilityPreferences {
  periodLabel: string;
  waterControlOn: boolean;
  powerControlOn: boolean;
  updatedAt?: string;
  subscription?: ResidentUtilitySubscription;
  utilityGate?: UtilityAvailabilityGate;
}

@Injectable({ providedIn: 'root' })
export class UtilitiesApiService {
  private readonly base = `${environment.apiUrl}/utilities`;

  constructor(private readonly http: HttpClient) {}

  getUsage(period?: UtilityPeriod | null): Observable<UsageReport> {
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    return unwrap(
      this.http.get<ApiResponse<UsageReport>>(`${this.base}/usage`, { params }),
    );
  }

  getPreferences(): Observable<UtilityPreferences> {
    return unwrap(
      this.http.get<ApiResponse<UtilityPreferences>>(
        `${this.base}/preferences`,
      ),
    );
  }

  patchPreferences(
    body: Partial<UtilityPreferences>,
  ): Observable<UtilityPreferences> {
    return unwrap(
      this.http.patch<ApiResponse<UtilityPreferences>>(
        `${this.base}/preferences`,
        body,
      ),
    );
  }

  /** Simulated payment: unlocks current period quota (see API). */
  payUtilitySubscription(): Observable<ResidentUtilitySubscription> {
    return unwrap(
      this.http.post<ApiResponse<ResidentUtilitySubscription>>(
        `${this.base}/subscription/pay`,
        {},
      ),
    );
  }

  /** Paystack hosted checkout (card, bank, USSD). Server must set PAYSTACK_SECRET_KEY. */
  initializePaystackUtility(): Observable<PaystackUtilityInit> {
    return unwrap(
      this.http.post<ApiResponse<PaystackUtilityInit>>(
        `${this.base}/subscription/paystack/initialize`,
        {},
      ),
    );
  }

  /** Call after Paystack reports success (hosted page or redirect). */
  verifyPaystackUtility(
    reference: string,
  ): Observable<ResidentUtilitySubscription> {
    return unwrap(
      this.http.post<ApiResponse<ResidentUtilitySubscription>>(
        `${this.base}/subscription/paystack/verify`,
        { reference },
      ),
    );
  }
}

export interface PaystackUtilityInit {
  authorizationUrl: string;
  reference: string;
  amountKobo: number;
  currency: string;
}
