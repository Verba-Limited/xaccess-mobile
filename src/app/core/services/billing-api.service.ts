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

export interface BillingSummary {
  hasOutstanding: boolean;
  totalAmountMinor: number;
  currency: string;
  nextDueDate: string | null;
  nextInvoiceId: string | null;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  title: string;
  amountMinor: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly base = `${environment.apiUrl}/billing`;

  constructor(private readonly http: HttpClient) {}

  summary(): Observable<BillingSummary> {
    return unwrap(
      this.http.get<ApiResponse<BillingSummary>>(`${this.base}/summary`),
    );
  }

  listInvoices(): Observable<InvoiceDto[]> {
    return unwrap(
      this.http.get<ApiResponse<InvoiceDto[]>>(`${this.base}/invoices`),
    );
  }

  getInvoice(id: string): Observable<InvoiceDto> {
    return unwrap(
      this.http.get<ApiResponse<InvoiceDto>>(`${this.base}/invoices/${id}`),
    );
  }

  payInvoice(
    id: string,
    body: { paymentMethod?: string } = {},
  ): Observable<InvoiceDto> {
    return unwrap(
      this.http.post<ApiResponse<InvoiceDto>>(
        `${this.base}/invoices/${id}/pay`,
        body,
      ),
    );
  }
}
