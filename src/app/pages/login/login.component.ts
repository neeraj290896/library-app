import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { CredDetails, OrganizationDetails } from '../../shared/models/api.models';
import { OrganizationService } from '@app/shared/services/organization.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private orgService = inject(OrganizationService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    public _org: OrganizationDetails = environment.OrganizationDetails;

    username = signal('');
    password = signal('');
    validationError = signal('');
    loading = signal(false);

    ngOnInit(): void {
        this.getOrganizationDetails();
    }

    getOrganizationDetails():void{
        this.orgService.getOrganizationDetails().subscribe({
                    next: (data: OrganizationDetails[]) => {
                        if (data && data.length > 0) {
                            this._org = data.find(x => x.IsActive == true) ?? environment.OrganizationDetails;                            
                            this.authService.setOrganizationDetails(this._org);
                        }
                    },
                    error: (err) => {
                        console.error('Error loading OrganizationDetails:', err);
                    }
                });
    }

    handleLogin(e: Event): void {
        e.preventDefault();
        this.validationError.set('');

        const identifier = this.username().trim();
        const pwd = this.password();

        if (!identifier || !pwd) {
            this.validationError.set('Email/Mobile and password are required.');
            return;
        }

        const payload: CredDetails = { Password: pwd };
        if (identifier.includes('@')) {
            const email = identifier.toLowerCase();
            if (!this.isValidEmail(email)) {
                this.validationError.set('Please enter a valid email address.');
                return;
            }
            payload.MailId = email;
        } else {
            const mobile = identifier.replace(/\s+/g, '');
            if (!this.isValidMobile(mobile)) {
                this.validationError.set('Please enter a valid 10-digit mobile number.');
                return;
            }
            payload.MobileNo = mobile;
        }

        this.loading.set(true);
        this.userService.verifyUserLogInDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.loading.set(false);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login Failed',
                        detail: res ? res.Message : 'Invalid username or password. Please try again.'
                    });
                    return;
                }

                this.userService.getLoggedInUserDetails(payload.MobileNo ?? undefined, payload.MailId ?? undefined).subscribe({
                    next: (detailsRes: any) => {
                        this.loading.set(false);

                        this.authService.setUserDetails(detailsRes);
                        this.router.navigate(['/dashboard']);
                    },
                    error: () => {
                        this.loading.set(false);

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Login Failed',
                            detail: 'Unable to load logged-in user details.'
                        });
                    }
                });
            },
            error: () => {
                this.loading.set(false);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Login Failed',
                    detail: 'Invalid username or password.'
                });
            }
        });
    }

    private isValidEmail(value: string): boolean {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    }

    private isValidMobile(value: string): boolean {
        return /^\d{10}$/.test(value);
    }
}
