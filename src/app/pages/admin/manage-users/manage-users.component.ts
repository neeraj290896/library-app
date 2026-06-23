import { Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, RoleDetails, UserDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';
import { RoleService } from '@app/shared/services/role.service';
import { UserService } from '@app/shared/services/user.service';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { QRCodeComponent } from 'angularx-qrcode';
import { TabViewModule } from 'primeng/tabview';
import { UsersBookCirculationComponent } from '@app/pages/checkout/users-book-circulation/users-book-circulation.component';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { AuthService } from '@app/shared/services/auth.service';
import { IssueReturnBooksComponent } from '@app/pages/checkout/issue-return-books/issue-return-books.component';
import { environment } from '../../../../environments/environment';
import { ManageWishlistComponent } from '@app/pages/books/manage-wishlist/manage-wishlist.component';

type ImportUserDetails = UserDetails & {
    Error: string;
};

@Component({
    selector: 'app-manage-users',
    imports: [CommonModule, ButtonModule, TableModule, TagModule, DatePickerModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, TabViewModule,
        SelectModule, FormsModule, TooltipModule, QRCodeComponent, UsersBookCirculationComponent, IssueReturnBooksComponent, ManageWishlistComponent],
    templateUrl: './manage-users.component.html',
    styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent {
    @Input() public searchTerm: string = '';

    private messageService = inject(MessageService);
    private userService = inject(UserService);
    private roleService = inject(RoleService);
    private _bcService = inject(BookCirculationService);
    private _authService = inject(AuthService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public minDate: Date | undefined;
    public maxDate: Date | undefined;

    public users: UserDetails[] = [];
    public roles: RoleDetails[] = [];
    public showFt: boolean = false;
    public userNameList: { label: string, value: string }[] = [];
    public roleList: { label: string, value: string }[] = [];
    public mobileNoList: { label: string, value: string }[] = [];
    public genderList: { label: string, value: string }[] = [];
    public mailIdList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedUserNameList: string[] = [];
    public selectedRoleList: string[] = [];
    public selectedMobileNoList: string[] = [];
    public selectedMailIdList: string[] = [];
    public selectedGenderList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public userDialogVisible = false;
    public header: string = '';
    public activeTab: number = 0;
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
        CreatedByUserId: 0,
        CreatedByUserName: '',
        IsActive: true,
        Status: null
    };
    public errors: {
        FullName: string,
        Gender: string,
        DOB: string,
        MailId: string,
        MobileNo: string,
        RoleId: string,
        Status: string,
        IsActive: string
    } = {
            FullName: '',
            Gender: '',
            DOB: '',
            MailId: '',
            MobileNo: '',
            RoleId: '',
            Status: '',
            IsActive: ''
        };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];
    public roleOptions: { label: string; value: number; }[] = [];
    public genderOptions: { label: string; value: string; }[] = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
        { label: 'Others', value: 'O' },
    ];
    public statusOptions: { label: string; value: string; }[] = [
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Pending', value: 'Pending' }
    ];

    public importIndex: number = -1;
    public importUserDialogVisible = false;
    public importDialogVisible: boolean = false;
    public importPreview: ImportUserDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importUserNameList: { label: string, value: string }[] = [];
    public importRoleList: { label: string, value: string }[] = [];
    public importMobileNoList: { label: string, value: string }[] = [];
    public importGenderList: { label: string, value: string }[] = [];
    public importMailIdList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedUserNameList: string[] = [];
    public importSelectedRoleList: string[] = [];
    public importSelectedMobileNoList: string[] = [];
    public importSelectedGenderList: string[] = [];
    public importSelectedMailIdList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    public selectedUserDetails: UserDetails[] = [];
    public selectedIds: number[] = [];
    public printUserDialogVisible: boolean = false;
    public isViewOnly: boolean = false;
    public bcDialogVisible: boolean = false;
    public checkInDialogVisible: boolean = false;
    public bc: BookCirculationDetails | null = null;
    public type: string = '';
    public loggedInUserDetails: UserDetails = {};
    public todayDate: string | undefined;
    calendarFocusDate!: Date; 

    ngOnInit(): void {
        const today = new Date();
        this.todayDate = this.parseCustomDateStringForUI(today);

        let year = today.getFullYear();
        let minYear = year - 100;
        let maxYear = year - environment.studentsMinimumAge;

        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;

        this.minDate = new Date();
        this.minDate.setDate(1);
        this.minDate.setMonth(0);
        this.minDate.setFullYear(minYear);

        this.maxDate = new Date();        
        this.maxDate.setMonth(11);
        this.maxDate.setDate(31);
        this.maxDate.setFullYear(maxYear);

         this.calendarFocusDate = new Date(this.maxDate.getFullYear(),  today.getMonth(), today.getDate());


        this.loadRoleDetails();
        this.loadUserDetails();
    }

    loadRoleDetails(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[]) => {
                this.roles = data;
                this.roleOptions = data.map(role => {
                    return { label: role.RoleName ?? '', value: role.RoleId };
                });
            },
            error: (err) => {
                console.error('Error loading role:', err);
            }
        });
    }

    loadUserDetails(): void {
        if (this.searchTerm) {
            this.userService.searchUserDetails(this.searchTerm).subscribe({
                next: (data: UserDetails[]) => {
                    this.users = data;
                    this.initializeFilterLists();
                },
                error: (err) => {
                    console.error('Error loading users:', err);
                }
            });
        }
        else {
            this.userService.getAllUserDetails().subscribe({
                next: (data: UserDetails[]) => {
                    this.users = data;
                    this.initializeFilterLists();
                },
                error: (err) => {
                    console.error('Error loading users:', err);
                }
            });
        }
    }

    initializeFilterLists(): void {
        this.userNameList = [...new Set(this.users.map(user => user.FullName))]
            .map(e => ({ label: e!, value: e! }));
        this.roleList = [...new Set(this.users.map(user => user.RoleName))]
            .map(e => ({ label: e!, value: e! }));
        this.genderList = [...new Set(this.users.map(user => user.Gender))]
            .map(e => ({ label: e!, value: e! }));
        this.mailIdList = [...new Set(this.users.map(user => user.MailId))]
            .map(e => ({ label: e!, value: e! }));
        this.mobileNoList = [...new Set(this.users.map(user => user.MobileNo))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.users.map(user => user.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importUserNameList = [...new Set(this.importPreview.map(user => user.FullName))]
            .map(e => ({ label: e!, value: e! }));
        this.importRoleList = [...new Set(this.importPreview.map(user => user.RoleName))]
            .map(e => ({ label: e!, value: e! }));
        this.importGenderList = [...new Set(this.importPreview.map(user => user.Gender))]
            .map(e => ({ label: e!, value: e! }));
        this.importMailIdList = [...new Set(this.importPreview.map(user => user.MailId))]
            .map(e => ({ label: e!, value: e! }));
        this.importMobileNoList = [...new Set(this.importPreview.map(user => user.MobileNo))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(user => user.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(lang => lang.Error))]
            .map(e => ({ label: e!, value: e! }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    showImportFilter(): void {
        this.importShowFt = !this.importShowFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedUserNameList = [];
        this.selectedRoleList = [];
        this.selectedMobileNoList = [];
        this.selectedMailIdList = [];
        this.selectedGenderList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedUserNameList = [];
        this.importSelectedRoleList = [];
        this.importSelectedMobileNoList = [];
        this.importSelectedMailIdList = [];
        this.importSelectedGenderList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editUser(_user: UserDetails | null = null): void {
        if (_user) {
            this.currentUser = { ..._user };
            this.header = 'Edit User';
            this.dobDate = _user.DOB ? new Date(_user.DOB) : null;
        }
        else {
            this.currentUser = {
                UserId: 0, FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', ProfilePhoto: '',
                RoleId: 0, RoleName: '', CreatedByUserId: 0, CreatedByUserName: '', IsActive: true, Status: 'Pending'
            };
            this.header = 'Add User';
            this.dobDate = null;
        }

        this.errors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status: '', IsActive: '' };
        this.userDialogVisible = true;
        this.isViewOnly = false;
    }

    viewUser(_user: UserDetails): void {
        if (_user) {
            this.currentUser = { ..._user };
            this.header = 'View User';
            this.dobDate = _user.DOB ? new Date(_user.DOB) : null;
        }

        this.errors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status: '', IsActive: '' };
        this.userDialogVisible = true;
        this.isViewOnly = true;
    }

    onRoleChange(): void {
        const role = this.roleOptions.find(l => l.value === this.currentUser.RoleId);
        if (role) {
            this.currentUser.RoleName = role.label;
        }

        this.validateInput('RoleId');
    }

    onDOBChange(): void {
        if (this.dobDate) {
            // this.dobDate.setHours(0, 0, 0, 0);
             // Reverse the 5 hour 30 min shift (in minutes: 5 * 60 + 30 = 330)
            const userTimezoneOffset = this.dobDate.getTimezoneOffset(); // Will be -330 for India    
            const correctedDate = new Date(this.dobDate.getTime() - (userTimezoneOffset * 60 * 1000));    

            this.currentUser.DOB = correctedDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
        }
        else {
            this.currentUser.DOB = null;
        }

        this.validateInput('DOB');
    }

    // onGenderChange(): void {
    //     const gender = this.genderOptions.find(l => l.value === this.currentUser.Gender);
    //     if (gender) {
    //         this.currentUser.Gender = gender.label;
    //     }

    //     this.validateInput('Gender');
    // }

    //  onStatusChange(): void {
    //     const acReq = this.statusOptions.find(l => l.value === this.currentUser.Status);
    //     if (acReq) {
    //         this.currentUser.Status = acReq.label;
    //     }

    //     this.validateInput('Status');
    // }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'FullName':
                if (!this.currentUser.FullName?.trim()) {
                    this.errors.FullName = 'Full name is required.';
                    isValid = false;
                } else {
                    this.errors.FullName = '';
                }
                break;

            case 'RoleId':
                if (!(this.currentUser.RoleId != null && this.currentUser.RoleId > 0)) {
                    this.errors.RoleId = 'Please select Role.';
                    isValid = false;
                } else {
                    this.errors.RoleId = '';
                }
                break;

            case 'Gender':
                if (!this.currentUser.Gender?.trim()) {
                    this.errors.Gender = 'Please select Gender.';
                    isValid = false;
                } else {
                    this.errors.Gender = '';
                }
                break;

            case 'MailId':
                if (!this.currentUser.MailId?.trim()) {
                    this.errors.MailId = 'MailId is required.';
                    isValid = false;
                } else {
                    this.errors.MailId = '';
                }
                break;

            case 'MobileNo':
                if (!this.currentUser.MobileNo?.trim()) {
                    this.errors.MobileNo = 'MobileNo is required.';
                    isValid = false;
                } else {
                    this.errors.MobileNo = '';
                }
                break;

            case 'DOB':
                if (!this.currentUser.DOB?.trim()) {
                    this.errors.DOB = 'DOB is required.';
                    isValid = false;
                } else {
                    this.errors.DOB = '';
                }
                break;

            case 'Status':
                if (this.currentUser.Status === null) {
                    this.errors.Status = 'Access Request Status is required.';
                    isValid = false;
                } else {
                    this.errors.Status = '';
                }
                break;

            case 'IsActive':
                if (this.currentUser.IsActive === null) {
                    this.errors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.IsActive = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateUser(): boolean {
        const isNameValid = this.validateInput('FullName');
        const isRoleIdValid = this.validateInput('RoleId');
        const isGenderValid = this.validateInput('Gender');
        const isMailIdValid = this.validateInput('MailId');
        const isMobileNoValid = this.validateInput('MobileNo');
        const isDOBValid = this.validateInput('DOB');
        // const isAccessRequestValid = this.validateInput('Status');
        // const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isRoleIdValid && isGenderValid &&
            isMailIdValid && isMobileNoValid && isDOBValid;
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

                this.loadUserDetails();
                this.userDialogVisible = false;
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

    deleteUser(_user: UserDetails): void {
        const payload = _user;
        this.userService.deleteUserDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete User - Failed',
                        detail: res ? res.Message : 'Failed to delete user. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete User - Success',
                        detail: 'User deleted successfully.'
                    });
                }

                this.loadUserDetails();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete User - Failed',
                    detail: 'Failed to delete user. Please try again.'
                });
            }
        });
    }

    importUser(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadUserTemplate(): Promise<void> {
        const workbook = new ExcelJS.Workbook();

        const bodyStyle: Partial<ExcelJS.Style> = {
            border: {
                top: { style: 'thin', color: { argb: '00000000' } },
                left: { style: 'thin', color: { argb: '00000000' } },
                bottom: { style: 'thin', color: { argb: '00000000' } },
                right: { style: 'thin', color: { argb: '00000000' } },
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
        };

        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } },
            ...bodyStyle
        };

        const worksheet = workbook.addWorksheet('Users');
        worksheet.addRow(['FULL NAME', 'ROLE NAME', 'GENDER', 'MOBILE NO', 'MAIL ID']);

        worksheet.getRow(1).eachCell(cell => {
            cell.style = headerStyle;
        });

        worksheet.autoFilter = {
            from: 'A1',
            to: 'E1'
        };

        const rolesSheet = workbook.addWorksheet('RoleList');
        this.roles.filter(x => x.IsActive == true && x.RoleId >= (this.loggedInUserDetails.RoleId || 0)).forEach((role, idx) => {
            rolesSheet.getCell(idx + 1, 1).value = role.RoleName;
        });
        rolesSheet.state = 'hidden';

        for (let rowIndex = 2; rowIndex <= 1000; rowIndex++) {
            const roleCell = worksheet.getCell(rowIndex, 2);
            roleCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`RoleList!$A$1:$A$${this.roles.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Role',
                error: 'Please select a valid role from the list.'
            };

            const genderCell = worksheet.getCell(rowIndex, 3);
            genderCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"M,F,O"'],
                showErrorMessage: true,
                errorTitle: 'Invalid Gender',
                error: 'Please select a valid gender from the list [M -Male, F - Female, O - Other].'
            };

            const mobileCell = worksheet.getCell(rowIndex, 4);
            mobileCell.dataValidation = {
                type: 'custom',
                allowBlank: false,
                formulae: [`AND(ISNUMBER(D${rowIndex}),LEN(D${rowIndex})=10)`],
                showErrorMessage: true,
                errorTitle: 'Invalid Mobile Number',
                error: 'Please enter a valid 10-digit mobile number.'
            };

            const mailCell = worksheet.getCell(rowIndex, 5);
            mailCell.dataValidation = {
                type: 'custom',
                allowBlank: false,
                formulae: [`AND(ISNUMBER(SEARCH("@",E${rowIndex})),ISNUMBER(SEARCH(".",E${rowIndex})))`],
                showErrorMessage: true,
                errorTitle: 'Invalid Email',
                error: 'Please enter a valid email address.'
            };

            // const dobCell = worksheet.getCell(rowIndex, 6);
            // dobCell.dataValidation = {
            //     type: 'date',
            //     operator: 'between',
            //     formulae: [new Date(1900, 0, 1), new Date(2100, 11, 31)],
            //     allowBlank: true,
            //     showErrorMessage: true,
            //     errorTitle: 'Invalid Date of Birth',
            //     error: 'Please enter a valid date of birth.'
            // };

            // const accessStatusCell = worksheet.getCell(rowIndex, 7);
            // accessStatusCell.dataValidation = {
            //     type: 'list',
            //     allowBlank: false,
            //     formulae: ['"Approved,Rejected,Pending"'],
            //     showErrorMessage: true,
            //     errorTitle: 'Invalid Access Status',
            //     error: 'Please select a valid access status from the list.'
            // };

            // const statusCell = worksheet.getCell(rowIndex, 8);
            // statusCell.dataValidation = {
            //     type: 'list',
            //     allowBlank: false,
            //     formulae: ['"Active,In-Active"'],
            //     showErrorMessage: true,
            //     errorTitle: 'Invalid Status',
            //     error: 'Please select Active or In-Active.'
            // };
        }

        worksheet.columns.forEach(col => {
            const lengths = col.values === undefined ? [] : col.values.map(v => {
                if (v === null || v === undefined) return 0;
                else return v.toString().length;
            });
            col.width = Math.max(...lengths.filter(v => typeof v === 'number')) + 10;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'import-user-template.xlsx');
    }

    onImportFileSelected(event: Event): void {
        this.importPreview = [];
        this.importUploadError = '';

        const input = event.target as HTMLInputElement;
        if (!input.files || !input.files.length) {
            this.importUploadError = 'File not selected.';
            input.value = '';
            return;
        }

        if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(input.files[0].type)) {
            this.importUploadError = 'Invalid file type. Please upload an Excel file (.xlsx or .xls).';
            input.value = '';
            return;
        }

        const file = input.files[0];
        input.value = '';
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            const data = e.target?.result;
            if (!data) {
                this.importUploadError = 'Unable to read file.';
                return;
            }

            try {
                const workbook = Xlsx.read(data as ArrayBuffer, { type: 'array' });
                if (!workbook.SheetNames.length) {
                    this.importUploadError = 'Excel file does not contain any worksheets.';
                    return;
                }

                const rows = Xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                    defval: null,
                    blankrows: false,
                    raw: false
                });

                if (!rows.length) {
                    this.importUploadError = 'No data rows were found in the file.';
                    return;
                }

                const headerRow = Object.keys(rows[0] || {});
                const expectedHeaders = ['FULL NAME', 'ROLE NAME', 'GENDER', 'MOBILE NO', 'MAIL ID'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const fullName = row['FULL NAME']?.toString().trim();
                    const roleName = row['ROLE NAME']?.toString().trim();
                    const gender = row['GENDER']?.toString().trim();
                    const mobileNo = row['MOBILE NO']?.toString().trim();
                    const mailId = row['MAIL ID']?.toString().trim();
                    // const dob = row['DOB']?.toString().trim();
                    // const status = row['ACCESS STATUS']?.toString().trim();
                    // const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportUserDetails = {
                        UserId: 0,
                        FullName: fullName,
                        Gender: gender,
                        DOB: null,
                        MailId: mailId,
                        MobileNo: mobileNo,
                        ProfilePhoto: '',
                        RoleId: 0,
                        RoleName: roleName,
                        CreatedByUserId: 0,
                        CreatedByUserName: '',
                        IsActive: true,
                        Status: 'Pending',
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportUser();
                this.initializeImportFilterLists();
            }
            catch (error) {
                this.importUploadError = 'Invalid file data.';
            }
        };
    }

    editImportUser(_user: UserDetails, index: number): void {
        this.importIndex = index;
        this.currentUser = { ..._user };

        if(_user.RoleName !="")
        {
            var _roleDetails = this.roleOptions.find(x => x.label == _user.RoleName);
            if(_roleDetails?.label !=null && _roleDetails.label !="")
            {
                this.currentUser.RoleId = _roleDetails.value;
            }
        }
        

        this.header = 'Edit User';
        this.dobDate = _user.DOB ? new Date(_user.DOB) : null;

        this.errors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status: '', IsActive: '' };
        this.importUserDialogVisible = true;
        this.isViewOnly = false;
    }

    viewImportUser(_user: UserDetails): void {
        this.currentUser = { ..._user };

        if(_user.RoleName !="")
        {
            var _roleDetails = this.roleOptions.find(x => x.label == _user.RoleName);
            if(_roleDetails?.label !=null && _roleDetails.label !="")
            {
                this.currentUser.RoleId = _roleDetails.value;
            }
        }

        this.header = 'View User';
        this.dobDate = _user.DOB ? new Date(_user.DOB) : null;

        this.errors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status: '', IsActive: '' };
        this.importUserDialogVisible = true;
        this.isViewOnly = true;
    }

    saveImportUser(): void {
        if (!this.validateUser()) {
            return;
        }

        this.importPreview[this.importIndex] = {
            ...this.importPreview[this.importIndex],
            ...this.currentUser
        };

        this.validateImportInput('FullName', this.importIndex);
        this.validateImportInput('RoleName', this.importIndex);
        this.validateImportInput('Gender', this.importIndex);
        this.validateImportInput('MobileNo', this.importIndex);
        this.validateImportInput('MailId', this.importIndex);
        // this.validateImportInput('DOB', this.importIndex);

        this.importIndex = -1;
        this.importUserDialogVisible = false;
    }

    deleteImportUser(index: number): void {
        this.importPreview.splice(index, 1);
    }

    validateImportInput(key: string, index: number): boolean {
        let isValid = true;

        switch (key) {
            case 'FullName':
                if (!this.importPreview[index].FullName?.trim()) {
                    this.importPreview[index].Error = 'Full name is required.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'RoleName':
                if (!this.importPreview[index].RoleName?.trim()) {
                    this.importPreview[index].Error = 'Role is required.';
                    isValid = false;
                }
                else if (!this.roles.some(role => role.RoleName?.toLowerCase() === this.importPreview[index].RoleName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Role not enlisted.';
                    isValid = false;
                }
                else {
                    const role = this.roles.find(r => r.RoleName?.toLowerCase() === this.importPreview[index].RoleName?.trim().toLowerCase());
                    if (role) {
                        this.importPreview[index].RoleId = role.RoleId;
                        this.importPreview[index].RoleName = role.RoleName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'Gender':
                if (!this.importPreview[index].Gender?.trim()) {
                    this.importPreview[index].Error = 'Gender is required.';
                    isValid = false;
                }
                else if (!this.genderOptions.some(gender => gender.value?.toLowerCase() === this.importPreview[index].Gender?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Invalid gender.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'MobileNo':
                if (!this.importPreview[index].MobileNo?.trim()) {
                    this.importPreview[index].Error = 'Mobile number is required.';
                    isValid = false;
                }
                else if (!/^[6-9]\d{9}$/.test(this.importPreview[index].MobileNo?.trim())) {
                    this.importPreview[index].Error = 'Invalid mobile number.';
                    isValid = false;
                }
                else if(this.users.find(x => x.MobileNo == this.importPreview[index].MobileNo?.trim()))
                {
                    this.importPreview[index].Error = 'Mobile number already exists.';
                    isValid = false;
                }
                else if (this.importPreview.find((x, idx) => x.MobileNo?.trim() === this.importPreview[index].MobileNo?.trim() && idx !== index)) 
                {
                    this.importPreview[index].Error = 'Duplicate Mobile number exists.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'MailId':
                if (!this.importPreview[index].MailId?.trim()) {
                    this.importPreview[index].Error = 'Email is required.';
                    isValid = false;
                }
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.importPreview[index].MailId?.trim())) {
                    this.importPreview[index].Error = 'Invalid email.';
                    isValid = false;
                }
                else if(this.users.find(x => x.MailId == this.importPreview[index].MailId?.trim()))
                {
                    this.importPreview[index].Error = 'Email already exists.';
                    isValid = false;
                }
                else if (this.importPreview.find((x, idx) => x.MailId?.trim() === this.importPreview[index].MailId?.trim() && idx !== index)) 
                {
                    this.importPreview[index].Error = 'Duplicate Email exists.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'DOB':
                if (!this.importPreview[index].DOB?.trim()) {
                    this.importPreview[index].Error = 'Date of birth is required.';
                    isValid = false;
                }
                else {
                    const dob = new Date(this.importPreview[index].DOB?.trim());
                    if (dob instanceof Date && !isNaN(dob.getTime())) {
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
                            age--;
                        }

                        if (age < 0 || age > 150) {
                            this.importPreview[index].Error = 'Invalid date of birth.';
                            isValid = false;
                        }
                        else {
                            this.importPreview[index].Error = '';
                        }
                    }
                    else {
                        this.importPreview[index].Error = 'Invalid date format for DOB.';
                    }
                }
                break;

            case 'Status':
                if (!this.importPreview[index].Status?.trim()) {
                    this.importPreview[index].Error = 'Access Status is required.';
                    isValid = false;
                }
                else if (!this.statusOptions.some(status => status.value?.toLowerCase() === this.importPreview[index].Status?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Invalid access status.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'IsActive':
                if (this.importPreview[index].IsActive === null) {
                    this.importPreview[index].Error = 'Status is required.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateImportUser(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('FullName', index) &&
                this.validateImportInput('RoleName', index) &&
                this.validateImportInput('Gender', index) &&
                this.validateImportInput('MobileNo', index) &&
                this.validateImportInput('MailId', index);
                // this.validateImportInput('DOB', index) &&
                // this.validateImportInput('Status', index) &&
                // this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportUser()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                UserId: item.UserId,
                FullName: item.FullName,
                Gender: item.Gender,
                DOB: null,
                MailId: item.MailId,
                MobileNo: item.MobileNo,
                ProfilePhoto: item.ProfilePhoto,
                RoleId: item.RoleId,
                RoleName: item.RoleName,
                CreatedByUserId: item.CreatedByUserId,
                CreatedByUserName: item.CreatedByUserName,
                IsActive: item.IsActive,
                Status: item.Status,
            };
        });
        this.userService.addMultipleUserDetails(payload).subscribe({
            next: (res: any[]) => {
                // 1. Ensure the response is a valid array, otherwise default to empty
                const responseArray = Array.isArray(res) ? res : [];

                // 2. Filter successes and failures from the array
                const successes = responseArray.filter(item => item && item.Status);
                const failures = responseArray.filter(item => !item || !item.Status);

                // 3. Handle the toast messages based on the array results
                if (responseArray.length === 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Users - Failed',
                        detail: 'No response data received from the server.'
                    });
                }
                else if (responseArray.length === failures.length) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Users - Failed',
                        detail: 'No response data received from the server.'
                    });
                }
                else if (failures.length > 0) {
                    // Get error messages, skipping empty ones
                    const errorMessages = failures
                        .map(f => f?.Message)
                        .filter(msg => msg)
                        .join(', ');

                    this.messageService.add({
                        severity: 'error',
                        summary: `Import Partially Failed (${failures.length} failed)`,
                        detail: errorMessages || 'Some users failed to import. Please try again.'
                    });
                }
                else if (successes.length > 0) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Users - Success',
                        detail: `${successes.length} user(s) imported successfully.`
                    });
                }
                 
                

                // 5. Refresh view and close dialog
                this.loadUserDetails();
                this.importDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Users - Failed',
                    detail: 'Failed to import users. Please try again.'
                });
            }
        });

    }

    onSelectionChange() {
        this.selectedIds = this.selectedUserDetails
            .map(x => x.UserId)
            .filter((id): id is number => id !== null && id !== undefined);

        console.log('Selected IDs:', this.selectedIds);
    }

    printBarcode() {
        if (this.selectedIds != null && this.selectedIds.length > 0) {
            this.printUserDialogVisible = true;
        }
    }

    checkInBook(_user: UserDetails): void {
        if (_user.BorrowedBooksCount == 1) {
            this.getBookCirculartionByUserId(_user.UserId ?? 0);
        }
        else {
            this.currentUser = { ..._user };
            this.checkInDialogVisible = true;
        }
    }

    checkOutBook(_user: UserDetails): void {
        this.bc = {
            BookCirculationId: 0, BookId: 0, BookName: '', BorrowerId: _user.UserId, BorrowerName: _user.FullName,
            IssuedByUserId: this.loggedInUserDetails.UserId, IssuedByUserName: this.loggedInUserDetails.FullName,
            IssuedDate: this.todayDate, IssuedByUserMailId: this.loggedInUserDetails.MailId, OverDueId: 0, FineAmount: 0.0,
            OverDueFrom: null, OverDueDays: 0, OverDueStatus: '', SytemUpdatedDate: null, ReturnByUserId: 0,
            ReturnByUserName: '', ReturnDate: null, Comments: '', Status: 'Issued', UpdatedByUserId: 0,
            UpdatedByUserName: '', UpdatedDate: null, PaidAmount: 0, PaymentTypeId: 0
        };

        this.type = "CheckOut";
        this.bcDialogVisible = true;
    }

    getBookCirculartionByUserId(_userId: number): void {
        this._bcService.getBookCirculationDetailsByUserId(_userId).subscribe({
            next: (data: BookCirculationDetails[]) => {
                this.bc = data.find(x => x.Status == "Issued" && x.BorrowerId == _userId) ?? null;

                this.type = "CheckIn";
                this.bcDialogVisible = true;
            },
            error: (err) => {
                console.error('Error loading book circulation by BookId:', err);
            }
        });
    }

    parseCustomDateStringForUI(dateStr: Date): string {
        // 2. Pad single digits with leading zeros
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = dateStr.getFullYear();

        // 3. Assemble into the exact "yyyy-mm-dd" layout match        
        return `${year}-${month}-${day}`;
    }

    validateNumberInput(event: KeyboardEvent, allowedKeys : string[]): void {    
    const isNumber = event.key >= '0' && event.key <= '9';

    // If it's not a number and not in our allowed keys list, block the input
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
    }

    printTable(): void {
    window.print();
    }
}
