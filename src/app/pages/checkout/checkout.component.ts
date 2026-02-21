import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CalendarModule],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
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
