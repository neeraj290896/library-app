import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AreaService {
    private readonly baseUrl = `${environment.apiUrl}/api/Area`;

    constructor(private http: HttpClient) { }

    getAreaDetailsById(stateId: number, districtId: number, cityId: number): Observable<any> {
        const params = new HttpParams()
            .set('stateId', stateId)
            .set('districtId', districtId)
            .set('cityId', cityId);
        return this.http.get(`${this.baseUrl}/GetAreaDetailsById`, { params });
    }

    getAllAreaDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllAreaDetails`);
    }

    addAreaDetails(payload: AreaDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddAreaDetails`, payload);
    }

    updateAreaDetails(payload: AreaDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateAreaDetails`, payload);
    }

    deleteAreaDetails(payload: AreaDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteAreaDetails`, payload);
    }
}
