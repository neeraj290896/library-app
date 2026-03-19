import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuildingDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BuildingService {
    private readonly baseUrl = `${environment.apiUrl}/api/Building`;

    constructor(private http: HttpClient) { }

    getAllBuildingDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllBuildingDetails`);
    }

    getBuildingDetailsById(stateId: number, districtId: number, cityId: number, areaId: number): Observable<any> {
        const params = new HttpParams()
            .set('stateId', stateId)
            .set('districtId', districtId)
            .set('cityId', cityId)
            .set('areaId', areaId);
        return this.http.get(`${this.baseUrl}/GetBuildingDetailsById`, { params });
    }

    addBuildingDetails(payload: BuildingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddBuildingDetails`, payload);
    }

    updateBuildingDetails(payload: BuildingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateBuildingDetails`, payload);
    }

    deleteBuildingDetails(payload: BuildingDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteBuildingDetails`, payload);
    }
}
