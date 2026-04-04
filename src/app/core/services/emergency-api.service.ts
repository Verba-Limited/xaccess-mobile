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

export interface EmergencyContactRow {
  id: string;
  label: string;
  phone: string;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class EmergencyApiService {
  private readonly base = `${environment.apiUrl}/public/emergency-contacts`;

  constructor(private readonly http: HttpClient) {}

  list(communityId?: string | null): Observable<EmergencyContactRow[]> {
    const q = communityId != null ? `?communityId=${encodeURIComponent(communityId)}` : '';
    return unwrap(
      this.http.get<ApiResponse<EmergencyContactRow[]>>(`${this.base}${q}`),
    );
  }
}
