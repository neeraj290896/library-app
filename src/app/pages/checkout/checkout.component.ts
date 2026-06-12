import { Component, inject } from '@angular/core';
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
import { OverDueDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';
import { OverDueService } from '@services/overdue.service';

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
    private messageService = inject(MessageService);
    private _overDueService = inject(OverDueService);
    searchTerm = '';
    activeTab = 0;
    overDueCount = 0;
    overDues: OverDueDetails[] = [];

    ngOnInit(): void {
        this.loadOverDueDetails();
    }
    
    loadOverDueDetails(): void {
        this._overDueService.getOverDueDetails().subscribe({
            next: (data: OverDueDetails[]) => {
                this.overDues = data.filter(x => x.OverDueStatus == 'Pending');
                this.overDueCount = this.overDues.length;                
            },
            error: (err) => {
                console.error('Error loading overDue:', err);
            }
        });
    }  
   

    setFilter(tabIndex: number) {
        this.activeTab = tabIndex;
    }

    onSearch(term: string) {
        this.searchTerm = term;
    }

    
}
