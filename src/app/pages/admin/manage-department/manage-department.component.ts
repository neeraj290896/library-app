import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentDetails } from '@app/shared/models/api.models';
import { DepartmentService } from '@app/shared/services/department.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-department',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
  templateUrl: './manage-department.component.html',
  styleUrl: './manage-department.component.scss'
})
export class ManageDepartmentComponent {
@ViewChild('dt') dataTable: Table | undefined;

    public departments: DepartmentDetails[] = [];
    public showFt: boolean = false;
    public departmentNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedDepartmentNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private departmentService: DepartmentService) { }

    ngOnInit(): void {
        this.loaddepartments();
    }

    loaddepartments(): void {
        this.departmentService.getDepartmentDetails().subscribe({
            next: (data: DepartmentDetails[]) => {
                this.departments = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading departments:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.departmentNameList = [...new Set(this.departments.map(department => department.DepartmentName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.departments.map(department => department.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedDepartmentNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editDepartment(department: DepartmentDetails): void { }

    deleteDepartment(department: DepartmentDetails): void { }
}
