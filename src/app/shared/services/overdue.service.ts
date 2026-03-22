import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OverDueService {
    private readonly baseUrl = `${environment.apiUrl}/api/OverDue`;

    constructor(private http: HttpClient) { }

    getOverDueDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetOverDueDetails`);
    }

    syncOverDueDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/SyncOverDueDetails`);
    }
}
