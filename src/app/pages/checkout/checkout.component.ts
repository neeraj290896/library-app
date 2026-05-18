import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { BooksOverdueComponent } from './books-overdue/books-overdue.component';
import { ManageBookCirculationComponent } from './manage-book-circulation/manage-book-circulation.component';
import { ManageIssuedBooksComponent } from './manage-issued-books/manage-issued-books.component';
import { ManageReturnedBooksComponent } from './manage-returned-books/manage-returned-books.component';
import { TabViewModule } from 'primeng/tabview';
import { BookDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CalendarModule,  TabViewModule,  
        BooksOverdueComponent, ManageBookCirculationComponent,
        ManageIssuedBooksComponent, ManageReturnedBooksComponent
    ],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
     searchTerm = '';
    activeTab = 0;

    // Mock data
    allBooks = signal<BookDetails[]>([
    //     { sno: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', status: 'Available' },
    //     { sno: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'J.B. Lippincott & Co.', status: 'Borrowed' },
    //     { sno: 3, title: '1984', author: 'George Orwell', publisher: 'Secker & Warburg', status: 'Available' },
    //     { sno: 4, title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'T. Egerton', status: 'Available' },
    //     { sno: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Little, Brown', status: 'Reserved' },
    //     { sno: 6, title: 'Animal Farm', author: 'George Orwell', publisher: 'Secker & Warburg', status: 'Available' },
    //     { sno: 7, title: 'The Hobbit', author: 'J.R.R. Tolkien', publisher: 'Allen & Unwin', status: 'Borrowed' },
    //     { sno: 8, title: 'Brave New World', author: 'Aldous Huxley', publisher: 'Chatto & Windus', status: 'Available' },
    ]);

    filteredBooks = computed(() => {
        const books = this.allBooks();
        const term = this.searchTerm.toLowerCase();

        // return books.filter(book =>
            // book.BookName.toLowerCase().includes(term) ||
            // book.BookBarcode.toLowerCase().includes(term) ||
            // book.publisher.toLowerCase().includes(term)
        // );
        return null;
    });

    totalBooks = computed(() => this.filteredBooks().length);

    setFilter(tabIndex: number) {
        this.activeTab = tabIndex;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }

    
}
