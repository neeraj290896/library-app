import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../shared/services/role.service';
import { UserService } from '../../shared/services/user.service';
import { RoleDetails, UserDetails } from '../../shared/models/api.models';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [FormsModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, DialogModule, RouterLink],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
    private roleService = inject(RoleService);
    private userService = inject(UserService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    fullName = signal('');
    mailId = signal('');
    mobileNo = signal('');
    gender = signal<string>('');
    dob = signal<Date | null>(null);
    selectedRoleId = signal<number | null>(null);
    roles = signal<RoleDetails[]>([]);
    validationError = signal('');
    loading = signal(false);
    readonly genderOptions = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' }
    ];

    ngOnInit(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[] | { data?: RoleDetails[] }) => {
                const roleList = Array.isArray(data) ? data : (data.data ?? []);
                const active = roleList.filter(r => r.IsActive && r.UserCanLogin && r.RoleId >2);
                this.roles.set(active);
                if (active.length > 0) {
                    this.selectedRoleId.set(active[0].RoleId);
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Roles Load Failed',
                    detail: 'Unable to load role options. Please refresh and try again.'
                });
            }
        });
    }

    handleSignup(e: Event): void {
        e.preventDefault();
        this.validationError.set('');

        if (!this.fullName().trim() || !this.mailId().trim() || !this.mobileNo().trim() || !this.gender() || !this.dob()) {
            this.validationError.set('All fields are required.');
            return;
        }

        const email = this.mailId().trim().toLowerCase();
        if (!this.isValidEmail(email)) {
            this.validationError.set('Please enter a valid email address.');
            return;
        }

        const mobile = this.mobileNo().trim();
        if (!/^\d{10}$/.test(mobile)) {
            this.validationError.set('Mobile number must be exactly 10 digits.');
            return;
        }

        if (!this.selectedRoleId()) {
            this.validationError.set('Please select a role.');
            return;
        }

        const selectedRole = this.roles().find(r => r.RoleId === this.selectedRoleId());

        const payload: UserDetails = {
            UserId: 0,
            RoleId: this.selectedRoleId(),
            RoleName: selectedRole?.RoleName ?? null,
            FullName: this.fullName().trim(),
            Gender: this.gender(),
            MobileNo: mobile,
            DOB: this.formatDate(this.dob()!),
            MailId: email,
            ProfilePhoto: '',
            Status: 'Pending',
            CreatedByUserId: 0,
            CreatedByUserName: this.fullName().trim(),
            LastLogInTime: null,
            IsActive: true
        };

        this.loading.set(true);
        this.userService.addUserDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.loading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Signup Failed',
                        detail: res ? res.Message : 'Registration failed. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Signup Successful',
                        detail: 'Registration successful. Sent for approval.'
                    });
                }
            },
            error: () => {
                this.loading.set(false);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Signup Failed',
                    detail: 'Registration failed. Please try again.'
                });
            }
        });
    }

    onMobileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const digitsOnly = input.value.replace(/\D/g, '').slice(0, 10);
        if (input.value !== digitsOnly) {
            input.value = digitsOnly;
        }
        this.mobileNo.set(digitsOnly);
    }

    private isValidEmail(value: string): boolean {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    }

    private formatDate(value: Date): string {
        const normalized = new Date(value);
        normalized.setHours(0, 0, 0, 0);
        return normalized.toISOString();
    }
}
