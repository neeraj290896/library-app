import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { BooksOverdueComponent } from './books-overdue/books-overdue.component';
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
        BooksOverdueComponent,
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

    // Mock data
    allBooks = signal<Book[]>([
        { sno: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', status: 'Available' },
        { sno: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'J.B. Lippincott & Co.', status: 'Borrowed' },
        { sno: 3, title: '1984', author: 'George Orwell', publisher: 'Secker & Warburg', status: 'Available' },
        { sno: 4, title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'T. Egerton', status: 'Available' },
        { sno: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Little, Brown', status: 'Reserved' },
        { sno: 6, title: 'Animal Farm', author: 'George Orwell', publisher: 'Secker & Warburg', status: 'Available' },
        { sno: 7, title: 'The Hobbit', author: 'J.R.R. Tolkien', publisher: 'Allen & Unwin', status: 'Borrowed' },
        { sno: 8, title: 'Brave New World', author: 'Aldous Huxley', publisher: 'Chatto & Windus', status: 'Available' },
    ]);

    filteredBooks = computed(() => {
        const books = this.allBooks();
        const term = this.searchTerm.toLowerCase();

        return books.filter(book =>
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            book.publisher.toLowerCase().includes(term)
        );
    });

    totalBooks = computed(() => this.filteredBooks().length);

    setFilter(tabIndex: number) {
        this.activeTab = tabIndex;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }
}
