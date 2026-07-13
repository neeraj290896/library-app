import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { CredDetails, UserDetails } from '../../shared/models/api.models';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel'; 
import { InputOtpModule } from 'primeng/inputotp'; 
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule, RouterLink, DialogModule, ReactiveFormsModule, FloatLabelModule, InputOtpModule , CommonModule ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    public authService = inject(AuthService);
    private userService = inject(UserService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    
   
    public forgotForm: FormGroup = this.fb.group({
      fpEmail: ['', [Validators.required, Validators.email]],
      fpPassword: ['', Validators.required],
      fpConfirmPassword: ['', Validators.required]
    });
    
    otpCode = '';
    fpStep = 1;
    forgotDialogVisible = false;
    oldPassword: string = '';
    specialChars: string = '!@#$%^*()_+-=[]{};:,.?~\\|';
    passwordRules = {
        minLength: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false
    };

    showResendOtp = false;
    fpPswdValue: string = '';
    fpConfirmPswdValue: string = '';
    
    username = signal('');
    password = signal('');
    validationError = signal('');
    loading = signal(false);

    ngOnInit(): void { 

        this.forgotForm.get('fpConfirmPassword')?.valueChanges.subscribe((value) => {
        // this.forgotForm.updateValueAndValidity();
        this.onConfirmPswdInput({ target: { value } });
        });

    }

     onConfirmPswdInput(event: any) {
        const password = event?.target?.value || '';

        this.fpConfirmPswdValue = password;
        console.log('this.fpConfirmPswdValue : ', this.fpConfirmPswdValue);
    }

    openForgot() {
    this.forgotDialogVisible = true;
    this.fpStep = 1;
    this.otpCode = '';
    this.forgotForm.reset();
  }

  verifyOtp() {
    const email = this.forgotForm.value.fpEmail;
    const otp = this.otpCode;

    const payload = {
      MobileNo: "",
      MailId: email,
      Otp: otp
    };

    // this.spinnerService.ShowSpinner();

    this.userService.verifyOtpDetails(payload).subscribe({
      next: (response) => {
        if (response?.Status === true) {
          this.messageService.add({
            severity: 'success',
            summary: 'OTP Verified',
            detail: 'You can now reset your password.'
          });

          this.fpStep = 3;
          this.showResendOtp = false;

          this.oldPassword = this.password() || 'dummyOld123!';

          this.forgotForm.patchValue({
            fpPassword: '',
            fpConfirmPassword: ''
          });

          this.forgotForm.get('fpPassword')?.markAsUntouched();
          this.forgotForm.get('fpConfirmPassword')?.markAsUntouched();

          this.cdr.detectChanges();
        } else {
          this.showResendOtp = true;

          this.messageService.add({
            severity: 'error',
            summary: 'Invalid OTP',
            detail: 'Please try again.'
          });
        }

        // this.spinnerService.HideSpinner();
      },
      error: () => {
        this.showResendOtp = true;

        this.messageService.add({
          severity: 'error',
          summary: 'Invalid OTP',
          detail: 'Please try again.'
        });

        // this.spinnerService.HideSpinner();
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  resetPassword() {

    console.log('this.fpPassword : ', this.forgotForm.get('fpPassword')?.value);
    console.log('this.fpConfirmPassword : ', this.forgotForm.get('fpConfirmPassword')?.value);
    console.log('this.fpPswdValue : ', this.fpPswdValue);
    console.log('this.fpConfirmPswdValue : ', this.fpConfirmPswdValue);

    this.forgotForm.patchValue({
      fpPassword: this.fpPswdValue,
      fpConfirmPassword: this.fpConfirmPswdValue
    });

    console.log('this.forgotForm.value : ', this.forgotForm.value);

    const { fpPassword, fpConfirmPassword, fpEmail } = this.forgotForm.value;

    const allValid = Object.values(this.passwordRules).every(rule => rule === true);

    if (!allValid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Password',
        detail: 'Password must satisfy all conditions.'
      });
      return;
    }

    if (fpPassword !== fpConfirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mismatch',
        detail: 'Passwords do not match'
      });
      return;
    }

    if (fpPassword === this.oldPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Password Error',
        detail: 'New password cannot be the same as the old password'
      });
      return;
    }

    const payload = {
      MobileNo: '',
      MailId: fpEmail,
      Password: fpPassword
    };

    // this.spinnerService.ShowSpinner();

    this.userService.updateNewPassword(payload).subscribe({
      next: (response) => {
        // this.spinnerService.HideSpinner();

        this.messageService.add({
          severity: 'success',
          summary: 'Password Reset',
          detail: 'You can now log in with your new password'
        });

        this.forgotDialogVisible = false;
      },
      error: (err) => {
        // this.spinnerService.HideSpinner();

        this.messageService.add({
          severity: 'error',
          summary: 'Reset Failed',
          detail: 'Something went wrong. Please try again.'
        });
      }
    });
  }

  sendOtp() {
    const email = this.forgotForm.value.fpEmail;

    var loggedInUserDetails = this.authService.userData();

    if(loggedInUserDetails?.MailId?.trim() != email.trim())
    {
      const emailControl = this.forgotForm.get('fpEmail');
      if (emailControl) {        
        emailControl.setErrors({ invalid: true });
        emailControl.markAsTouched();
      }
      
      return;
    }

    const payload = {
      MobileNo: '',
      MailId: email,
      Otp: ''
    };

    // this.spinnerService.ShowSpinner();

    this.userService.updateOtpToResetPassword(payload).subscribe({
      next: (response) => {

        if(!response || !response.Status)
        {
            this.messageService.add({
                severity: 'error',
                summary: 'OTP sent Failed',
                detail: response?.response.Message ?? 'Failed to send OTP. Please try again.'
            });
        }
        else{
            this.messageService.add({
                severity: 'info',
                summary: 'OTP Sent',
                detail: `OTP has been resent to ${email}`
            });

            this.fpStep = 2;
            this.otpCode = '';
            this.showResendOtp = false;
            // this.spinnerService.HideSpinner();
        }

       
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to send OTP',
          detail: 'Please check the email and try again.'
        });

        // this.spinnerService.HideSpinner();
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
                    next: (detailsRes: UserDetails) => {
                        this.loading.set(false);
                        this.authService.setUserDetails(detailsRes);

                        if(detailsRes.IsFirstTimeLogin)
                        {
                            this.openForgot();
                        }
                        else
                        {                            
                            this.router.navigate(['/dashboard']);
                        }

                       
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

    onPasswordInput(event: any) {
    const password = event?.target?.value || '';
    this.passwordRules.minLength = password.length >= 8 && password.length <= 45;
    this.passwordRules.upperCase = /[A-Z]/.test(password);
    this.passwordRules.lowerCase = /[a-z]/.test(password);
    this.passwordRules.number = /[0-9]/.test(password);
    this.passwordRules.specialChar = /[!@#$%^*()_+\-=\[\]{};:,.?~\\|]/.test(password);

    this.fpPswdValue = password;

    console.log('this.fpPasswordValue : ', this.fpPswdValue);
  }
}
