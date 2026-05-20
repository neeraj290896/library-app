import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-issued-books',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, 
          PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
          SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-issued-books.component.html',
  styleUrl: './manage-issued-books.component.scss'
})
export class ManageIssuedBooksComponent {
  private messageService = inject(MessageService);
  private bcService = inject(BookCirculationService);
 @ViewChild('dt') dataTable: Table | undefined;

    public issuedBooks: BookCirculationDetails[] = [];
    public showFt: boolean = false;
    public bookNameList: { label: string, value: string }[] = [];
    public borrowerNameList: { label: string, value: string }[] = [];
    public issuedByNameList: { label: string, value: string }[] = [];
    public selectedBookNameList: string[] = [];
    public selectedBorrowerNameList: boolean[] = [];
    public selectedIssuedByNameList: boolean[] = [];
    public issuedBookDialogVisible = false;
    public header: string = '';

    public currentIssuedBook: BookCirculationDetails = 
    { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', IssuedByUserId: 0, IssuedByUserName :'',
      IssuedDate : '', OverDueId: 0, FineAmount: 0.0, OverDueFrom : '', OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'',
      ReturnByUserId: 0, ReturnByUserName : '', ReturnDate : '',  Comments: '', Status : '', UpdatedByUserId : 0, 
      UpdatedByUserName :'', UpdatedDate: '' };
    public errors: { BookName: string, BorrowerName : string, IssuedByUserName :string, ReturnByUserName : string, 
      Status : string} = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];
   

    ngOnInit(): void {
        this.loadIssuedBooksDetails();
    }

    loadIssuedBooksDetails(): void {
        this.bcService.getAllBookCirculationDetails('I').subscribe({
            next: (data: BookCirculationDetails[]) => {
                this.issuedBooks = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading Issued books:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.issuedBooks.map(bc => bc.BookName))]
            .map(e => ({ label: e!, value: e! }));
        this.borrowerNameList = [...new Set(this.issuedBooks.map(bc => bc.BorrowerName))]
            .map(e => ({ label: e!, value: e! }));
          this.issuedByNameList = [...new Set(this.issuedBooks.map(bc => bc.IssuedByUserName))]
            .map(e => ({ label: e!, value: e! }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedBorrowerNameList = [];
        this.selectedIssuedByNameList = [];
        this.showFt = false;
    }

   getOverDueStatusSeverity(_overDueDays: number): 'success' | 'warning' | 'info' {
        switch (true) {
            case _overDueDays <= 0 : return 'success';
            case _overDueDays > 0 && _overDueDays < 10 : return 'warning';
            case _overDueDays > 10 : return 'info';
            default: return 'info';
        }
    }

    editBcDetails(_bcDetails: BookCirculationDetails | null = null): void {
            if (_bcDetails) {
                this.currentIssuedBook = { ..._bcDetails };
                this.header = 'Update Issued Book Details';
            } 
            else {
                this.currentIssuedBook = { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', 
                  IssuedByUserId: 0, IssuedByUserName :'', IssuedDate : '', OverDueId: 0, FineAmount: 0.0, OverDueFrom : '', 
                  OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'', ReturnByUserId: 0, ReturnByUserName : '', ReturnDate : '', 
                  Comments: '', Status : '', UpdatedByUserId : 0, UpdatedByUserName :'', UpdatedDate: '' };
                this.header = 'Issue Book';
            }
            this.errors = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : '' };
            this.issuedBookDialogVisible = true;
    }

     validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.currentIssuedBook.BookName?.trim()) {
                    this.errors.BookName = 'Book name is required.';
                    isValid = false;
                }                 
                else {
                    this.errors.BookName = '';
                }
                break;

            case 'BorrowerName':
                if (this.currentIssuedBook.BorrowerName ?.trim()) {
                    this.errors.BorrowerName = 'Borrower Name is required.';
                    isValid = false;
                } else {
                    this.errors.BorrowerName = '';
                }
                break;

            case 'IssuedByUserName':
                if (this.currentIssuedBook.IssuedByUserName ?.trim()) {
                    this.errors.IssuedByUserName = 'IssuedBy Name is required.';
                    isValid = false;
                } else {
                    this.errors.IssuedByUserName = '';
                }
                break;
              
            case 'Status':
                if (this.currentIssuedBook.Status ?.trim()) {
                    this.errors.Status = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.Status = '';
                }
                break;

            case 'ReturnByUserName':
                if (this.currentIssuedBook.ReturnByUserName ?.trim() == "Returned" && this.currentIssuedBook.ReturnByUserName ?.trim()) {
                    this.errors.ReturnByUserName = 'ReturnBy Name is required.';
                    isValid = false;
                } else {
                    this.errors.ReturnByUserName = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateBcDetails(): boolean {
        const isBookNameValid = this.validateInput('BookName');
        const isBorrowerNameValid = this.validateInput('BorrowerName');
        const isIssuedByUserNameValid = this.validateInput('IssuedByUserName');
        const isStatusValid = this.validateInput('Status');
        const isReturnByUserNameValid = this.validateInput('ReturnByUserName');
        return isBookNameValid && isBorrowerNameValid && isIssuedByUserNameValid && isStatusValid && isReturnByUserNameValid;
    }

    saveBcDetails(): void {
        if (!this.validateBcDetails()) {
            return;
        }
              
        this.bcService.issueBook(this.currentIssuedBook).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book circulation - Failed',
                        detail: res ? res.Message : 'Failed to Issue book. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book circulation - Success',
                        detail: 'Updated Book circulation successfully.'
                    });
                }

                this.loadIssuedBooksDetails();
                this.issuedBookDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Book circulation - Failed',
                    detail: 'Failed to updated Book circulation. Please try again.'
                });
            }
        });
        

       
    }    
}
