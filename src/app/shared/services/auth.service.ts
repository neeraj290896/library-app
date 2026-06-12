import { Injectable, signal } from '@angular/core';
import { UserDetails } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    readonly userRole = signal<string | null | undefined>(null);
    readonly userName = signal<string | null | undefined>(null);
    readonly userData = signal<UserDetails | null>(null);

    readonly userDataTemp = {
                        "UserId": 1,
                        "RoleId": 1,
                        "RoleName": "Super Admin",
                        "FullName": "Saravana Kumar M",
                        "Gender": "M",
                        "MobileNo": "8892632453",
                        "DOB": null,
                        "MailId": "m.saravanakumar2703@gmail.com",
                        "ProfilePhoto": "",
                        "Status": "Approved",
                        "CreatedByUserId": null,
                        "CreatedByUserName": null,
                        "LastLogInTime": "2026-03-21T15:20:06.84",
                        "UserBarcode": "LIB_U_001",
                        "IsActive": true
                        };

    setUserDetails(userDetails: UserDetails): void {

        // this.userData.set(userDetails);
        this.userRole.set(userDetails.RoleName);
        this.userName.set(userDetails.FullName);
    }

    logout(): void {
        this.userRole.set(null);
        this.userName.set(null);
        // this.userData.set(null);
    }

    isAuthenticated(): boolean {
        return !!this.userRole();
    }

    getUserRole(): string | null | undefined {
        return this.userRole();
    }
}
