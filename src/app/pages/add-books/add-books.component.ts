import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-add-books',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './add-books.component.html',
  styleUrl: './add-books.component.css'
})
export class AddBooksComponent {
  formData = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    quantity: '',
    category: '',
    description: ''
  };

  handleSubmit(e: Event): void {
    e.preventDefault();
    console.log('Book added:', this.formData);
    // Reset form
    this.formData = {
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      quantity: '',
      category: '',
      description: ''
    };
  }
}
