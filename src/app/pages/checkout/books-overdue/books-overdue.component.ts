import { Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BookDetails, OverDueDetails, OverDueRefreshDetails, UserDetails } from '@app/shared/models/api.models';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { OverDueService } from '@app/shared/services/overdue.service';
import { BookService } from '@app/shared/services/book.service';
import { UserService } from '@app/shared/services/user.service';
import { AuthService } from '@app/shared/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-books-overdue',
    standalone: true,
    imports: [CommonModule, TagModule, TableModule, ButtonModule, FormsModule, PaginatorModule, 
            MultiSelectModule, DialogModule, InputTextModule,
                    SelectModule, FormsModule, DatePickerModule, TooltipModule],
    templateUrl: './books-overdue.component.html',
    styleUrl: './books-overdue.component.scss'
})
export class BooksOverdueComponent {
    @Input() totalOverDueCount = 0;
    @Input() totalOverDues: OverDueDetails[] = [];

    searchBookTerm = '';
  searchUserTerm = '';
  private messageService = inject(MessageService);
  private _odService = inject(OverDueService);
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
  public _odDetails: OverDueDetails[] = [];
  public filteredOdDetails: OverDueDetails[] = [];
  public bcDialogVisible = false;
  public todayDate :string | undefined ;
  public header: string = '';
  public loggedInUserDetails: UserDetails = {};
  public isReturnBook: boolean = true;
  public lstUserDetails: UserDetails[] = [];
  public selectedOverDue: OverDueDetails = 
    { OverDueId: 0, BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', IssuedByUserId: 0, IssuedByUserName :'', IssuedDate : '', FineAmount: 0.0, 
        OverDueFrom : '', OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:'', ReturnByUserId: 0, ReturnByUserName : '', ReturnDate : '', UpdatedByUserId : 0,  
        UpdatedByUserName :'', UpdatedDate: '', BorrowerMailId:'', IssuedByUserMailId:'', ReturnByUserMailId:'', UpdatedByUserMailId:'' };
    public errors: { BookName: string, BorrowerName : string, IssuedByUserName :string, ReturnByUserName : string, 
      Status : string} = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''
    };
  public bookOptions: { label: string; value: number; }[] = [];
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
    public lastRefreshedDate: string = '';
    public lstBookDetails: BookDetails[] = [];

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
        this.getOverDueDetails();
    }

    getOverDueDetails(): void{
        this._odService.getOverDueDetails().subscribe({
                next: (data: OverDueDetails[]) => {
                    this._odDetails = data;
                    this.filteredOdDetails = data.filter(x => x.OverDueStatus == 'Pending');
                    this.totalOverDueCount = this.filteredOdDetails.length;    
                    this.getOverDueRefreshedDetails();
                    this.initializeFilterLists();
                },
                error: (err) => {
                    console.error('Error loading over due book details:', err);
                }
            });
    }

    getOverDueRefreshedDetails(): void{
        this._odService.getOverDueDataRefreshDetails().subscribe({
                next: (data: OverDueRefreshDetails[]) => {                    
                    var _refreshData = data.find(x => x.Status == 'Completed');

                    if(_refreshData)
                    {
                        this.lastRefreshedDate = _refreshData.CreatedDate?.toString() ?? "";
                    }
                    
                },
                error: (err) => {
                    console.error('Error loading over due refresh details:', err);
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
        this.commonOverDueSearch();      
    }

    onUserSearch(term: string) {
        this.searchUserTerm = term.trim();
        this.commonOverDueSearch();               

    }

    commonOverDueSearch()
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

        if(this._odDetails !=null && this._odDetails.length >0)
        {           
                        
            if(_userBarcode > 0 && _bookBarcode > 0)
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BorrowerId == _userBarcode && x.BookId == _bookBarcode);                
            }
            else if(_userBarcode == 0 && _bookBarcode > 0)
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BookId == _bookBarcode);                
            }
            else if(_userBarcode > 0 && _bookBarcode == 0)
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BorrowerId == _userBarcode);                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm !="")
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()) && x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm =="")
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm =="" && this.searchUserTerm !="")
            {
                this.filteredOdDetails = this._odDetails.filter(x => x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));
            }
            else
            {
                this.filteredOdDetails = this._odDetails;
            }
                
        }
        else
        {
            this.filteredOdDetails = [];
        }
    }

    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this._odDetails.map(book => book.BookName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.borrowerNameList = [...new Set(this._odDetails.map(book => book.BorrowerName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.issuedByList = [...new Set(this._odDetails.map(book => book.IssuedByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.statusList = [...new Set(this._odDetails.map(book => book.OverDueStatus))].map(e => ({ label: e ?? "", value: e ?? "" }));
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

    editBook(_odD: OverDueDetails): void {

        if(_odD)
        {
            this.bindActiveDetails();
            
            this.selectedOverDue  = { ..._odD };

            if(_odD.IssuedDate !=null && _odD.IssuedDate !="")
            {
                this.selectedOverDue.IssuedDate = this.parseCustomDateStringForUI(new Date(_odD.IssuedDate));
            }
           
            if(_odD.ReturnDate !=null && _odD.ReturnDate !="")
            {
                this.selectedOverDue.ReturnDate = this.parseCustomDateStringForUI(new Date(_odD.ReturnDate));
            }
            else{
                this.selectedOverDue.ReturnDate = this.todayDate;
            }

            if(_odD.OverDueFrom !=null && _odD.OverDueFrom !="")
            {
                this.selectedOverDue.OverDueFrom = this.parseCustomDateStringForUI(new Date(_odD.OverDueFrom));
            } 
            
            console.log("selectedOverDue :", this.selectedOverDue);

             if (_odD.OverDueStatus == "Pending") {
                
                this.header = 'Update OverDue Details';
            }            
        }        

        this.errors = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : ''} 
            
        this.bcDialogVisible = true;
    }

    bindActiveDetails() : void{
        
        this.userOptions = this.lstUserDetails.filter(x => x.FullName?.trim() !='').map(usr => {
                    return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                });

        this.bookOptions = this.lstBookDetails.map(book => {
                return { label: book.BookName ?? '', value: book.BookId };
            }); 
        
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.selectedOverDue.BookName?.trim()) {
                    this.errors.BookName = 'Book name is required.';
                    isValid = false;
                }                 
                else {
                    this.errors.BookName = '';
                }
                break;

            case 'BorrowerName':
                if (!this.selectedOverDue.BorrowerName?.trim()) {
                    this.errors.BorrowerName = 'Borrower Name is required.';
                    isValid = false;
                } else {
                    this.errors.BorrowerName = '';
                }
                break;

            case 'IssuedByUserName':
                if (!this.selectedOverDue.IssuedByUserName?.trim()) {
                    this.errors.IssuedByUserName = 'IssuedBy Name is required.';
                    isValid = false;
                } else {
                    this.errors.IssuedByUserName = '';
                }
                break;
              
            case 'Status':
                if (!this.selectedOverDue.Status?.trim()) {
                    this.errors.Status = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.Status = '';
                }
                break;

            case 'ReturnByUserName':
                if (!this.selectedOverDue.ReturnByUserName?.trim()) {
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

    validateOdDetails(): boolean {
        const isBookNameValid = this.validateInput('BookName');
        const isBorrowerNameValid = this.validateInput('BorrowerName');
        const isIssuedByUserNameValid = this.validateInput('IssuedByUserName');
        const isStatusValid = this.validateInput('Status');
        const isReturnByUserNameValid = this.validateInput('ReturnByUserName');
        return isBookNameValid && isBorrowerNameValid && isIssuedByUserNameValid && isStatusValid && isReturnByUserNameValid;
    }

    saveOdDetails(): void {
        if (!this.validateOdDetails()) {
            return;
        }

        if(this.selectedOverDue.Status == "Paid" )
        {
            this.updateOverDueDetails();
        }             
    } 
    
    updateOverDueDetails():void{

        let _overDue = { ...this.selectedOverDue }; 
        _overDue.IssuedDate = this.parseCustomDateStringForAPI(this.selectedOverDue.IssuedDate ?? "");
        _overDue.ReturnDate = this.parseCustomDateStringForAPI(this.selectedOverDue.ReturnDate ?? "");


        this._odService.updateOverDueDetails(_overDue).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Over Due - Failed',
                        detail: res ? res.Message : 'Failed to Update Over Due details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Over Due - Success',
                        detail: 'Updated Over Due details successfully.'
                    });
                }

                this.getOverDueDetails();
                this.bcDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Over Due - Failed',
                    detail: 'Failed to Update Over Due details. Please try again.'
                });
            }
        });
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

    viewOverDueDetails(_odD: OverDueDetails): void{
    }

    refreshData(): void{
        this._odService.syncOverDueDetails().subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Refresh Over Due - Failed',
                        detail: res ? res.Message : 'Failed to refresh Over Due details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Refresh Over Due - Success',
                        detail: 'Refresh Over Due details successfully.'
                    });
                }

                this.getOverDueRefreshedDetails();
                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Refresh Over Due - Failed',
                    detail: 'Failed to refresh Over Due details. Please try again.'
                });
            }
        });
    }
    
}
