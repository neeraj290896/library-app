import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionTypeDetails } from '@app/shared/models/api.models';
import { TransactionTypeService } from '@app/shared/services/transactiontype.service';
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
  selector: 'app-manage-transactiontype',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-transactiontype.component.html',
  styleUrl: './manage-transactiontype.component.scss'
})
export class ManageTransactiontypeComponent {
     private messageService = inject(MessageService);
    private transactionTypeService = inject(TransactionTypeService);
@ViewChild('dt') dataTable: Table | undefined;

    public transactionTypes: TransactionTypeDetails[] = [];
    public showFt: boolean = false;
    public transactionTypeNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedTransactionTypeNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public transactionTypeDialogVisible = false;
    public header: string = '';
    public currentTransactionType: TransactionTypeDetails = { TypeId: 0, TypeName: '', IsActive: true };
    public errors: { TypeName: string, IsActive: string } = { 
        TypeName: '', 
        IsActive: '' 
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    ngOnInit(): void {
        this.loadTransactionTypeDetails();
    }

    loadTransactionTypeDetails(): void {
        this.transactionTypeService.getTransactionTypeDetails().subscribe({
            next: (data: TransactionTypeDetails[]) => {
                this.transactionTypes = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading transactionTypes:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.transactionTypeNameList = [...new Set(this.transactionTypes.map(transactionType => transactionType.TypeName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.transactionTypes.map(transactionType => transactionType.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedTransactionTypeNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

     editTransactionType(TransactionType: TransactionTypeDetails | null = null): void {
            if (TransactionType) {
                this.currentTransactionType = { ...TransactionType };
                this.header = 'Edit TransactionType';
            } 
            else {
                this.currentTransactionType = { TypeId: 0, TypeName: '', IsActive: true };
                this.header = 'Add TransactionType';
            }
            this.errors = { TypeName: '', IsActive: '' };
            this.transactionTypeDialogVisible = true;
        }
    
        validateInput(key: string): boolean {
            let isValid = true;
    
            switch (key) {
                case 'TransactionTypeName':
                    if (!this.currentTransactionType.TypeName?.trim()) {
                        this.errors.TypeName = 'TransactionType name is required.';
                        isValid = false;
                    } else {
                        this.errors.TypeName = '';
                    }
                    break;
    
                case 'IsActive':
                    if (this.currentTransactionType.IsActive === null) {
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
    
        validateTransactionType(): boolean {
            const isNameValid = this.validateInput('TypeName');
            const isStatusValid = this.validateInput('IsActive');
            return isNameValid && isStatusValid;
        }
    
        saveTransactionType(): void {
            if (!this.validateTransactionType()) {
                return;
            }
    
            // const payload = [this.currentTransactionType];
            this.transactionTypeService.updateTransactionTypeDetails(this.currentTransactionType).subscribe({
                next: (res: any) => {
                    if (!res || !res.Status) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Manage TransactionType - Failed',
                            detail: res ? res.Message : 'Failed to update TransactionType. Please try again.'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Manage TransactionType - Success',
                            detail: 'TransactionType updated successfully.'
                        });
                    }
    
                    this.loadTransactionTypeDetails();
                    this.transactionTypeDialogVisible = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage TransactionType - Failed',
                        detail: 'Failed to update TransactionType. Please try again.'
                    });
                }
            });
        }

    deleteTransactionType(transactionType: TransactionTypeDetails): void { }
}