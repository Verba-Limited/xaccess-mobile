import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthPayload, PublicUser } from '../models/api-response.model';

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  communityId?: string;
}

/** Active communities for signup (no auth). */
export interface PublicCommunityOption {
  id: string;
  name: string;
  slug: string;
}

/** `POST /auth/join-community` — resident only */
export interface JoinCommunityBody {
  communityId?: string;
  slug?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly base = `${environment.apiUrl}/auth`;
  private readonly apiRoot = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(body: LoginBody): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.base}/login`, body);
  }

  register(body: RegisterBody): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.base}/register`, body);
  }

  /** Unauthenticated list for registration picker. */
  getPublicCommunities(): Observable<ApiResponse<PublicCommunityOption[]>> {
    return this.http.get<ApiResponse<PublicCommunityOption[]>>(
      `${this.apiRoot}/public/communities`,
    );
  }

  changePassword(body: {
    currentPassword: string;
    newPassword: string;
  }): Observable<ApiResponse<{ ok: boolean }>> {
    return this.http.post<ApiResponse<{ ok: boolean }>>(
      `${this.base}/change-password`,
      body,
    );
  }

  /** Current user (requires Bearer token). */
  me(): Observable<ApiResponse<PublicUser>> {
    return this.http.get<ApiResponse<PublicUser>>(`${this.base}/me`);
  }

  /**
   * Link a resident account to an estate (returns new JWT with `communityId`).
   * Send **slug** (e.g. harmony-estate) or **communityId** UUID from your manager.
   */
  joinCommunity(body: JoinCommunityBody): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.base}/join-community`, body);
  }
}
