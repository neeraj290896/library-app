import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentDetails } from '@app/shared/models/api.models';
import { DepartmentService } from '@app/shared/services/department.service';
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
  selector: 'app-manage-department',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-department.component.html',
  styleUrl: './manage-department.component.scss'
})
export class ManageDepartmentComponent {
private messageService = inject(MessageService);
    private departmentService = inject(DepartmentService);


@ViewChild('dt') dataTable: Table | undefined;

    public departments: DepartmentDetails[] = [];
    public showFt: boolean = false;
    public departmentNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedDepartmentNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public departmentDialogVisible = false;
    public header: string = '';
    public currentDepartment: DepartmentDetails = { DepartmentId: 0, DepartmentName: '', IsActive: true };
    public errors: { DepartmentName: string, IsActive: string } = { 
        DepartmentName: '', 
        IsActive: '' 
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];    

    ngOnInit(): void {
        this.loadDepartmentDetails()
    }

    loadDepartmentDetails(): void {
        this.departmentService.getDepartmentDetails().subscribe({
            next: (data: DepartmentDetails[]) => {
                this.departments = data;
                this.initializeFilterLists();
            },
            error: (err :any) => {
                console.error('Error loading departments:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.departmentNameList = [...new Set(this.departments.map(department => department.DepartmentName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.departments.map(department => department.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
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

    editDepartment(department: DepartmentDetails | null = null): void {
        if (department) {
            this.currentDepartment = { ...department };
            this.header = 'Edit department';
        } 
        else {
            this.currentDepartment = { DepartmentId: 0, DepartmentName: '', IsActive: true };
            this.header = 'Add department';
        }
        this.errors = { DepartmentName: '', IsActive: '' };
        this.departmentDialogVisible = true;
    }
    
    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'DepartmentName':
                if (!this.currentDepartment.DepartmentName?.trim()) {
                    this.errors.DepartmentName = 'Department name is required.';
                    isValid = false;
                } else {
                    this.errors.DepartmentName = '';
                }
                break;

            case 'IsActive':
                if (this.currentDepartment.IsActive === null) {
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

    validatedepartment(): boolean {
        const isNameValid = this.validateInput('DepartmentName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveDepartment(): void {
        if (!this.validatedepartment()) {
            return;
        }

        const payload = [this.currentDepartment];
        this.departmentService.updateDepartmentDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Department - Failed',
                        detail: res ? res.Message : 'Failed to update department. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Department - Success',
                        detail: 'Department updated successfully.'
                    });

                     this.loadDepartmentDetails();
                    this.departmentDialogVisible = false;

                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage department - Failed',
                    detail: 'Failed to update department. Please try again.'
                });
            }
        });
    }

    deleteDepartment(department: DepartmentDetails): void { 

        department.IsActive = false;

        const payload = [department];

        this.departmentService.deleteDepartmentDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Department - Failed',
                        detail: res ? res.Message : 'Failed to delete department. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Department - Success',
                        detail: 'Department deleted successfully.'
                    });

                     this.loadDepartmentDetails();
                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage department - Failed',
                    detail: 'Failed to delete department. Please try again.'
                });
            }
        });
    }
}
