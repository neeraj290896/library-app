import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { BooksManageBooksComponent } from './books-manage-books/books-manage-books.component';
import { BooksManageAuthorComponent } from './books-manage-author/books-manage-author.component';
import { BooksManagePublisherComponent } from './books-manage-publisher/books-manage-publisher.component';
import { BooksManageCategoryComponent } from './books-manage-category/books-manage-category.component';
import { BooksManageLanguageComponent } from './books-manage-language/books-manage-language.component';

interface Book {
    sno: number;
    title: string;
    author: string;
    publisher: string;
    status: 'Available' | 'Borrowed' | 'Reserved';
}

@Component({
    selector: 'app-books',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        TabViewModule,        
        BooksManageBooksComponent,
        BooksManageAuthorComponent,
        BooksManagePublisherComponent,
        BooksManageCategoryComponent,
        BooksManageLanguageComponent
    ],
    templateUrl: './books.component.html',
    styleUrl: './books.component.scss'
})
export class BooksComponent {
    searchTerm = '';
    activeTab = 0;

    setFilter(tabIndex: number) {
        this.activeTab = tabIndex;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }
}
