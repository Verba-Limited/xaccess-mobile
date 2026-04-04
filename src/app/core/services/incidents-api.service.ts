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

export interface IncidentDto {
  id: string;
  category: string;
  notes: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class IncidentsApiService {
  private readonly base = `${environment.apiUrl}/incidents`;

  constructor(private readonly http: HttpClient) {}

  create(body: { category: string; notes?: string }): Observable<IncidentDto> {
    return unwrap(
      this.http.post<ApiResponse<IncidentDto>>(`${this.base}`, body),
    );
  }

  listMine(): Observable<IncidentDto[]> {
    return unwrap(this.http.get<ApiResponse<IncidentDto[]>>(`${this.base}/me`));
  }
}
