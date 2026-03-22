import { Injectable, signal } from '@angular/core';
import { UserDetails } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    readonly userRole = signal<string | null | undefined>(null);
    readonly userName = signal<string | null | undefined>(null);
    readonly userData = signal<UserDetails | null>(null);

    setUserDetails(userDetails: UserDetails): void {
        this.userData.set(userDetails);
        this.userRole.set(userDetails.RoleName);
        this.userName.set(userDetails.FullName);
    }

    logout(): void {
        this.userRole.set(null);
        this.userName.set(null);
        this.userData.set(null);
    }

    isAuthenticated(): boolean {
        return !!this.userRole();
    }

    getUserRole(): string | null | undefined {
        return this.userRole();
    }
}
