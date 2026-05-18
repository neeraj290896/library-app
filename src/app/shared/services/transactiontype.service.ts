import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionTypeDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransactionTypeService {
    private readonly baseUrl = `${environment.apiUrl}/api/Transaction`;

    constructor(private http: HttpClient) { }

    getTransactionTypeDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetTransactionTypeDetails`);
    }

    addTransactionTypeDetails(payload: TransactionTypeDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddTransactionTypeDetails`, payload);
    }

    updateTransactionTypeDetails(payload: TransactionTypeDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateTransactionTypeDetails`, payload);
    }

    deleteTransactionTypeDetails(payload: TransactionTypeDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteTransactionTypeDetails`, payload);
    }
}
