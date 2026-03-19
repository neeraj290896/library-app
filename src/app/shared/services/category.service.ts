import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly baseUrl = `${environment.apiUrl}/api/Category`;

    constructor(private http: HttpClient) { }

    getCategoryDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetCategoryDetails`);
    }

    addCategoryDetails(payload: CategoryDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddCategoryDetails`, payload);
    }

    updateCategoryDetails(payload: CategoryDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateCategoryDetails`, payload);
    }

    deleteCategoryDetails(payload: CategoryDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteCategoryDetails`, payload);
    }
}
