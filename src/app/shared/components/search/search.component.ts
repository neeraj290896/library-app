import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
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

    @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

    public searchTerm: string = '';

    public showBookDialog: boolean = false;
    public showUserDialog: boolean = false;

    private inactivityTimer: any;
    private readonly INACTIVITY_TIME = 3000; // 3 seconds

    ngOnInit(): void {
        this.startInactivityTimer();
    }

    // Listen to mouse movements across the document window
    @HostListener('document:mousemove')
    @HostListener('document:keydown')
    onMouseMove(): void {
        this.resetInactivityTimer();
    }

    private startInactivityTimer(): void {
        this.inactivityTimer = setTimeout(() => {
        this.focusSearchInput();
        }, this.INACTIVITY_TIME);
    }

    private resetInactivityTimer(): void {
        if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        }
        this.startInactivityTimer();
    }

    private focusSearchInput(): void {
        // Check if dialogs are open; you might want to skip focusing if a dialog is active
        if (!this.showBookDialog && !this.showUserDialog && this.searchInput) {
        this.searchInput.nativeElement.focus();
        }
    }

    onSearch(): void {

        const libraryNoPattern = /^VCN \d{1,9}$/i;
        const isMobile = /^[6-9]\d{9}$/.test(this.searchTerm);
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.searchTerm);
        const isLibraryNo = libraryNoPattern.test(this.searchTerm);
        const isAccessionNo = /^[0-9]\d{5}$/.test(this.searchTerm);
       

        if (this.searchTerm.includes(environment.usersBarcodeSyntax)) {
            this.showUserDialog = true;
            this.showBookDialog = false;
        }
        else if (this.searchTerm.includes(environment.booksBarcodeSyntax)) {
            this.showBookDialog = true;
            this.showUserDialog = false;
        }
        else if(isMobile || isEmail || isLibraryNo)
        {
            this.showUserDialog = true;
            this.showBookDialog = false;
        } 
        else if(isAccessionNo)
        {
            this.showUserDialog = false;
            this.showBookDialog = true;
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
        this.resetInactivityTimer(); // Restart timer when a dialog closes
    }

    // Prevent memory leaks when the component destroys
    ngOnDestroy(): void {
        if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        }
    }
}
