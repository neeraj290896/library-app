import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RackDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RackService {
    private readonly baseUrl = `${environment.apiUrl}/api/Rack`;

    constructor(private http: HttpClient) { }

    getAllRackDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllRackDetails`);
    }

    getRackDetailsById(buildingId: number, floorId: number): Observable<any> {
        const params = new HttpParams()
            .set('buildingId', buildingId)
            .set('floorId', floorId);
        return this.http.get(`${this.baseUrl}/GetRackDetailsById`, { params });
    }

    addRackDetails(payload: RackDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddRackDetails`, payload);
    }

    updateRackDetails(payload: RackDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateRackDetails`, payload);
    }

    deleteRackDetails(payload: RackDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteRackDetails`, payload);
    }
}
