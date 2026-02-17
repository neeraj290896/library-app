import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-checkout-books',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './checkout-books.component.html',
  styleUrl: './checkout-books.component.css'
})
export class CheckoutBooksComponent {
  formData = {
    memberId: '',
    isbn: '',
    returnDate: ''
  };

  handleSubmit(e: Event): void {
    e.preventDefault();
    console.log('Book checkout:', this.formData);
    // Reset form
    this.formData = {
      memberId: '',
      isbn: '',
      returnDate: ''
    };
  }
}
