import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SourceDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SourceService {
    private readonly baseUrl = `${environment.apiUrl}/api/Source`;

    constructor(private http: HttpClient) { }

    getSourceDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetSourceDetails`);
    }

    addSourceDetails(payload: SourceDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddSourceDetails`, payload);
    }

    updateSourceDetails(payload: SourceDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateSourceDetails`, payload);
    }

    deleteSourceDetails(payload: SourceDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteSourceDetails`, payload);
    }
}
