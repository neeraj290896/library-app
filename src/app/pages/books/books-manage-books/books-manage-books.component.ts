import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BookService } from '@services/book.service';
import { BookDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-manage-books',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-manage-books.component.html',
    styleUrl: './books-manage-books.component.scss'
})
export class BooksManageBooksComponent implements OnInit {
    @ViewChild('dt') dataTable: Table | undefined;

    public books: BookDetails[] = [];
    public showFt: boolean = false;
    public bookNameList: { label: string, value: string }[] = [];
    public authorNameList: { label: string, value: string }[] = [];
    public publisherNameList: { label: string, value: string }[] = [];
    public categoryNameList: { label: string, value: string }[] = [];
    public languageNameList: { label: string, value: string }[] = [];
    public publishedYearList: { label: number, value: number }[] = [];
    public statusList: { label: string, value: boolean }[] = [];

    public selectedBookNameList: string[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedPublisherNameList: string[] = [];
    public selectedCategoryNameList: string[] = [];
    public selectedLanguageNameList: string[] = [];
    public selectedPublishedYearList: number[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private bookService: BookService) { }

    ngOnInit(): void {
        this.loadBooks();
    }

    loadBooks(): void {
        this.bookService.getAllBookDetails().subscribe({
            next: (data: BookDetails[]) => {
                this.books = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading books:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.books.map(book => book.BookName))]
            .map(e => ({ label: e!, value: e! }));
        this.authorNameList = [...new Set(this.books.map(book => book.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.publisherNameList = [...new Set(this.books.map(book => book.PublisherName))]
            .map(e => ({ label: e!, value: e! }));
        this.categoryNameList = [...new Set(this.books.map(book => book.CategoryName))]
            .map(e => ({ label: e!, value: e! }));
        this.languageNameList = [...new Set(this.books.map(book => book.LanguageName))]
            .map(e => ({ label: e!, value: e! }));
        this.publishedYearList = [...new Set(this.books.map(book => book.PublishedYear))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.books.map(book => book.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedAuthorNameList = [];
        this.selectedPublisherNameList = [];
        this.selectedCategoryNameList = [];
        this.selectedLanguageNameList = [];
        this.selectedPublishedYearList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editBook(book: BookDetails): void { }

    deleteBook(book: BookDetails): void { }
}
