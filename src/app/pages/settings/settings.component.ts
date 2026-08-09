import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentDetails, ResetCredPassword, RoleDetails, SettingDetails, UserDetails } from '@app/shared/models/api.models';
import { AdminService } from '@app/shared/services/admin.service';
import { AuthService } from '@app/shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { environment } from '../../../environments/environment';
import { RoleService } from '@app/shared/services/role.service';
import { UserService } from '@app/shared/services/user.service';
import { DialogModule } from 'primeng/dialog';
import { DepartmentService } from '@app/shared/services/department.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        ButtonModule, FormsModule, InputTextModule, CommonModule, CheckboxModule, DialogModule,
        InputGroupModule, InputGroupAddonModule, AccordionModule, DatePickerModule,
        SelectModule
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    private messageService = inject(MessageService);
    private _authService = inject(AuthService);
    private _adminService = inject(AdminService);
    private roleService = inject(RoleService);
    private userService = inject(UserService);
    public departmentService = inject(DepartmentService);

    public users: UserDetails[] = [];
    public loggedInUserDetails: UserDetails | null = null;
    public departments: DepartmentDetails[] = [];
    public settingDetails: SettingDetails = {
        SettingId: 0, CutOffDays: 90, Fine: 1, EnableFineRule: true, EnableEmailNotification: true, EnableWishlistNotification: true,
        EnableMobileNotification: false, EnableBarcodeScanning:false, EnableBarcodePrintOption: false, ReminderMailNotificationInDays: 2, IsActive: true
    };
    // public finePercentage: string = "";
    public errors: { CutOffDays: string, Fine: string, ReminderMailNotificationInDays: string } = { CutOffDays: '', Fine: '', ReminderMailNotificationInDays:'' };

    public dobDate: Date | null = null;
    public currentUser: UserDetails = {
        UserId: 0,
        FullName: '',
        Gender: '',
        DOB: '',
        MailId: '',
        MobileNo: '',
        ProfilePhoto: '',
        RoleId: 0,
        RoleName: '',
        DepartmentId: 0,
        DepartmentName: '',
        AdmissionNumber: '',
        StaffId:'',
        CreatedByUserId: 0,
        CreatedByUserName: '',
        IsActive: true,
        LibraryNo: '',
        Batch: '',
        Status: null
    };
    public userErrors: {
        FullName: string,
        Gender: string,
        DOB: string,
        MailId: string,
        MobileNo: string,
        RoleId: string,
        DepartmentId: string,
        AdmissionNumber: string,
        StaffId: string,
        Status: string,
        IsActive: string,
        LibraryNo: string, Batch: string
    } = {
            FullName: '',
            Gender: '',
            DOB: '',
            MailId: '',
            MobileNo: '',
            RoleId: '',
            DepartmentId: '',
            AdmissionNumber:'',
            StaffId:'',
            Status: '',
            IsActive: '',
            LibraryNo: '',
            Batch: ''
        };
    public roleOptions: { label: string; value: number; }[] = [];
    public genderOptions: { label: string; value: string; }[] = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
        { label: 'Others', value: 'O' },
    ];

    public minDate: Date | undefined;
    public maxDate: Date | undefined;
    public calendarFocusDate!: Date;
    public enableAplnSettingsAccess : boolean = false;
    public enableUserSettingsAccess : boolean = false;
    public resetPwdDialogVisible: boolean = false;
    public showCurrentPassword = false;
    public showNewPassword = false;
    public showConfirmPassword = false;
    // oldPassword: string = '';
    confirmPassword: string = '';
    specialChars: string = '!@#$%^*()_+-=[]{};:,.?~\\|';
    passwordRules = {
        minLength: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false
    };
    public resetCredPassword: ResetCredPassword ={};
    public departmentOptions: { label: string; value: number; }[] = [];
    public batchOptions: { label: string; value: string; }[] = [];
    public studentRoleId: number  = 5;
    public departmentEligibleForRoleIdAbove: number  = 1;

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.studentRoleId = environment.studentRoleId;
        this.departmentEligibleForRoleIdAbove = environment.departmentEligibleForRoleIdAbove;
        const today = new Date();

        if(this.loggedInUserDetails?.RoleId && this.loggedInUserDetails.RoleId <= 2)
        {
            this.enableAplnSettingsAccess = true;
        }

        if(this.loggedInUserDetails?.RoleId && this.loggedInUserDetails.RoleId <= 3)
        {
            this.enableUserSettingsAccess = true;
        }

        

        let year = today.getFullYear();
        let minYear = year - 100;
        let maxYear = year - environment.studentsMinimumAge;

        this.minDate = new Date();
        this.minDate.setDate(1);
        this.minDate.setMonth(0);
        this.minDate.setFullYear(minYear);

        this.maxDate = new Date();
        this.maxDate.setMonth(11);
        this.maxDate.setDate(31);
        this.maxDate.setFullYear(maxYear);

        this.calendarFocusDate = new Date(this.maxDate.getFullYear(), today.getMonth(), today.getDate());
        this.loadSettingDetails();
        this.loadRoleDetails();

        this.currentUser = { ...this.loggedInUserDetails };
        this.dobDate = this.currentUser.DOB ? new Date(this.currentUser.DOB) : null;
        this.loadDepartmentDetails();
        this.generateBatchOptions();
        this.loadUserDetails();
    }

     generateBatchOptions(): void {
        const currentYear = new Date().getFullYear(); // 2026
        const targetEndYear = environment.batchStartFromYear; // 2000
        
        // Dynamically loops from currentYear down to targetEndYear
        for (let year = currentYear; year >= targetEndYear; year--) {
            const rangeText = `${year} - ${year + 4}`;
            
            this.batchOptions.push({
            label: rangeText,
            value: rangeText
            });
        }
    }

    loadRoleDetails(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[]) => {
                this.roleOptions = data.map(role => {
                    return { label: role.RoleName ?? '', value: role.RoleId };
                });
            },
            error: (err) => {
                console.error('Error loading role:', err);
            }
        });
    }

    loadDepartmentDetails(): void {
                this.departmentService.getDepartmentDetails().subscribe({
                    next: (data: DepartmentDetails[]) => {
                        this.departments = data;
                        this.departmentOptions = data.map(dept => {
                        return { label: dept.DepartmentName ?? '', value: dept.DepartmentId };
                    });
                    },
                    error: (err :any) => {
                        console.error('Error loading departments:', err);
                    }
                });
    }

    loadSettingDetails(): void {
        this._adminService.getSettingDetails().subscribe({
            next: (data: SettingDetails[]) => {
                const filteredData = data.filter(x => x.IsActive == true);
                if (filteredData != null) {
                    this.settingDetails = filteredData[0];

                    // if (this.settingDetails.FinePercentage > 0) {
                    //     this.finePercentage = (this.settingDetails.FinePercentage * 100).toString();
                    // }
                }
            },
            error: (err) => {
                console.error('Error loading role:', err);
            }
        });
    }

    loadUserDetails(): void {
        
        this.userService.getAllUserDetails().subscribe({
            next: (data: UserDetails[]) => {
                this.users = data || []; 

                const matchedUser = this.users.find(x => x.UserId === this.loggedInUserDetails?.UserId);

                if (matchedUser) {
                    this.currentUser = { ...matchedUser };
                    this.dobDate = this.currentUser.DOB ? new Date(this.currentUser.DOB) : null;
                }
            },
            error: (err) => {
                console.error('Error loading users:', err);
            }
        });
        
    }

    validateInput(key: string, value: any): boolean {
        let isValid = true;

        switch (key) {
            case 'CutOffDays':
                if (!/^\d+$/.test(value?.toString().trim() ?? '') || Number(value) <= 0) {
                    this.errors.CutOffDays = 'Cut-Off Days is required and must be a valid input.';
                    isValid = false;
                } else {
                    this.errors.CutOffDays = '';
                }
                break;

            case 'Fine':
                if (!/^\d+(\.\d+)?$/.test(value?.toString().trim() ?? '') || Number(value) <= 0) {
                    this.errors.Fine = 'Fine per day is required and must be a valid input.';
                    this.settingDetails.Fine = 0.00;
                    isValid = false;
                } else {
                    this.errors.Fine = '';
                    // this.settingDetails.FinePercentage = Math.round(((parseInt(value) / 100) + Number.EPSILON) * 100) / 100;
                }
                break;
            
            case 'ReminderMailNotificationInDays':
                if (!/^\d+$/.test(value?.toString().trim() ?? '') || (Number(value) <= 0 && Number(value) >5)) {
                    this.errors.ReminderMailNotificationInDays = 'Reminder Mail Notification In Days is required and must be a less than 5 days.';
                    isValid = false;
                } else {
                    this.errors.ReminderMailNotificationInDays = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateAplnSettings(): boolean {
        const isCutOffDays = this.validateInput('CutOffDays', this.settingDetails.CutOffDays);
        const isFine = this.validateInput('Fine', this.settingDetails.Fine.toString());
        const isReminderMailNotificationInDays = this.validateInput('ReminderMailNotificationInDays', this.settingDetails.ReminderMailNotificationInDays);
        

        return isCutOffDays && isFine && isReminderMailNotificationInDays;
    }

    saveAplnSettings(): void {
        if (!this.validateAplnSettings()) {
            return;
        }

        const payload = this.settingDetails;
        this._adminService.updateSettingDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Application Settings - Failed',
                        detail: res ? res.Message : 'Failed to update Application Settings. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Application Settings - Success',
                        detail: 'Application Settings updated successfully.'
                    });

                    this._authService.setSettingsDetails({...payload});
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Application Settings - Failed',
                    detail: 'Failed to update Application Settings. Please try again.'
                });
            }
        });
    }

    onRoleChange(): void {
        const role = this.roleOptions.find(l => l.value === this.currentUser.RoleId);
        if (role) {
            this.currentUser.RoleName = role.label;
        }

        this.validateUserInput('RoleId');
    }

    onDOBChange(): void {
        if (this.dobDate) {
            const userTimezoneOffset = this.dobDate.getTimezoneOffset(); // Will be -330 for India    
            const correctedDate = new Date(this.dobDate.getTime() - (userTimezoneOffset * 60 * 1000));

            this.currentUser.DOB = correctedDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
        }
        else {
            this.currentUser.DOB = null;
        }

        this.validateUserInput('DOB');
    }

    validateNumberInput(event: KeyboardEvent, allowedKeys: string[]): void {
        const isNumber = event.key >= '0' && event.key <= '9';

        // If it's not a number and not in our allowed keys list, block the input
        if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    validateUserInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'FullName':
                if (!this.currentUser.FullName?.trim()) {
                    this.userErrors.FullName = 'Full name is required.';
                    isValid = false;
                } else {
                    this.userErrors.FullName = '';
                }
                break;

            case 'RoleId':
                if (!(this.currentUser.RoleId != null && this.currentUser.RoleId > 0)) {
                    this.userErrors.RoleId = 'Please select Role.';
                    isValid = false;
                } else {
                    this.userErrors.RoleId = '';
                }
                break;

            case 'Gender':
                if (!this.currentUser.Gender?.trim()) {
                    this.userErrors.Gender = 'Please select Gender.';
                    isValid = false;
                } else {
                    this.userErrors.Gender = '';
                }
                break;

            case 'MailId':
                if (!this.currentUser.MailId?.trim()) {
                    this.userErrors.MailId = 'MailId is required.';
                    isValid = false;
                } 
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentUser.MailId?.trim())) {
                    this.userErrors.MailId = 'Invalid email.';
                    isValid = false;
                }
                else if(this.currentUser.UserId == 0 && this.users.find(x => x.MailId?.trim() == this.currentUser.MailId?.trim())){
                    this.userErrors.MobileNo = 'MailId already exists.';
                    isValid = false;
                }
                else if(this.currentUser.UserId !=null && this.currentUser.UserId > 0 && this.users.find(x => x.MailId?.trim() == this.currentUser.MailId?.trim() && x.UserId != this.currentUser.UserId)){
                    this.userErrors.MobileNo = 'MailId already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.MailId = '';
                }
                break;

            case 'MobileNo':
                if (!this.currentUser.MobileNo?.trim()) {
                    this.userErrors.MobileNo = 'MobileNo is required.';
                    isValid = false;
                } 
                else if(this.currentUser.UserId == 0 && this.users.find(x => x.MobileNo == this.currentUser.MobileNo?.trim())){
                    this.userErrors.MobileNo = 'MobileNo already exists.';
                    isValid = false;
                }
                else if(this.currentUser.UserId !=null && this.currentUser.UserId > 0 && this.users.find(x => x.MobileNo == this.currentUser.MobileNo?.trim() && x.UserId != this.currentUser.UserId)){
                    this.userErrors.MobileNo = 'MobileNo already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.MobileNo = '';
                }
                break;

            case 'DOB':
                if (!this.currentUser.DOB?.trim()) {
                    this.userErrors.DOB = 'DOB is required.';
                    isValid = false;
                } else {
                    this.userErrors.DOB = '';
                }
                break;

            case 'DepartmentId':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove) && !(this.currentUser.DepartmentId != null && this.currentUser.DepartmentId > 0)) {
                    this.userErrors.DepartmentId = 'Please select Department.';
                    isValid = false;
                } else {
                    this.userErrors.DepartmentId = '';
                }
                break;

            case 'AdmissionNumber':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId == this.studentRoleId) && !(this.currentUser.AdmissionNumber?.trim())) {
                    this.userErrors.AdmissionNumber = 'Admission Number is required.';
                    isValid = false;
                }
                else if ((this.currentUser.RoleId != null && this.currentUser.RoleId == this.studentRoleId) && !(this.currentUser.AdmissionNumber?.trim()) && this.users.find(x => x.AdmissionNumber == this.currentUser.AdmissionNumber && x.UserId != this.currentUser.UserId)) {
                    this.userErrors.AdmissionNumber = 'Admission Number already exists.';
                    isValid = false;
                } else {
                    this.userErrors.AdmissionNumber = '';
                }
                break;

            case 'LibraryNo': 
                const libraryNo = this.currentUser.LibraryNo?.trim();
                const libraryNoPattern = /^VCN \d{1,9}$/i;

                if (!libraryNo) {
                    this.userErrors.LibraryNo = 'Library Number is required.';
                    isValid = false;
                }
                else if (!libraryNoPattern.test(libraryNo ?? '')
                ) {
                    this.userErrors.LibraryNo = 'Library Number should be in VCN {number} format.';
                    isValid = false;
                }
                else if (this.users.some(x => x.LibraryNo?.trim().toLowerCase() === libraryNo?.toLowerCase() && x.UserId != this.currentUser.UserId)
                ) {
                    this.userErrors.LibraryNo = 'Library Number already exists.';
                    isValid = false;
                } else {
                    this.userErrors.LibraryNo = '';
                }
                break;            

            case 'Batch':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId == this.studentRoleId) && !(this.currentUser.Batch !=null && this.currentUser.Batch.trim() != "")) {
                    this.userErrors.Batch = 'Batch is required.';
                    isValid = false;
                }
                else {
                    this.userErrors.Batch = '';
                }
                break;
            
            case 'StaffId':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove && this.currentUser.RoleId < this.studentRoleId) && !(this.currentUser.StaffId !=null && this.currentUser.StaffId.trim() !="")) {
                    this.userErrors.StaffId = 'StaffId is required.';
                    isValid = false;
                }
                else if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove && this.currentUser.RoleId < this.studentRoleId) && !(this.currentUser.StaffId !=null && this.currentUser.StaffId.trim() !="") && this.users.find(x => x.StaffId == this.currentUser.StaffId && x.UserId != this.currentUser.UserId)) {
                    this.userErrors.StaffId = 'StaffId is already exists.';
                    isValid = false;
                } else {
                    this.userErrors.StaffId = '';
                }
                break;

            case 'Status':
                if (this.currentUser.Status === null) {
                    this.userErrors.Status = 'Access Request Status is required.';
                    isValid = false;
                } else {
                    this.userErrors.Status = '';
                }
                break;

            case 'IsActive':
                if (this.currentUser.IsActive === null) {
                    this.userErrors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.userErrors.IsActive = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    onDepartmentChange(): void{
        const department = this.departmentOptions.find(l => l.value === this.currentUser.DepartmentId);
        if (department) {
            this.currentUser.DepartmentName = department.label;
        }

        this.validateUserInput('DepartmentId');
    }

    validateUser(): boolean {
        const isNameValid = this.validateUserInput('FullName');
        const isRoleIdValid = this.validateUserInput('RoleId');
        const isGenderValid = this.validateUserInput('Gender');
        const isMailIdValid = this.validateUserInput('MailId');
        const isMobileNoValid = this.validateUserInput('MobileNo');
        const isDOBValid = this.validateUserInput('DOB');
        const isDepartmentIdValid = this.validateUserInput('DepartmentId');
        const isAdmissionNumberValid = this.validateUserInput('AdmissionNumber');
        const isStaffIdValid = this.validateUserInput('StaffId');
        const isLibraryNoValid = this.validateUserInput('LibraryNo');
        const isBatchValid = this.validateUserInput('Batch');
        // const isAccessRequestValid = this.validateInput('Status');
        // const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isRoleIdValid && isGenderValid &&
            isMailIdValid && isMobileNoValid && isDOBValid && isDepartmentIdValid && isAdmissionNumberValid && isStaffIdValid && isLibraryNoValid && isBatchValid;
    }

    saveUser(): void {
        if (!this.validateUser()) {
            return;
        }

        const payload = this.currentUser;
        this.userService.updateUserDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage User - Failed',
                        detail: res ? res.Message : 'Failed to update User. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage User - Success',
                        detail: 'User updated successfully.'
                    });
                }

                this.loadSaveUserDetails();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage User - Failed',
                    detail: 'Failed to update User. Please try again.'
                });
            }
        });
    }

    loadSaveUserDetails(): void {
        this.userService.getLoggedInUserDetails(this.loggedInUserDetails?.MobileNo ?? undefined, this.loggedInUserDetails?.MailId ?? undefined)
            .subscribe({
                next: (detailsRes: any) => {
                    this._authService.setUserDetails(detailsRes);
                    
                    this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
                    this.currentUser = { ...this.loggedInUserDetails };
                    this.dobDate = this.currentUser.DOB ? new Date(this.currentUser.DOB) : null;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login Failed',
                        detail: 'Unable to load logged-in user details.'
                    });
                }
            });
    }

    clearPwdFields(){
        this.resetCredPassword = { UserId: this.loggedInUserDetails?.UserId ?? 0, OldPwd: '', NewPwd: '' };
        this.confirmPassword = '';
        this.passwordRules = {
            minLength: false,
            upperCase: false,
            lowerCase: false,
            number: false,
            specialChar: false
        };
    }

    resetPassword():void{

       this.clearPwdFields();
        this.resetPwdDialogVisible = true;
    }

    saveNewPassword():void{
        

        const allValid = Object.values(this.passwordRules).every(rule => rule === true);

        if (!allValid) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Invalid Password',
            detail: 'Password must satisfy all conditions.'
        });
        return;
        }

        if (this.resetCredPassword.NewPwd !== this.confirmPassword) {
        this.messageService.add({
            severity: 'error',
            summary: 'Mismatch',
            detail: 'Passwords do not match'
        });
        return;
        }

        if (this.resetCredPassword.NewPwd === this.resetCredPassword.OldPwd) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Password Error',
            detail: 'New password cannot be the same as the old password'
        });
        return;
        }

        const payload : ResetCredPassword = {
            UserId: this.loggedInUserDetails?.UserId ?? 0,
            OldPwd: this.resetCredPassword.OldPwd,
            NewPwd: this.resetCredPassword.NewPwd
        };

        // this.spinnerService.ShowSpinner();

        this.userService.resetCredPassword(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Password Reset - Failed',
                        detail: res ? res.Message : 'Failed to reset password. Please try again.'
                    });
                }
                else{
                    this.messageService.add({
                    severity: 'success',
                    summary: 'Password Reset',
                    detail: 'You can now log in with your new password'
                    });

                    this.resetPwdDialogVisible = false;
                    this.clearPwdFields();
                }
            },
            error: (err) => {
                // this.spinnerService.HideSpinner();

                this.messageService.add({
                severity: 'error',
                summary: 'Password Reset Failed',
                detail: 'Failed to reset password. Please try again.'
                });
            }
        });

    }

    onPasswordInput(event: any) {
    const password = event?.target?.value || '';
    this.passwordRules.minLength = password.length >= 8 && password.length <= 45;
    this.passwordRules.upperCase = /[A-Z]/.test(password);
    this.passwordRules.lowerCase = /[a-z]/.test(password);
    this.passwordRules.number = /[0-9]/.test(password);
    this.passwordRules.specialChar = /[!@#$%^*()_+\-=\[\]{};:,.?~\\|]/.test(password);

    this.resetCredPassword.NewPwd = password;

    console.log('this.resetCredPassword.NewPwd : ', this.resetCredPassword.NewPwd);
  }
}
