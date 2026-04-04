import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

export interface UsagePoint {
  yearMonth: string;
  power: number;
  water: number;
}

export interface UtilityPreferences {
  periodLabel: string;
  waterControlOn: boolean;
  powerControlOn: boolean;
}

@Injectable({ providedIn: 'root' })
export class UtilitiesApiService {
  private readonly base = `${environment.apiUrl}/utilities`;

  constructor(private readonly http: HttpClient) {}

  getUsage(): Observable<UsagePoint[]> {
    return unwrap(
      this.http.get<ApiResponse<UsagePoint[]>>(`${this.base}/usage`),
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
}
