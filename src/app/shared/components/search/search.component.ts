import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { environment } from '../../../../environments/environment';
import { BookDetails, UserDetails } from '@app/shared/models/api.models';
import { BookService } from '@app/shared/services/book.service';
import { UserService } from '@app/shared/services/user.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ManageUsersComponent } from '@app/pages/admin/manage-users/manage-users.component';
import { BooksManageBooksComponent } from '@app/pages/books/books-manage-books/books-manage-books.component';

@Component({
    selector: 'app-search',
    imports: [
        InputTextModule, FormsModule, DialogModule, CommonModule,
        BooksManageBooksComponent, ManageUsersComponent
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss'
})
export class SearchComponent {
    public searchTerm: string = '';

    public showBookDialog: boolean = false;
    public showUserDialog: boolean = false;

    onSearch(): void {

        const isMobile = /^[6-9]\d{9}$/.test(this.searchTerm);
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.searchTerm);

        if (this.searchTerm.includes(environment.usersBarcodeSyntax)) {
            this.showUserDialog = true;
            this.showBookDialog = false;
        }
        else if (this.searchTerm.includes(environment.booksBarcodeSyntax)) {
            this.showBookDialog = true;
            this.showUserDialog = false;
        }
        else if(isMobile || isEmail)
        {
            this.showUserDialog = true;
            this.showBookDialog = false;
        }       
        else {
            this.showBookDialog = false;
            this.showUserDialog = false;
        }
    }

    onDialogClose(): void {
        this.searchTerm = '';
        this.showBookDialog = false;
        this.showUserDialog = false;
    }
}
