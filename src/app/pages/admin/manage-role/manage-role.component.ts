import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleDetails } from '@app/shared/models/api.models';
import { RoleService } from '@app/shared/services/role.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-role',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule, CheckboxModule, RadioButtonModule ],
  templateUrl: './manage-role.component.html',
  styleUrl: './manage-role.component.scss'
})
export class ManageRoleComponent {
    private messageService = inject(MessageService);
    private roleService = inject(RoleService);
 @ViewChild('dt') dataTable: Table | undefined;

    public roles: RoleDetails[] = [];
    public showFt: boolean = false;
    public roleNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedRoleNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public roleDialogVisible = false;
    public header: string = '';
    public currentRole: RoleDetails = { RoleId: 0, RoleName: '', IsActive: true, UserCanLogin : false, UserHasEditAccess : false };
    public errors: { RoleName: string, IsActive: string, UserHasEditAccess: boolean, UserCanLogin: boolean } = { 
        RoleName: '', 
        IsActive: '' ,
        UserHasEditAccess: false,
        UserCanLogin: false

    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];
   

    ngOnInit(): void {
        this.loadRoleDetails();
    }

    loadRoleDetails(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[]) => {
                this.roles = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading roles:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.roleNameList = [...new Set(this.roles.map(role => role.RoleName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.roles.map(role => role.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedRoleNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editRole(role: RoleDetails | null = null): void {
            if (role) {
                this.currentRole = { ...role };
                this.header = 'Edit Role';
            } 
            else {
                this.currentRole = { RoleId: 0, RoleName: '', IsActive: true, UserCanLogin : false, UserHasEditAccess : false };
                this.header = 'Add Role';
            }
            this.errors = { RoleName: '', IsActive: '', UserHasEditAccess : false, UserCanLogin: false };            
            this.roleDialogVisible = true;
    }

     validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
           case 'RoleName': 
                const trimmedRoleName = this.currentRole.RoleName?.trim() ?? '';
                const isDuplicate = this.roles.some(
                    x => x.RoleId !== this.currentRole.RoleId &&
                        x.RoleName?.trim().toLowerCase() === trimmedRoleName.toLowerCase()
                );

                if (!trimmedRoleName) {
                    this.errors.RoleName = 'Role name is required.';
                    isValid = false;
                } else if (isDuplicate) {
                    this.errors.RoleName = `The "${trimmedRoleName}" role name already exists.`;
                    isValid = false;
                } else {
                    this.errors.RoleName = '';
                }
                break;            

            case 'IsActive':
                if (this.currentRole.IsActive === null) {
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

    validateRole(): boolean {
        const isNameValid = this.validateInput('RoleName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveRole(): void {
        if (!this.validateRole()) {
            return;
        }

        //  var payload = [this.currentRole];

        if(this.currentRole.RoleId >0)
        {
            this.roleService.updateRoleDetails(this.currentRole).subscribe({
                next: (res: any) => {
                    if (!res || !res.Status) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Manage Role - Failed',
                            detail: res ? res.Message : 'Failed to update Role. Please try again.'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Manage Role - Success',
                            detail: 'Role updated successfully.'
                        });
                        this.loadRoleDetails();
                        this.roleDialogVisible = false;
                    }

                    
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Role - Failed',
                        detail: 'Failed to update Role. Please try again.'
                    });
                }
            });
        }
        else
        {
            this.roleService.addRoleDetails(this.currentRole).subscribe({
                next: (res: any) => {
                    if (!res || !res.Status) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Manage Role - Failed',
                            detail: res ? res.Message : 'Failed to add new Role. Please try again.'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Manage Role - Success',
                            detail: 'Role inserted successfully.'
                        });

                         this.loadRoleDetails();
                        this.roleDialogVisible = false;

                    }

                   
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Role - Failed',
                        detail: 'Failed to insert Role. Please try again.'
                    });
                }
            });
        }

       
    }


    deleteRole(role: RoleDetails): void {

        role.IsActive = false;

        this.roleService.deleteRoleDetails(role).subscribe({
                next: (res: any) => {
                    if (!res || !res.Status) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Manage Role - Failed',
                            detail: res ? res.Message : 'Failed to delete Role. Please try again.'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Manage Role - Success',
                            detail: 'Role deleted successfully.'
                        });

                        this.loadRoleDetails();                    
                    }

                    
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Role - Failed',
                        detail: 'Failed to delete Role. Please try again.'
                    });
                }
            });
     }
}