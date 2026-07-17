import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubjectDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SubjectService {
    private readonly baseUrl = `${environment.apiUrl}/api/Subject`;

    constructor(private http: HttpClient) { }

    getSubjectDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetSubjectDetails`);
    }

    addSubjectDetails(payload: SubjectDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddSubjectDetails`, payload);
    }

    updateSubjectDetails(payload: SubjectDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateSubjectDetails`, payload);
    }

    deleteSubjectDetails(payload: SubjectDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteSubjectDetails`, payload);
    }
}
