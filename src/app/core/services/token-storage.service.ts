import { Injectable } from '@angular/core';
import { PublicUser } from '../models/api-response.model';

const ACCESS_TOKEN_KEY = 'xaccess_access_token';
const USER_SNAPSHOT_KEY = 'xaccess_user_snapshot';

/**
 * Access token + cached user snapshot for offline-first UI.
 * Session is cleared on logout via {@link clearSession}.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  }

  /** Whether a JWT is stored (does not validate expiry). */
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /** Cached user from last login/register/me refresh. */
  getUserSnapshot(): PublicUser | null {
    try {
      const raw = localStorage.getItem(USER_SNAPSHOT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  }

  setUserSnapshot(user: PublicUser): void {
    try {
      localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }

  /**
   * Store JWT + user together after auth responses or `/auth/me`.
   */
  persistSession(accessToken: string, user: PublicUser): void {
    this.setAccessToken(accessToken);
    this.setUserSnapshot(user);
  }

  /** Remove token and user snapshot. */
  clearSession(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_SNAPSHOT_KEY);
    } catch {
      /* ignore */
    }
  }

  /** @deprecated Use {@link clearSession} */
  clear(): void {
    this.clearSession();
  }
}
