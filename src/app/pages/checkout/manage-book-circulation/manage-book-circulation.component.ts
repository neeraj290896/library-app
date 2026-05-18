import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookDetails } from '@app/shared/models/api.models';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-book-circulation',
  imports: [ CommonModule, TagModule, TableModule, ButtonModule,
        FormsModule, PaginatorModule, MultiSelectModule,
        InputTextModule,],
  templateUrl: './manage-book-circulation.component.html',
  styleUrl: './manage-book-circulation.component.scss'
})
export class ManageBookCirculationComponent {
  searchBookTerm = '';
  searchUserTerm = '';
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
  public books: BookDetails[] = [];

    ngOnInit(): void {
        this.initializeFilterLists();
    }


  onBookSearch(term: string) {
      this.searchBookTerm = term;
  }

  onUserSearch(term: string) {
      this.searchUserTerm = term;
  }
    initializeFilterLists(): void {
        // this.titleList = [...new Set(this.books.map(book => book.title))].map(e => ({ label: e, value: e }));
        // this.authorList = [...new Set(this.books.map(book => book.author))].map(e => ({ label: e, value: e }));
        // this.publisherList = [...new Set(this.books.map(book => book.publisher))].map(e => ({ label: e, value: e }));
        // this.statusList = [...new Set(this.books.map(book => book.status))].map(e => ({ label: e, value: e }));
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
