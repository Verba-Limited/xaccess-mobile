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

export interface MessageDto {
  id: string;
  subject: string;
  body: string;
  senderId: string;
  recipientId: string | null;
  readAt: string | null;
  createdAt: string;
  senderName: string | null;
  recipientName: string | null;
}

@Injectable({ providedIn: 'root' })
export class MessagesApiService {
  private readonly base = `${environment.apiUrl}/messages`;

  constructor(private readonly http: HttpClient) {}

  inbox(): Observable<MessageDto[]> {
    return unwrap(this.http.get<ApiResponse<MessageDto[]>>(`${this.base}/inbox`));
  }

  sent(): Observable<MessageDto[]> {
    return unwrap(this.http.get<ApiResponse<MessageDto[]>>(`${this.base}/sent`));
  }

  getOne(id: string): Observable<MessageDto> {
    return unwrap(this.http.get<ApiResponse<MessageDto>>(`${this.base}/${id}`));
  }

  create(body: {
    subject: string;
    body: string;
    recipientId?: string | null;
  }): Observable<MessageDto> {
    return unwrap(
      this.http.post<ApiResponse<MessageDto>>(`${this.base}`, body),
    );
  }
}
