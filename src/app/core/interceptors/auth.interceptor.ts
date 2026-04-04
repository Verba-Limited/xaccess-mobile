import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly tokens: TokenStorageService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.tokens.getAccessToken();
    if (!token) {
      return next.handle(req);
    }
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next.handle(cloned);
  }
}
