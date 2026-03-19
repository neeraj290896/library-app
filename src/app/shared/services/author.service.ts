import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthorService {
    private readonly baseUrl = `${environment.apiUrl}/api/Author`;

    constructor(private http: HttpClient) { }

    getAuthorDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAuthorDetails`);
    }

    addAuthorDetails(payload: AuthorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddAuthorDetails`, payload);
    }

    updateAuthorDetails(payload: AuthorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateAuthorDetails`, payload);
    }

    deleteAuthorDetails(payload: AuthorDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteAuthorDetails`, payload);
    }
}
