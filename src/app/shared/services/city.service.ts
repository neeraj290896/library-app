import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CityDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CityService {
    private readonly baseUrl = `${environment.apiUrl}/api/City`;

    constructor(private http: HttpClient) { }

    getAllCityDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllCityDetails`);
    }

    getCityDetailsById(stateId: number, districtId: number): Observable<any> {
        const params = new HttpParams()
            .set('stateId', stateId)
            .set('districtId', districtId);
        return this.http.get(`${this.baseUrl}/GetCityDetailsById`, { params });
    }

    addCityDetails(payload: CityDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddCityDetails`, payload);
    }

    updateCityDetails(payload: CityDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateCityDetails`, payload);
    }

    deleteCityDetails(payload: CityDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteCityDetails`, payload);
    }
}
