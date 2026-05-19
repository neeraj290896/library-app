import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BookDetails, OverDueDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-overdue',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-overdue.component.html',
    styleUrl: './books-overdue.component.scss'
})
export class BooksOverdueComponent {
    @Input() totalOverDueCount = 0;
    @Input() totalOverDues: OverDueDetails[] = [];

    @ViewChild('dt') dataTable: Table | undefined;

    public showFt: boolean = false;
    public titleList: { label: string, value: string }[] = [];
    public authorList: { label: string, value: string }[] = [];
    public publisherList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: string }[] = [];
    public selectedTitleList: string[] = [];
    public selectedAuthorList: string[] = [];
    public selectedPublisherList: string[] = [];
    public selectedStatusList: string[] = [];

    ngOnInit(): void {
        this.initializeFilterLists();
    }

    initializeFilterLists(): void {
        // this.titleList = [...new Set(this.books.map(book => book.BookName))].map(e => ({ label: e, value: e }));
        // this.authorList = [...new Set(this.books.map(book => book.AuthorName))].map(e => ({ label: e, value: e }));
        // this.publisherList = [...new Set(this.books.map(book => book.PublisherName))].map(e => ({ label: e, value: e }));
        // this.statusList = [...new Set(this.books.map(book => book.Status))].map(e => ({ label: e, value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedTitleList = [];
        this.selectedAuthorList = [];
        this.selectedPublisherList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(status: string): 'success' | 'warning' | 'info' {
        switch (status) {
            case 'Available': return 'success';
            case 'Borrowed': return 'warning';
            case 'Reserved': return 'info';
            default: return 'info';
        }
    }

    editBook(book: BookDetails): void { }

    deleteBook(book: BookDetails): void { }
}
