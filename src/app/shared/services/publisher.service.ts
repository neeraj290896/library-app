import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublisherDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PublisherService {
    private readonly baseUrl = `${environment.apiUrl}/api/Publisher`;

    constructor(private http: HttpClient) { }

    getPublisherDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetPublisherDetails`);
    }

    addPublisherDetails(payload: PublisherDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddPublisherDetails`, payload);
    }

    updatePublisherDetails(payload: PublisherDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdatePublisherDetails`, payload);
    }

    deletePublisherDetails(payload: PublisherDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeletePublisherDetails`, payload);
    }
}
