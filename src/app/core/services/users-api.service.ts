import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PublicUser } from '../models/api-response.model';

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

export interface NeighborDirectoryEntry {
  id: string;
  fullName: string;
  phone: string | null;
  unitLabel: string | null;
}

export interface CommunityContext {
  community: { id: string; name: string; slug: string } | null;
  administrator: {
    fullName: string;
    phone: string | null;
    email: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly base = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  patchMe(body: {
    fullName?: string;
    phone?: string | null;
    unitLabel?: string | null;
  }): Observable<PublicUser> {
    return unwrap(
      this.http.patch<ApiResponse<PublicUser>>(`${this.base}/me`, body),
    );
  }

  getNeighborDirectory(): Observable<NeighborDirectoryEntry[]> {
    return unwrap(
      this.http.get<ApiResponse<NeighborDirectoryEntry[]>>(
        `${this.base}/community/directory`,
      ),
    );
  }

  getCommunityContext(): Observable<CommunityContext> {
    return unwrap(
      this.http.get<ApiResponse<CommunityContext>>(
        `${this.base}/community/context`,
      ),
    );
  }
}
