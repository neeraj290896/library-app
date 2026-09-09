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

    private get isAnyDialogOpen(): boolean {
        return this.showBookDialog || this.showUserDialog || this.hasOpenPrimeDialog();
    }

    ngOnInit(): void {
        this.startInactivityTimer();
    }

    // Listen to user activity across the document window
    @HostListener('document:mousemove')
    @HostListener('document:keydown')
    @HostListener('document:mousedown')
    @HostListener('document:touchstart')
    onUserActivity(): void {
        this.resetInactivityTimer();
    }

    private startInactivityTimer(): void {
        this.clearInactivityTimer();

        if (this.isAnyDialogOpen) {
            return;
        }

        this.inactivityTimer = setTimeout(() => {
            this.focusSearchInput();
        }, this.INACTIVITY_TIME);
    }

    private resetInactivityTimer(): void {
        if (this.isAnyDialogOpen) {
            this.clearInactivityTimer();
            return;
        }

        this.startInactivityTimer();
    }

    private clearInactivityTimer(): void {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    private hasOpenPrimeDialog(): boolean {
        const dialogMasks = Array.from(document.querySelectorAll<HTMLElement>('.p-dialog-mask'));
        const hasVisibleMask = dialogMasks.some((mask) => {
            const style = mask.getAttribute('style') || '';
            const ariaHidden = mask.getAttribute('aria-hidden');
            const isHidden = style.includes('display: none') || style.includes('display:none') || ariaHidden === 'true';
            return !isHidden;
        });

        if (hasVisibleMask) {
            return true;
        }

        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('.p-dialog'));
        return dialogs.some((dialog) => {
            const style = dialog.getAttribute('style') || '';
            const ariaHidden = dialog.getAttribute('aria-hidden');
            const isHidden = style.includes('display: none') || style.includes('display:none') || ariaHidden === 'true';
            const isActive = dialog.classList.contains('p-dialog-active')
                || dialog.classList.contains('p-dialog-enter-active')
                || dialog.classList.contains('p-dialog-enter-done')
                || dialog.classList.contains('p-dialog-visible');

            return !isHidden && isActive;
        });
    }

    private focusSearchInput(): void {
        if (!this.isAnyDialogOpen && this.searchInput) {
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
            this.clearInactivityTimer();
            this.showUserDialog = true;
            this.showBookDialog = false;
        }
        else if (this.searchTerm.includes(environment.booksBarcodeSyntax)) {
            this.clearInactivityTimer();
            this.showBookDialog = true;
            this.showUserDialog = false;
        }
        else if(isMobile || isEmail || isLibraryNo)
        {
            this.clearInactivityTimer();
            this.showUserDialog = true;
            this.showBookDialog = false;
        } 
        else if(isAccessionNo)
        {
            this.clearInactivityTimer();
            this.showUserDialog = false;
            this.showBookDialog = true;
        }       
        else {
            this.showBookDialog = false;
            this.showUserDialog = false;
        }
    }

    onDialogShow(): void {
        this.clearInactivityTimer();
    }

    onDialogClose(): void {
        this.searchTerm = '';
        this.showBookDialog = false;
        this.showUserDialog = false;
        this.clearInactivityTimer();

        setTimeout(() => {
            this.startInactivityTimer();
        }, 150);
    }

    // Prevent memory leaks when the component destroys
    ngOnDestroy(): void {
        this.clearInactivityTimer();
    }
}
