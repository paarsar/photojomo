import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface ContactResponse {
  id: string;
  message: string;
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactService {

  private readonly url = `${environment.apiBaseUrl}/contacts`;

  constructor(private http: HttpClient) {}

  submit(request: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.url, request);
  }
}
