import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
        mergeMap(token => {
        let authReq = req.clone();
        
        if(req.url.includes("https://us-central1-ifyoucanmove-dev.cloudfunctions.net")) {                      
            authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
          return next.handle(authReq);
        })
      );
  }
}