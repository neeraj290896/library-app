import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

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
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, TagModule, PaginatorModule],
    templateUrl: './books.component.html',
    styleUrl: './books.component.scss'
})
export class BooksComponent {
    searchTerm = '';
    activeFilter = 'overview';

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

    setFilter(filter: string) {
        this.activeFilter = filter;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }

    editBook(book: Book) {
        console.log('Edit book:', book);
    }

    deleteBook(book: Book) {
        console.log('Delete book:', book);
    }

    getStatusSeverity(status: string): 'success' | 'warning' | 'info' {
        switch (status) {
            case 'Available': return 'success';
            case 'Borrowed': return 'warning';
            case 'Reserved': return 'info';
            default: return 'info';
        }
    }
}
