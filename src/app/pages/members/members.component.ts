import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../shared/services/book.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent {
  private bookService = inject(BookService);

  members = signal(this.bookService.getMembers());
  searchTerm: string = '';

  filteredMembers = computed(() => {
    const term = this.searchTerm;
    if (!term) {
      return this.members();
    }
    return this.members().filter(member =>
      member.member.toLowerCase().includes(term.toLowerCase()) ||
      member.memberId.toLowerCase().includes(term.toLowerCase()) ||
      member.email.toLowerCase().includes(term.toLowerCase())
    );
  });

  onSearch(term: string): void {
    this.searchTerm = term;
  }
}
