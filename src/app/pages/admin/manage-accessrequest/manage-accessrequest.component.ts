import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccessRequestDetails } from '@app/shared/models/api.models';
import { AdminService } from '@app/shared/services/admin.service';
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
  selector: 'app-manage-accessrequest',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-accessrequest.component.html',
  styleUrl: './manage-accessrequest.component.scss'
})
export class ManageAccessrequestComponent {
private messageService = inject(MessageService);
    private accessRequestService = inject(AdminService);
    @ViewChild('dt') dataTable: Table | undefined;

     public all_AccessRequests: AccessRequestDetails[] = [];
    public accessRequests: AccessRequestDetails[] = [];
    public showFt: boolean = false;
    public userNameList: { label: string, value: string }[] = [];
    public roleList: { label: string, value: string }[] = [];
    public mobileNoList: { label: string, value: string }[] = [];
    public mailIdList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: string }[] = [];
    public selectedUserNameList: string[] = [];
    public selectedRoleList: string[] = [];
    public selectedMobileNoList: string[] = [];
    public selectedMailIdList: string[] = [];   
    public selectedStatusList: boolean[] = [];
   
    public header: string = '';
    public currentAR: AccessRequestDetails = { UserId: 0, RoleId: 0, RoleName: '',  FullName: '', MobileNo:'', MailId:'', 
        Status: null, CreatedDate: '' };    
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

  ngOnInit(): void {
      this.loadAccessRequestDetails();
  }

  loadAccessRequestDetails(): void {
          this.accessRequestService.getAccessRequestDetails().subscribe({
              next: (data: AccessRequestDetails[]) => {
                  this.all_AccessRequests = data;

                  if(data !=null && data.length >0)
                  {
                    this.accessRequests = data.filter(x => x.Status == "Pending");
                  }

                  this.initializeFilterLists();
              },
              error: (err) => {
                  console.error('Error loading Access Request details:', err);
              }
          });
      }
  
  initializeFilterLists(): void {
      this.userNameList = [...new Set(this.accessRequests.map(user => user.FullName))]
          .map(e => ({ label: e!, value: e! }));
      this.roleList = [...new Set(this.accessRequests.map(user => user.RoleName))]
          .map(e => ({ label: e!, value: e! }));      
      this.mailIdList = [...new Set(this.accessRequests.map(user => user.MailId))]
          .map(e => ({ label: e!, value: e! }));
      this.mobileNoList = [...new Set(this.accessRequests.map(user => user.MobileNo))]
          .map(e => ({ label: e!, value: e! }));
      this.statusList = [...new Set(this.accessRequests.map(user => user.Status))]
           .map(e => ({ label: e!, value: e! }));
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
      this.selectedStatusList = [];
      this.showFt = false;
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
      return status == 'Approved' ? 'success' : 'danger';
  }

  approveAccess(_accessRequest: AccessRequestDetails | null = null): void{

  }
  

  rejectAccess(_accessRequest: AccessRequestDetails | null = null): void{

  }

  

}
