import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AccessLogDto,
  AccessTokenSummaryDto,
  CreateAccessTokenRequest,
  CreateAccessTokenResponse,
  RevokeAccessTokenResponse,
} from '../models/access.models';

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

@Injectable({ providedIn: 'root' })
export class AccessApiService {
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /** Resident access history (latest first, server caps list). */
  getMyAccessLogs(): Observable<AccessLogDto[]> {
    return unwrap(
      this.http.get<ApiResponse<AccessLogDto[]>>(`${this.base}/access/logs/me`),
    );
  }

  /** Active / past tokens created by the resident. */
  listMyTokens(): Observable<AccessTokenSummaryDto[]> {
    return unwrap(
      this.http.get<ApiResponse<AccessTokenSummaryDto[]>>(`${this.base}/access/tokens`),
    );
  }

  /**
   * Create a new access token (QR secret returned once in the response).
   * Requires resident role + community membership.
   */
  createToken(body: CreateAccessTokenRequest): Observable<CreateAccessTokenResponse> {
    return unwrap(
      this.http.post<ApiResponse<CreateAccessTokenResponse>>(
        `${this.base}/access/tokens`,
        body,
      ),
    );
  }

  /** Revoke an issued token so it can no longer be used. */
  revokeToken(tokenId: string): Observable<RevokeAccessTokenResponse> {
    return unwrap(
      this.http.post<ApiResponse<RevokeAccessTokenResponse>>(
        `${this.base}/access/tokens/${tokenId}/revoke`,
        {},
      ),
    );
  }
}
