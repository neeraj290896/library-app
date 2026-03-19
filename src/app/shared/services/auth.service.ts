import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    readonly userRole = signal<string | null>(localStorage.getItem('userRole'));
    readonly userName = signal<string>(localStorage.getItem('userName') || '');

    login(username: string, password: string): boolean {
        // Simple authentication - in production, this would be a real API call
        if (username === 'librarian' && password === 'librarian123') {
            localStorage.setItem('userRole', 'librarian');
            localStorage.setItem('userName', 'Allison Smith');
            this.userRole.set('librarian');
            this.userName.set('Allison Smith');
            return true;
        } else if (username === 'assistant' && password === 'assistant123') {
            localStorage.setItem('userRole', 'assistant');
            localStorage.setItem('userName', 'John Doe');
            this.userRole.set('assistant');
            this.userName.set('John Doe');
            return true;
        }
        return false;
    }

    logout(): void {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        this.userRole.set(null);
        this.userName.set('');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('userRole');
    }

    getUserRole(): string | null {
        return this.userRole();
    }
}
