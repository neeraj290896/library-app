import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooksOverdueComponent } from './books-overdue/books-overdue.component';
import { ManageBookCirculationComponent } from './manage-book-circulation/manage-book-circulation.component';
import { ManageIssuedBooksComponent } from './manage-issued-books/manage-issued-books.component';
import { ManageReturnedBooksComponent } from './manage-returned-books/manage-returned-books.component';
import { TabViewModule } from 'primeng/tabview';
import { OverDueDetails } from '@app/shared/models/api.models';
import { OverDueService } from '@services/overdue.service';
import { SearchComponent } from '@app/shared/components/search/search.component';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TabViewModule,
        BooksOverdueComponent, ManageBookCirculationComponent,
        ManageIssuedBooksComponent, ManageReturnedBooksComponent, SearchComponent
    ],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
    private _overDueService = inject(OverDueService);
    public activeTab: number = 0;
    public overDueCount: number = 0;
    public overDues: OverDueDetails[] = [];

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
}
