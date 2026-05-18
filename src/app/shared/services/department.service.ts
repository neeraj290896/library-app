import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {
    private readonly baseUrl = `${environment.apiUrl}/api/Organization`;

    constructor(private http: HttpClient) { }

    getDepartmentDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetDepartmentDetails`);
    }

    addDepartmentDetails(payload: DepartmentDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddDepartmentDetails`, payload);
    }

    updateDepartmentDetails(payload: DepartmentDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateDepartmentDetails`, payload);
    }

    deleteDepartmentDetails(payload: DepartmentDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteDepartmentDetails`, payload);
    }
}
