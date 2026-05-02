import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionTypeDetails } from '@app/shared/models/api.models';
import { TransactionTypeService } from '@app/shared/services/transactiontype.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-transactiontype',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
  templateUrl: './manage-transactiontype.component.html',
  styleUrl: './manage-transactiontype.component.scss'
})
export class ManageTransactiontypeComponent {
@ViewChild('dt') dataTable: Table | undefined;

    public transactionTypes: TransactionTypeDetails[] = [];
    public showFt: boolean = false;
    public transactionTypeNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedTransactionTypeNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private transactionTypeService: TransactionTypeService) { }

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
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
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

    editTransactionType(transactionType: TransactionTypeDetails): void { }

    deleteTransactionType(transactionType: TransactionTypeDetails): void { }
}