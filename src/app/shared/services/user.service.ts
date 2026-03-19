import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    UserDetails,
    MultipleUserDetails,
    CredDetails,
    OtpDetails,
    LoggedInUserDetails,
    ResetCredPassword
} from '../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly baseUrl = `${environment.apiUrl}/api/User`;

    constructor(private http: HttpClient) { }

    getLoggedInUserDetails(mobileNo?: string, mailId?: string): Observable<any> {
        let params = new HttpParams();
        if (mobileNo) params = params.set('mobileNo', mobileNo);
        if (mailId) params = params.set('mailId', mailId);
        return this.http.get(`${this.baseUrl}/GetLoggedInUserDetails`, { params });
    }

    getAllUserDetails(): Observable<any> {
        return this.http.get(`${this.baseUrl}/GetAllUserDetails`);
    }

    searchUserDetails(identifier: string): Observable<any> {
        const params = new HttpParams().set('indentifier', identifier);
        return this.http.get(`${this.baseUrl}/SearchUserDetails`, { params });
    }

    getUserStatistics(userId: number, dsMode: string): Observable<any> {
        const params = new HttpParams()
            .set('UserId', userId)
            .set('DsMode', dsMode);
        return this.http.get(`${this.baseUrl}/GetUserStatistics`, { params });
    }

    addUserDetails(payload: UserDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddUserDetails`, payload);
    }

    addMultipleUserDetails(payload: MultipleUserDetails[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/AddMultipleUserDetails`, payload);
    }

    updateUserDetails(payload: UserDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateUserDetails`, payload);
    }

    deleteUserDetails(payload: UserDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/DeleteUserDetails`, payload);
    }

    verifyUserLogInDetails(payload: CredDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/VerifyUserLogInDetails`, payload);
    }

    updateNewPassword(payload: CredDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateNewPassword`, payload);
    }

    updateOtpToResetPassword(payload: OtpDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateOtpToResetPassword`, payload);
    }

    verifyOtpDetails(payload: OtpDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/VerifyOtpDetails`, payload);
    }

    insertLoggedInUserDetails(payload: LoggedInUserDetails): Observable<any> {
        return this.http.post(`${this.baseUrl}/InsertLoggedInUserDetails`, payload);
    }

    resetCredPassword(payload: ResetCredPassword): Observable<any> {
        return this.http.post(`${this.baseUrl}/ResetCredPassword`, payload);
    }
}
