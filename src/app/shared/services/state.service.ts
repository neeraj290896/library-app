import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StateService {
    private readonly baseUrl = `${environment.apiUrl}/api/State`;

    constructor(private http: HttpClient) { }

    getStateDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetStateDetails`);
    }

    addStateDetails(payload: StateDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddStateDetails`, payload);
    }

    updateStateDetails(payload: StateDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateStateDetails`, payload);
    }

    deleteStateDetails(payload: StateDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteStateDetails`, payload);
    }
}
