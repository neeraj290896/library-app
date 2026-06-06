import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { DashboardService } from '@app/shared/services/dashboard.service';
import { DashboardSummaryDetails, OverDueDetails } from '@app/shared/models/api.models';
import { OverDueService } from '@app/shared/services/overdue.service';
import { BooksOverdueComponent } from '../checkout/books-overdue/books-overdue.component';
import { BooksManageBooksComponent } from '../books/books-manage-books/books-manage-books.component';
import { ManageIssuedBooksComponent } from '../checkout/manage-issued-books/manage-issued-books.component';
import { ManageUsersComponent } from '../admin/manage-users/manage-users.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule, FormsModule, InputTextModule,
        PaginatorModule, DialogModule, BooksOverdueComponent, BooksManageBooksComponent, 
        ManageIssuedBooksComponent, ManageUsersComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private overDueService = inject(OverDueService);

    public currentDate: Date = new Date();
    public searchTerm: string = '';
    public activeFilter: string = 'overdue';

    public booksManageDialogVisible: boolean = false;
    public issuedBooksDialogVisible: boolean = false;
    public overdueDialogVisible: boolean = false;
    public usersDialogVisible: boolean = false;

    public dashboardSummary: { label: string; total: number; active: number }[] = [
        { label: 'Total Books', total: 0, active: 0 },
        { label: 'Borrowed Books', total: 0, active: 0 },
        { label: 'Overdue Books', total: 0, active: 0 },
        { label: 'Total Users', total: 0, active: 0 }
    ];
    public overDues: OverDueDetails[] = [];

    ngOnInit(): void {
        this.loadDashboardSummary();
        this.loadOverDueDetails();
    }

    loadDashboardSummary(): void {
        this.dashboardService.getDashboardSummary().subscribe({
            next: (data: DashboardSummaryDetails[]) => {
                if (data && data.length > 0) {
                    this.dashboardSummary = [
                        { label: 'Total Books', total: data[0].TotalBooks || 0, active: data[0].TotalActiveBooks || 0 },
                        { label: 'Borrowed Books', total: data[0].TotalBorrowedBooks || 0, active: data[0].ActiveBorrowedBooks || 0 },
                        { label: 'Overdue Books', total: data[0].TotalOverDue || 0, active: data[0].ActiveOverDue || 0 },
                        { label: 'Total Users', total: data[0].TotalUsers || 0, active: data[0].ActiveUsers || 0 }
                    ];
                }
            },
            error: (err) => {
                console.error('Error loading dashboard summary:', err);
            }
        });
    }

    loadOverDueDetails(): void {
        this.overDueService.getOverDueDetails().subscribe({
            next: (data: OverDueDetails[]) => {
                this.overDues = data;
            },
            error: (err) => {
                console.error('Error loading overDue :', err);
            }
        });
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }

    openSummaryDetails(label: string) {
        switch (label) {
            case 'Total Books':
                this.booksManageDialogVisible = true;
                break;
            case 'Borrowed Books':
                this.issuedBooksDialogVisible = true;
                break;
            case 'Overdue Books':
                this.overdueDialogVisible = true;
                break;
            case 'Total Users':
                this.usersDialogVisible = true;
                break;
        }
    }
}
