import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly baseUrl = `${environment.apiUrl}/api/Language`;

    constructor(private http: HttpClient) { }

    getLanguageDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetLanguageDetails`);
    }

    addLanguageDetails(payload: LanguageDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddLanguageDetails`, payload);
    }

    updateLanguageDetails(payload: LanguageDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateLanguageDetails`, payload);
    }

    deleteLanguageDetails(payload: LanguageDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteLanguageDetails`, payload);
    }
}
