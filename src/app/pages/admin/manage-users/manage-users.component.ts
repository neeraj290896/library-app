import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDetails } from '@app/shared/models/api.models';
import { UserService } from '@app/shared/services/user.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent {
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

  constructor(private userService: UserService) { }

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

  editUser(author: UserDetails): void { }

  deleteUser(author: UserDetails): void { }

}
