import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule, FormsModule, InputTextModule, PaginatorModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    private bookService = inject(BookService);

    currentDate = new Date();
    searchTerm = '';
    activeFilter = 'overview';

    statsData = signal([
        { label: 'Total Books', value: '32345', change: '+11%', trend: 'up' },
        { label: 'Borrowed Books', value: '2405', change: '+23%', trend: 'up' },
        { label: 'Overdue Books', value: '45', change: '+11%', trend: 'up' },
        { label: 'Total Users', value: '34', change: '-10%', trend: 'down' }
    ]);

    chartData = signal<any[]>([]);
    overdueHistory = signal<any[]>([]);
    recentCheckouts = signal<any[]>([]);
    topBooks = signal<any[]>([]);

    constructor() {
        effect(() => {
            this.overdueHistory.set(this.bookService.getOverdueBooks());
        });
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }
}
