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
import { OtpDetails, RoleDetails, UserDetails } from '../../shared/models/api.models';

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
    otpDialogVisible = signal(false);
    otp = signal('');
    otpValidationError = signal('');
    verifyingOtp = signal(false);
    pendingEmail = signal('');
    pendingMobile = signal('');
    readonly genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
    ];

    ngOnInit(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[] | { data?: RoleDetails[] }) => {
                const roleList = Array.isArray(data) ? data : (data.data ?? []);
                const active = roleList.filter(r => r.IsActive);
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
            ProfilePhoto: null,
            Status: 'Pending Approval',
            CreatedByUserId: 0,
            CreatedByUserName: this.fullName().trim(),
            LastLogInTime: null,
            IsActive: true
        };

        this.loading.set(true);
        this.userService.addUserDetails(payload).subscribe({
            next: () => {
                this.loading.set(false);
                this.pendingEmail.set(email);
                this.pendingMobile.set(mobile);
                this.otp.set('');
                this.otpValidationError.set('');
                this.otpDialogVisible.set(true);
                this.messageService.add({
                    severity: 'info',
                    summary: 'OTP Verification Required',
                    detail: 'Enter the OTP sent to your registered contact details.'
                });
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

    onVerifyOtp(): void {
        this.otpValidationError.set('');
        const otpValue = this.otp().trim();

        if (!/^\d{4,8}$/.test(otpValue)) {
            this.otpValidationError.set('Please enter a valid OTP.');
            return;
        }

        const payload: OtpDetails = {
            MailId: this.pendingEmail(),
            MobileNo: this.pendingMobile(),
            Otp: otpValue
        };

        this.verifyingOtp.set(true);
        this.userService.verifyOtpDetails(payload).subscribe({
            next: () => {
                this.verifyingOtp.set(false);
                this.otpDialogVisible.set(false);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Signup Successful',
                    detail: 'Account created successfully and pending for approval. You can login once your account is approved.'
                });
                setTimeout(() => this.router.navigate(['/login']), 1500);
            },
            error: () => {
                this.verifyingOtp.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'OTP Verification Failed',
                    detail: 'Invalid OTP. Please try again.'
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

    onOtpInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const digitsOnly = input.value.replace(/\D/g, '').slice(0, 8);
        if (input.value !== digitsOnly) {
            input.value = digitsOnly;
        }
        this.otp.set(digitsOnly);
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
