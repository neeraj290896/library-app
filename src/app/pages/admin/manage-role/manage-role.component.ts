import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleDetails } from '@app/shared/models/api.models';
import { RoleService } from '@app/shared/services/role.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-role',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
  templateUrl: './manage-role.component.html',
  styleUrl: './manage-role.component.scss'
})
export class ManageRoleComponent {
 @ViewChild('dt') dataTable: Table | undefined;

    public roles: RoleDetails[] = [];
    public showFt: boolean = false;
    public roleNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedRoleNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private roleService: RoleService) { }

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
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
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

    editRole(role: RoleDetails): void { }

    deleteRole(role: RoleDetails): void { }
}