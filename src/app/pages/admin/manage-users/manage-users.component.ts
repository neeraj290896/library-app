import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDetails } from '@app/shared/models/api.models';
import { UserService } from '@app/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent {
    private messageService = inject(MessageService);
    private userService = inject(UserService);
    @ViewChild('dt') dataTable: Table | undefined;

    public users: UserDetails[] = [];
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
    public currentUser: UserDetails = { UserId: 0, FullName: '', Gender: '', DOB: '', MailId:'', MobileNo:'', ProfilePhoto :'', 
        RoleId: 0, RoleName: '', CreatedByUserId : 0, CreatedByUserName :'', IsActive : true, Status: null };
    public errors: { FullName: string, Gender: string, DOB: string, MailId: string, MobileNo: string, RoleId : string, Status : string, 
        IsActive: string } = {         
        FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status : '', IsActive: ''};
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

  ngOnInit(): void {
      this.loadUserDetails();
  }

  loadUserDetails(): void {
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
          .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
  }

  showFilter(): void {
      this.showFt = !this.showFt;
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

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
      return isActive ? 'success' : 'danger';
  }

    editUser(_user: UserDetails | null = null): void {
            if (_user) {
                this.currentUser = { ..._user };
                this.header = 'Edit User';
            } 
            else {
                this.currentUser = { UserId: 0, FullName: '', Gender: '', DOB: '', MailId:'', MobileNo:'', ProfilePhoto :'', 
                        RoleId: 0, RoleName: '', CreatedByUserId : 0, CreatedByUserName :'', IsActive : true, Status: null };
                this.header = 'Add User';
            }
            this.errors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', Status : '', IsActive: ''};
            this.userDialogVisible = true;
    }

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
        
        case 'Gender':
            if (!this.currentUser.Gender?.trim()) {
                this.errors.Gender = 'Please select Gender.';
                isValid = false;
            } else {
                this.errors.Gender = '';
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

        case 'RoleId':
            if (!(this.currentUser.RoleId !=null  && this.currentUser.RoleId > 0)) {
                this.errors.RoleId = 'Please select RoleId.';
                isValid = false;
            } else {
                this.errors.RoleId = '';
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
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveUser(): void {
        if (!this.validateUser()) {
            return;
        }

    //   const payload = [this.currentUser];
        this.userService.updateUserDetails(this.currentUser).subscribe({
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

  deleteUser(_user: UserDetails): void { }

}
