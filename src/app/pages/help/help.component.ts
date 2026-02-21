import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  faqs = signal([
    { id: 1, question: 'How do I add a new book?', answer: 'Go to the "Add Books" section and fill in the book details including title, author, ISBN, and quantity.', expanded: false },
    { id: 2, question: 'How do I checkout a book for a member?', answer: 'Navigate to "Check-out Books" section, enter the member ID, book ISBN, and set the return date.', expanded: false },
    { id: 3, question: 'What are the late fees for overdue books?', answer: 'Late fees are typically $1 per day. Check with your librarian for specific terms.', expanded: false },
    { id: 4, question: 'How do I manage staff members?', answer: 'As a librarian, go to the "Staff" section to add, edit, or remove staff members.', expanded: false },
    { id: 5, question: 'How do I view library statistics?', answer: 'The Dashboard shows real-time statistics on borrowed books, returns, and member information.', expanded: false },
    { id: 6, question: 'How do I reset my password?', answer: 'Go to Settings > Danger Zone > Reset Password to change your password.', expanded: false },
  ]);

  toggleFAQ(faq: any): void {
    faq.expanded = !faq.expanded;
  }
}

