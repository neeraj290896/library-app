import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, BookDetails, UserDetails } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { BookService } from '@app/shared/services/book.service';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-manage-book-circulation',
  imports: [ CommonModule, TagModule, TableModule, ButtonModule, FormsModule, PaginatorModule, MultiSelectModule,
        InputTextModule,],
  templateUrl: './manage-book-circulation.component.html',
  styleUrl: './manage-book-circulation.component.scss'
})
export class ManageBookCirculationComponent {
  searchBookTerm = '';
  searchUserTerm = '';
  private messageService = inject(MessageService);
  private _bcService = inject(BookCirculationService);
  private _bookService = inject(BookService);
  private _userService = inject(UserService);
  @ViewChild('dt') dataTable: Table | undefined;
  public showFt: boolean = false;
  public bookNameList: { label: string, value: string }[] = [];
  public borrowerNameList: { label: string, value: string }[] = [];
  public issuedByList: { label: string, value: string }[] = [];
  public statusList: { label: string, value: string }[] = [];
  public selectedBookNameList: string[] = [];
  public selectedBorrowerNameList: string[] = [];
  public selectedIssuedByList: string[] = [];
  public selectedStatusList: string[] = [];
  public bcDetails: BookCirculationDetails[] = [];
  public filteredBcDetails: BookCirculationDetails[] = [];
  public bcDialogVisible = false;
  bcDetailsCount = 0;
  public header: string = '';
  public selectedBook: BookCirculationDetails = 
    { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', IssuedByUserId: 0, IssuedByUserName :'',
      IssuedDate : '', OverDueId: 0, FineAmount: 0.0, OverDueFrom : '', OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'',
      ReturnByUserId: 0, ReturnByUserName : '', ReturnDate : '',  Comments: '', Status : '', UpdatedByUserId : 0, 
      UpdatedByUserName :'', UpdatedDate: '' };
    public errors: { BookName: string, BorrowerName : string, IssuedByUserName :string, ReturnByUserName : string, 
      Status : string} = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''
    };
  public bookOptions: { label: string; value: number; }[] = [];
  public availableBooks: { label: string; value: number; }[] = [];
  public userOptions: { label: string; value: number; }[] = [];
  public overDueStatusOptions: { label: string; value: string; }[] = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Paid', value: 'Paid' }
    ];
  public statusOptions: { label: string; value: string; }[] = [
        { label: 'Issued', value: 'Issued' },
        { label: 'Returned', value: 'Returned' }
    ];

    ngOnInit(): void {
        this.loadBooks();
        this.loadUserDetails();
        this.getAllBookCirculartion();
    }

    getAllBookCirculartion(): void{
        this._bcService.getAllBookCirculationDetails('A').subscribe({
                next: (data: BookCirculationDetails[]) => {
                    this.bcDetails = data;
                    this.filteredBcDetails = data;
                    this.bcDetailsCount = data.length;    
                    
                    this.initializeFilterLists();
                },
                error: (err) => {
                    console.error('Error loading book circulation:', err);
                }
            });
    }

    loadBooks(): void {
        this._bookService.getAllBookDetails().subscribe({
            next: (data: BookDetails[]) => {
                this.bookOptions = data.map(book => {
                    return { label: book.BookName ?? '', value: book.BookId };
                });                
            },
            error: (err) => {
                console.error('Error loading books:', err);
            }
        });
    }

    loadUserDetails(): void {
            this._userService.getAllUserDetails().subscribe({
                next: (data: UserDetails[]) => {
                    this.userOptions = data.filter(x => x.FullName?.trim() !='').map(usr => {
                        return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                    });
                },
                error: (err) => {
                    console.error('Error loading users:', err);
                }
            });
        }

    onBookSearch(term: string) {
        this.searchBookTerm = term;
        this.commonBookCirculationSearch();      
    }

    onUserSearch(term: string) {
        this.searchUserTerm = term.trim();
        this.commonBookCirculationSearch();               

    }

    commonBookCirculationSearch()
    {
        var _userBarcode : number = 0
        var _bookBarcode : number = 0
        

        if(this.searchUserTerm !="" && this.searchUserTerm.includes(environment.usersBarcodeSyntax))
        {
            let strSplitBarcode = this.searchUserTerm.split("_").pop() ?? '0';                 
            _userBarcode = parseInt(strSplitBarcode);
        } 

        if(this.searchBookTerm !="" && this.searchBookTerm.includes(environment.booksBarcodeSyntax))
        {
            let strSplitBarcode = this.searchBookTerm.split("_").pop() ?? '0';                 
            _bookBarcode = parseInt(strSplitBarcode);
        }

        if(this.bcDetails !=null && this.bcDetails.length >0)
        {           
                        
            if(_userBarcode > 0 && _bookBarcode > 0)
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerId == _userBarcode && x.BookId == _bookBarcode);                
            }
            else if(_userBarcode == 0 && _bookBarcode > 0)
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookId == _bookBarcode);                
            }
            else if(_userBarcode > 0 && _bookBarcode == 0)
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerId == _userBarcode);                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm !="")
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.includes(this.searchBookTerm) && x.BorrowerName?.includes(this.searchUserTerm));                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm =="")
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.includes(this.searchBookTerm));                
            }
            else if(this.searchBookTerm =="" && this.searchUserTerm !="")
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerName?.includes(this.searchUserTerm));
            }
            else
            {
                this.filteredBcDetails = this.bcDetails;
            }
                
        }
        else
        {
            this.filteredBcDetails = [];
        }
    }

    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.bcDetails.map(book => book.BookName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.borrowerNameList = [...new Set(this.bcDetails.map(book => book.BorrowerName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.issuedByList = [...new Set(this.bcDetails.map(book => book.IssuedByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.statusList = [...new Set(this.bcDetails.map(book => book.Status))].map(e => ({ label: e ?? "", value: e ?? "" }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedBorrowerNameList = [];
        this.selectedIssuedByList = [];
        this.selectedStatusList = [];
        this.searchBookTerm = '';
        this.searchUserTerm = '';
        this.onBookSearch('');
        this.showFt = false;
    }

    getStatusSeverity(status: string): 'success' | 'warning' | 'info' {
        switch (status) {
            case 'Returned': return 'success';
            case 'Issued': return 'warning';
            // case 'Issued': return 'info';
            default: return 'info';
        }
    }

    getOverDueStatusSeverity(_overDueDays: number): 'success' | 'warning'| 'error' | 'info' {
        switch (true) {
            case _overDueDays <= 0 : return 'success';
            case _overDueDays > 0 && _overDueDays < 10 : return 'warning';
            case _overDueDays > 10 : return 'error';
            default: return 'info';
        }
    }

    editBook(_bc: BookCirculationDetails | null = null): void {

        if(_bc)
        {
            this.selectedBook  = { ..._bc };

             if (_bc.Status == "Issued") {
                
                this.header = 'Update Issued Book Details';
            } 
            else {                
                this.header = 'Update Returned Book Details';
            }
        }
        else
        {
            this.selectedBook  = { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', 
                                IssuedByUserId: 0, IssuedByUserName :'', IssuedDate : '', OverDueId: 0, FineAmount: 0.0, 
                                OverDueFrom : '', OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'', ReturnByUserId: 0,
                                ReturnByUserName : '', ReturnDate : '',  Comments: '', Status : '', UpdatedByUserId : 0, 
                                UpdatedByUserName :'', UpdatedDate: '' };

            this.header = "Issue book"            
        }
        
        this.errors = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''} 
            
        this.bcDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.selectedBook.BookName?.trim()) {
                    this.errors.BookName = 'Book name is required.';
                    isValid = false;
                }                 
                else {
                    this.errors.BookName = '';
                }
                break;

            case 'BorrowerName':
                if (this.selectedBook.BorrowerName ?.trim()) {
                    this.errors.BorrowerName = 'Borrower Name is required.';
                    isValid = false;
                } else {
                    this.errors.BorrowerName = '';
                }
                break;

            case 'IssuedByUserName':
                if (this.selectedBook.IssuedByUserName ?.trim()) {
                    this.errors.IssuedByUserName = 'IssuedBy Name is required.';
                    isValid = false;
                } else {
                    this.errors.IssuedByUserName = '';
                }
                break;
              
            case 'Status':
                if (this.selectedBook.Status ?.trim()) {
                    this.errors.Status = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.Status = '';
                }
                break;

            case 'ReturnByUserName':
                if (this.selectedBook.Status ?.trim() == "Returned" && this.selectedBook.ReturnByUserName ?.trim()) {
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

        if(this.selectedBook.Status == "Returned" )
        {
            this.returnBook();
        }
        else
        {
            this.issueBook();
        }       
    } 

    issueBook():void {
        this._bcService.issueBook(this.selectedBook).subscribe({
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

                this.getAllBookCirculartion();
                this.bcDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Book circulation - Failed',
                    detail: 'Failed to Issue book. Please try again.'
                });
            }
        });
    }
    
    returnBook():void{
        this._bcService.returnBook(this.selectedBook).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book circulation - Failed',
                        detail: res ? res.Message : 'Failed to Return book. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book circulation - Success',
                        detail: 'Updated Book circulation successfully.'
                    });
                }

                this.getAllBookCirculartion();
                this.bcDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Book circulation - Failed',
                    detail: 'Failed to Return book. Please try again.'
                });
            }
        });
    }
    
}
