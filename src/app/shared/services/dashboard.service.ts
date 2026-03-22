import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiUrl}/api/Dashboard`;

    constructor(private http: HttpClient) { }

    getDashboardSummary(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetDashboardSummary`);
    }
}
