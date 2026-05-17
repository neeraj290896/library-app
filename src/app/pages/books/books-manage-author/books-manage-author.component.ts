import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AuthorService } from '@services/author.service';
import { AuthorDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-books-manage-author',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, 
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
        SelectModule, FormsModule, TooltipModule],
    templateUrl: './books-manage-author.component.html',
    styleUrl: './books-manage-author.component.scss'
})
export class BooksManageAuthorComponent implements OnInit {
    private messageService = inject(MessageService);
    private authorService = inject(AuthorService);

    @ViewChild('dt') dataTable: Table | undefined;

    public authors: AuthorDetails[] = [];
    public showFt: boolean = false;
    public authorNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public authorDialogVisible = false;
    public header: string = '';
    public currentAuthor: AuthorDetails = { AuthorId: 0, AuthorName: '', IsActive: null };
    public errors: { AuthorName: string, IsActive: string } = { 
        AuthorName: '', 
        IsActive: '' 
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    ngOnInit(): void {
        this.loadAuthors();
    }

    loadAuthors(): void {
        this.authorService.getAuthorDetails().subscribe({
            next: (data: AuthorDetails[]) => {
                this.authors = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading authors:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.authorNameList = [...new Set(this.authors.map(author => author.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.authors.map(author => author.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedAuthorNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editAuthor(author: AuthorDetails | null = null): void {
        if (author) {
            this.currentAuthor = { ...author };
            this.header = 'Edit Author';
        } 
        else {
            this.currentAuthor = { AuthorId: 0, AuthorName: '', IsActive: null };
            this.header = 'Add Author';
        }
        this.errors = { AuthorName: '', IsActive: '' };
        this.authorDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'AuthorName':
                if (!this.currentAuthor.AuthorName?.trim()) {
                    this.errors.AuthorName = 'Author name is required.';
                    isValid = false;
                } else {
                    this.errors.AuthorName = '';
                }
                break;

            case 'IsActive':
                if (this.currentAuthor.IsActive === null) {
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

    validateAuthor(): boolean {
        const isNameValid = this.validateInput('AuthorName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveAuthor(): void {
        if (!this.validateAuthor()) {
            return;
        }

        const payload = [this.currentAuthor];
        this.authorService.updateAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Author - Failed',
                        detail: res ? res.Message : 'Failed to update author. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Author - Success',
                        detail: 'Author updated successfully.'
                    });
                }

                this.loadAuthors();
                this.authorDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Author - Failed',
                    detail: 'Failed to update author. Please try again.'
                });
            }
        });
    }

    deleteAuthor(author: AuthorDetails): void {
        const payload = [author];
        this.authorService.deleteAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Author - Failed',
                        detail: res ? res.Message : 'Failed to delete author. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Author - Success',
                        detail: 'Author deleted successfully.'
                    });
                }

                this.loadAuthors();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Author - Failed',
                    detail: 'Failed to delete author. Please try again.'
                });
            }
        });
    }
}
