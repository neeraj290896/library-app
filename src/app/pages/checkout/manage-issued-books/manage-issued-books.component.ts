import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, BookDetails, UserDetails } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { BookService } from '@app/shared/services/book.service';
import { UserService } from '@app/shared/services/user.service';
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
import { environment } from '../../../../environments/environment';
import { DatePickerModule } from 'primeng/datepicker';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-manage-issued-books',
  imports: [CommonModule, TagModule, TableModule, ButtonModule, FormsModule, PaginatorModule, 
          MultiSelectModule, DialogModule, InputTextModule,
                  SelectModule, FormsModule, DatePickerModule, TooltipModule],
  templateUrl: './manage-issued-books.component.html',
  styleUrl: './manage-issued-books.component.scss'
})
export class ManageIssuedBooksComponent {
 searchBookTerm = '';
  searchUserTerm = '';
  private messageService = inject(MessageService);
  private _bcService = inject(BookCirculationService);
  private _bookService = inject(BookService);
  private _userService = inject(UserService);
  private _authService = inject(AuthService);
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
  public todayDate :string | undefined ;
  bcDetailsCount = 0;
  public header: string = '';
  public loggedInUserDetails: UserDetails = {};
  public isReturnBook: boolean = true;
  public isOverDue: boolean = false;
  public lstUserDetails: UserDetails[] = [];
  public selectedBook: BookCirculationDetails = 
    { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', IssuedByUserId: 0, IssuedByUserName :'',
      IssuedDate : '', OverDueId: 0, FineAmount: 0.0, OverDueFrom : '', OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'',
      ReturnByUserId: 0, ReturnByUserName : '', ReturnDate : '',  Comments: '', Status : '', UpdatedByUserId : 0, 
      UpdatedByUserName :'', UpdatedDate: '', BorrowerMailId:'', IssuedByUserMailId:'', ReturnByUserMailId:'',
    UpdatedByUserMailId:'' };
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
    minDate: Date | undefined;
    maxDate: Date | undefined;

    isReturnByDifferentUser: boolean = false;
    public lstBookDetails: BookDetails[] = [];
    public isIssueNewBook: boolean = false;

    ngOnInit(): void {

        const today = new Date();

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        this.minDate = yesterday;
        this.maxDate = new Date();
    
       
        // 3. Assemble into the exact "yyyy-mm-dd" layout match
        this.todayDate = this.parseCustomDateStringForUI(today);

        this.loggedInUserDetails = this._authService.userData() ?? {};

        this.loadBooks();
        this.loadUserDetails();
        this.getAllBookCirculartion();
    }

    getAllBookCirculartion(): void{
        this._bcService.getAllBookCirculationDetails('I').subscribe({
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
                this.lstBookDetails = data;
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
                    this.lstUserDetails = data;
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
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()) && x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm =="")
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm =="" && this.searchUserTerm !="")
            {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));
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

    getStatusSeverity(status: string,_overDueDays: number): 'success' | 'warn'| 'danger' | 'info' | 'secondary'{
        
        if (status === 'Returned' && _overDueDays <= 0) {
            return 'success';
        }

        if (status === 'Returned' && _overDueDays <= 7) {
            return 'info';
        }

        if (status === 'Issued' && _overDueDays <= 7) {
            return 'info';
        }

        if (status === 'Issued' && _overDueDays > 7 && _overDueDays <= 14) {
            return 'warn';
        }

        if (status === 'Issued' && _overDueDays > 14) {
            return 'danger';
        }
        
        return 'secondary'
    }


    getOverDueSeverity(_overDueDays: number): 'success' | 'warn'| 'danger' | 'info' | 'secondary' {
       
        if (_overDueDays <= 7) {
            return 'info';
        }
        
        if (_overDueDays > 7 && _overDueDays <= 14) {
            return 'warn';
        }

        if (_overDueDays > 14) {
            return 'danger';
        }
  
        return 'success';
       
    }

    getOverDueStatusSeverity(status: string,_overDueDays: number): 'success' | 'warn'| 'danger' | 'info' | 'secondary' {

        console.log('status : ', status);
        
        if (status == null || status == undefined || status == '-') {
            return 'secondary';
        }

        if (status === 'Paid' && _overDueDays <= 0) {
            return 'success';
        }

        if (status !=null && _overDueDays <= 7) {
            return 'info';
        }
        
        if (status !=null && (_overDueDays > 7 && _overDueDays <= 14)) {
            return 'warn';
        }
  
        return 'danger';
       
    }

    editBook(_bc: BookCirculationDetails | null = null): void {

        if(_bc)
        {
            this.isIssueNewBook = false;
            this.bindOnlyActiveDetails();
            
            this.selectedBook  = { ..._bc };

            if(_bc.IssuedDate !=null && _bc.IssuedDate !="")
            {
                this.selectedBook.IssuedDate = this.parseCustomDateStringForUI(new Date(_bc.IssuedDate));
            }
           
            if(_bc.ReturnDate !=null && _bc.ReturnDate !="")
            {
                this.selectedBook.ReturnDate = this.parseCustomDateStringForUI(new Date(_bc.ReturnDate));
            }
            else{
                this.selectedBook.ReturnDate = this.todayDate;
            }

            if(_bc.OverDueFrom !=null && _bc.OverDueFrom !="")
            {
                this.selectedBook.OverDueFrom = this.parseCustomDateStringForUI(new Date(_bc.OverDueFrom));
            } 
            
            if(this.selectedBook.OverDueId !=null && this.selectedBook.OverDueId>0)
            {
                this.isOverDue = true;
            }

            this.returnByDifferentUser();
            
            console.log("selectedBook :", this.selectedBook);

             if (_bc.Status == "Issued") {
                
                this.header = 'Update Issued Book Details';
            } 
            else {                
                this.header = 'Update Returned Book Details';
            }
        }
        else
        {   
            this.isIssueNewBook = true;
            this.bindOnlyActiveDetails();                    

            this.selectedBook  = { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', 
                                IssuedByUserId: this.loggedInUserDetails.UserId, IssuedByUserName :this.loggedInUserDetails.FullName, 
                                IssuedDate : this.todayDate, IssuedByUserMailId: this.loggedInUserDetails.MailId, OverDueId: 0, FineAmount: 0.0, 
                                OverDueFrom : null, OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:null, ReturnByUserId: 0,
                                ReturnByUserName : '', ReturnDate : null,  Comments: '', Status : 'Issued', UpdatedByUserId : 0, 
                                UpdatedByUserName :'', UpdatedDate: null };

            this.header = "Issue book";  
        }

        this.onStatusChange();
        
        this.errors = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''} 
            
        this.bcDialogVisible = true;
    }

    bindOnlyActiveDetails() : void{
        if(this.isIssueNewBook)
        {
            this.userOptions = this.lstUserDetails.filter(x => x.IsActive == true && x.FullName?.trim() !='').map(usr => {
                        return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                    });
            
            this.bookOptions = this.lstBookDetails.filter(x => x.Status == "Available").map(book => {
                    return { label: book.BookName ?? '', value: book.BookId };
                }); 
        }
        else
        {
            this.userOptions = this.lstUserDetails.filter(x => x.FullName?.trim() !='').map(usr => {
                        return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                    });

            this.bookOptions = this.lstBookDetails.map(book => {
                    return { label: book.BookName ?? '', value: book.BookId };
                }); 
        }
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
                if (!this.selectedBook.BorrowerName?.trim()) {
                    this.errors.BorrowerName = 'Borrower Name is required.';
                    isValid = false;
                } else {
                    this.errors.BorrowerName = '';
                }
                break;

            case 'IssuedByUserName':
                if (!this.selectedBook.IssuedByUserName?.trim()) {
                    this.errors.IssuedByUserName = 'IssuedBy Name is required.';
                    isValid = false;
                } else {
                    this.errors.IssuedByUserName = '';
                }
                break;
              
            case 'Status':
                if (!this.selectedBook.Status?.trim()) {
                    this.errors.Status = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.Status = '';
                }
                break;

            case 'ReturnByUserName':
                if (this.selectedBook.Status?.trim() == "Returned" && !this.selectedBook.ReturnByUserName?.trim()) {
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
        else if(this.selectedBook.BookCirculationId >0 )
        {
            this.updateBcBook();
        }
        else
        {
            this.issueBook();
        }       
    } 

    issueBook():void {

        let _issuedBook = { ...this.selectedBook }; 
        _issuedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");

        this._bcService.issueBook(_issuedBook).subscribe({
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

    updateBcBook():void {

        let _issuedBook = { ...this.selectedBook }; 
        _issuedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");

        if(_issuedBook.Status =="Issued" &&  _issuedBook.ReturnByUserId !=null && _issuedBook.ReturnByUserId >0)
        {
            _issuedBook.ReturnByUserId = null;
            _issuedBook.ReturnByUserId = null;
            _issuedBook.ReturnByUserMailId = null;
        }

        _issuedBook.UpdatedByUserId = this.loggedInUserDetails.UserId;
        _issuedBook.UpdatedByUserMailId = this.loggedInUserDetails.MailId;
        _issuedBook.UpdatedByUserName = this.loggedInUserDetails.FullName;

        this._bcService.updateBookCirculation(_issuedBook).subscribe({
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

        let _returnedBook = { ...this.selectedBook }; 
        _returnedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");
        _returnedBook.ReturnDate = this.parseCustomDateStringForAPI(this.selectedBook.ReturnDate ?? "");


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

    onBookChange():void{
        const book = this.bookOptions.find(l => l.value === this.selectedBook.BookId);
        if (book) {
            this.selectedBook.BookName = book.label;
        }

        this.validateInput('BookName');
    }

    onBorrowerChange():void{
        const _borrower = this.lstUserDetails.find(l => l.UserId === this.selectedBook.BorrowerId);
        if (_borrower) {
            this.selectedBook.BorrowerName = _borrower.FullName;
            this.selectedBook.BorrowerMailId = _borrower.MailId;
        }

        this.validateInput('BorrowerName');
    }

    onIssuedChange():void{
         const _issuedBy = this.lstUserDetails.find(l => l.UserId === this.selectedBook.IssuedByUserId);
        if (_issuedBy) {
            this.selectedBook.IssuedByUserName = _issuedBy.FullName;
            this.selectedBook.IssuedByUserMailId = _issuedBy.MailId;
        }

        this.validateInput('IssuedByUserName');
    }

    onStatusChange():void{

        if(this.selectedBook.Status == "Returned")
        {
            this.isReturnBook = true;
        }
        else
        {
            this.isReturnBook = false;
        }

        this.validateInput('Status');
    }

    onReturnedChange():void{
            const _returnedBy = this.lstUserDetails.find(l => l.UserId === this.selectedBook.ReturnByUserId);
        if (_returnedBy) {
            this.selectedBook.ReturnByUserName = _returnedBy.FullName;
            this.selectedBook.ReturnByUserMailId = _returnedBy.MailId;
        }

        this.validateInput('ReturnByUserName');
    }

    parseCustomDateStringForAPI(dateStr: string): string | null {
        if (!dateStr) return null;
        
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[2], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
        const year = parseInt(parts[0], 10);

        const nativeDate = new Date(year, month, day);
        return nativeDate.toISOString(); // Generates "2026-06-01T00:00:00.000Z"
    }

    parseCustomDateStringForUI(dateStr: Date): string {
        // 2. Pad single digits with leading zeros
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = dateStr.getFullYear();      

        // 3. Assemble into the exact "yyyy-mm-dd" layout match        
        return  `${year}-${month}-${day}`;
    }

    returnByDifferentUser(): void {
        if (this.isReturnByDifferentUser) {
            // If typing a manual name, clear out old selected User ID references
            this.selectedBook.ReturnByUserName = null;
            this.selectedBook.ReturnByUserId = null;
            this.selectedBook.ReturnByUserMailId = null;
        } else {
            // If switching back to dropdown, clear manual text fields
            this.selectedBook.ReturnByUserName = this.selectedBook.IssuedByUserName;
            this.selectedBook.ReturnByUserId = this.selectedBook.IssuedByUserId;
            this.selectedBook.ReturnByUserMailId = this.selectedBook.IssuedByUserMailId;
        }

         this.validateInput('ReturnByUserName');
    }

    viewBookCirculationDetails(_bc: BookCirculationDetails): void{
    }
}
