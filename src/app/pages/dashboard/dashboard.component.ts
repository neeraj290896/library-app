import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../shared/services/book.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private bookService = inject(BookService);

  statsData = signal([
    { label: 'Borrowed Books', value: '2405', change: '+23%', trend: 'up' },
    { label: 'Returned Books', value: '783', change: '-14%', trend: 'down' },
    { label: 'Overdue Books', value: '45', change: '+11%', trend: 'up' },
    { label: 'Missing Books', value: '12', change: '+11%', trend: 'up' },
    { label: 'Total Books', value: '32345', change: '+11%', trend: 'up' },
    { label: 'Visitors', value: '1504', change: '+3', trend: 'up' },
    { label: 'New Members', value: '34', change: '-10%', trend: 'down' },
    { label: 'Pending Fees', value: '$765', change: '+56%', trend: 'up' },
  ]);

  chartData = signal<any[]>([]);
  overdueHistory = signal<any[]>([]);
  recentCheckouts = signal<any[]>([]);
  topBooks = signal<any[]>([]);

  constructor() {
    effect(() => {
      this.chartData.set(this.bookService.getCheckoutStatistics());
      this.overdueHistory.set(this.bookService.getOverdueBooks());
      this.recentCheckouts.set(this.bookService.getRecentCheckouts());
      this.topBooks.set(this.bookService.getTopBooks());
    });
  }
}
