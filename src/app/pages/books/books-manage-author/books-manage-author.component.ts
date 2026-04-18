import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { AuthorService } from '@services/author.service';
import { AuthorDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-manage-author',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-manage-author.component.html',
    styleUrl: './books-manage-author.component.scss'
})
export class BooksManageAuthorComponent implements OnInit {
    @ViewChild('dt') dataTable: Table | undefined;

    public authors: AuthorDetails[] = [];
    public showFt: boolean = false;
    public authorNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private authorService: AuthorService) { }

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
        this.statusList = [...new Set(this.authors.map(author => author.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
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

    editAuthor(author: AuthorDetails): void { }

    deleteAuthor(author: AuthorDetails): void { }
}
