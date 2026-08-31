import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchQuery } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

private readonly baseUrl = `${environment.apiUrl}/api/Report`;

  constructor(private http: HttpClient) { }

  getStaticsticsFieldDetails(): Observable<any> {
      return this.http.get(`${this.baseUrl}/GetStaticsticsFieldDetails`);
  }

  getStaticsticsData(_staticsticsId : number): Observable<any> {
      return this.http.get(`${this.baseUrl}/GetStaticsticsData?staticsticsId=${_staticsticsId}`);
  }

  getBookDetailsByStaticsticsId(_staticsticsId : number, _staticsticsValue : number): Observable<any> {
      return this.http.get(`${this.baseUrl}/GetBookDetailsByStaticsticsData?staticsticsId=${_staticsticsId}&staticsticsValue=${_staticsticsValue}`);
  }

  viewTransactionDetailsForReport(_searchQuery: SearchQuery): Observable<any> {
      return this.http.post(`${this.baseUrl}/ViewTransactionDetails`, _searchQuery);
  }

  viewBookDetailsForReport(_searchQuery: SearchQuery): Observable<any> {
      return this.http.post(`${this.baseUrl}/ViewBookDetailsForReport`, _searchQuery);
  }
}
