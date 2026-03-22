import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransactionTypeDetails, TransactionDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
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

    getTransactionDetails(bookId: number = 0, userId: number = 0): Observable<any> {
        const params = new HttpParams()
            .set('bookId', bookId)
            .set('userId', userId);
        return this.http.get(`${this.baseUrl}/GetTransactionDetails`, { params });
    }

    addTransactionDetails(payload: TransactionDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddTransactionDetails`, payload);
    }

    updateTransactionDetails(payload: TransactionDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateTransactionDetails`, payload);
    }
}
