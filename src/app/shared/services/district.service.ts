import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DistrictDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DistrictService {
    private readonly baseUrl = `${environment.apiUrl}/api/District`;

    constructor(private http: HttpClient) { }

    getAllDistrictDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllDistrictDetails`);
    }

    getDistrictDetailsById(stateId: number): Observable<any> {
        const params = new HttpParams().set('stateId', stateId);
        return this.http.get(`${this.baseUrl}/GetDistrictDetailsById`, { params });
    }

    addDistrictDetails(payload: DistrictDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddDistrictDetails`, payload);
    }

    updateDistrictDetails(payload: DistrictDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateDistrictDetails`, payload);
    }

    deleteDistrictDetails(payload: DistrictDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteDistrictDetails`, payload);
    }
}
