import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationDetails } from '@app/shared/models/api.models';
import { OrganizationService } from '@app/shared/services/organization.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-organization',
 imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
  templateUrl: './manage-organization.component.html',
  styleUrl: './manage-organization.component.scss'
})
export class ManageOrganizationComponent {
@ViewChild('dt') dataTable: Table | undefined;

    public organizations: OrganizationDetails[] = [];
    public showFt: boolean = false;
    public organizationNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedOrganizationNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private organizationService: OrganizationService) { }

    ngOnInit(): void {
        this.loadorganizations();
    }

    loadorganizations(): void {
        this.organizationService.getOrganizationDetails().subscribe({
            next: (data: OrganizationDetails[]) => {
                this.organizations = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading organizations:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.organizationNameList = [...new Set(this.organizations.map(organization => organization.OrganizationName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.organizations.map(organization => organization.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedOrganizationNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editOrganization(organization: OrganizationDetails): void { }

    deleteOrganization(organization: OrganizationDetails): void { }
}