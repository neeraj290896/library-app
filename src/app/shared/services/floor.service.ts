import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FloorDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FloorService {
    private readonly baseUrl = `${environment.apiUrl}/api/Floor`;

    constructor(private http: HttpClient) { }

    getAllFloorDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllFloorDetails`);
    }

    getFloorDetailsById(buildingId: number): Observable<any> {
        const params = new HttpParams().set('buildingId', buildingId);
        return this.http.get(`${this.baseUrl}/GetFloorDetailsById`, { params });
    }

    addFloorDetails(payload: FloorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddFloorDetails`, payload);
    }

    updateFloorDetails(payload: FloorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateFloorDetails`, payload);
    }

    deleteFloorDetails(payload: FloorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteFloorDetails`, payload);
    }
}
