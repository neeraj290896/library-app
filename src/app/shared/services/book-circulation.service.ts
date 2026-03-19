import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookCirculationDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BookCirculationService {
    private readonly baseUrl = `${environment.apiUrl}/api/BookCirculation`;

    constructor(private http: HttpClient) { }

    getAllBookCirculationDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllBookCirculationDetails`);
    }

    getBookCirculationDetailsById(bookId: number): Observable<any> {
        const params = new HttpParams().set('bookId', bookId);
        return this.http.get(`${this.baseUrl}/GetBookCirculationDetailsById`, { params });
    }

    issueBook(payload: BookCirculationDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/IssueBook`, payload);
    }

    returnBook(payload: BookCirculationDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/ReturnBook`, payload);
    }

    updateBookCirculation(payload: BookCirculationDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateBookCirculation`, payload);
    }
}
