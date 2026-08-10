import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingDetails, AccessRequestDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private readonly baseUrl = `${environment.apiUrl}/api/Admin`;

    constructor(private http: HttpClient) { }

    getSettingDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetSettingDetails`);
    }

    addSettingDetails(payload: SettingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddSettingDetails`, payload);
    }

    updateSettingDetails(payload: SettingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateSettingDetails`, payload);
    }

    deleteSettingDetails(payload: SettingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteSettingDetails`, payload);
    }

    getAccessRequestDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAccessRequestDetails`);
    }

    updateAccessRequestDetails(payload: AccessRequestDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateAccessRequestDetails`, payload);
    }

    initiateDbBackUp(triggeredBy: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/InitiateDbBackUp?triggeredBy=${triggeredBy}`);
    }

    getLatestDbBackUpDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetLatestDbBackUpDetails`);
    }
}
