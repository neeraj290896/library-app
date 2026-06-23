import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistDetails } from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private readonly baseUrl = `${environment.apiUrl}/api/Wishlist`;

    constructor(private http: HttpClient) { }

    getWishlistDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetWishlistDetails`);
    }

    getWishlistDetailsByBookId(_bookId: number): Observable<any> {
        const params = new HttpParams()
            .set('bookId', _bookId)
        return this.http.get(`${this.baseUrl}/GetWishlistDetailsByBookId`, { params });
    }

    getWishlistDetailsByUserId(_userId: number): Observable<any> {
         const params = new HttpParams()
            .set('userId', _userId)
        return this.http.get(`${this.baseUrl}/GetWishlistDetailsByUserId`, { params });
    }
    addWishlistDetails(payload: WishlistDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddWishlistDetails`, payload);
    }

    updateWishlistDetails(payload: WishlistDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateWishlistDetails`, payload);
    }
   
    getWishlistCount(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetWishlistCount`);
    }

}
