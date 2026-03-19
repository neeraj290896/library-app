import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly baseUrl = `${environment.apiUrl}/api/Role`;

    constructor(private http: HttpClient) { }

    getRoleDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetRoleDetails`);
    }

    addRoleDetails(payload: RoleDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddRoleDetails`, payload);
    }

    updateRoleDetails(payload: RoleDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateRoleDetails`, payload);
    }

    deleteRoleDetails(payload: RoleDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteRoleDetails`, payload);
    }
}
