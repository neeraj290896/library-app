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
  selector: 'app-manage-returned-books',
  imports: [CommonModule, TagModule, TableModule, ButtonModule, FormsModule, PaginatorModule, 
          MultiSelectModule, DialogModule, InputTextModule,
                  SelectModule, FormsModule, DatePickerModule, TooltipModule],
  templateUrl: './manage-returned-books.component.html',
  styleUrl: './manage-returned-books.component.scss'
})
export class ManageReturnedBooksComponent {
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
  public returnByList: { label: string, value: string }[] = [];
  public selectedBookNameList: string[] = [];
  public selectedBorrowerNameList: string[] = [];
  public selectedIssuedByList: string[] = [];
  public selectedStatusList: string[] = [];
  public selectedReturnByList: string[] = [];
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
        this._bcService.getAllBookCirculationDetails('R').subscribe({
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
        this.returnByList = [...new Set(this.bcDetails.map(book => book.ReturnByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
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
        this.selectedReturnByList = [];
        this.searchBookTerm = '';
        this.searchUserTerm = '';        
        this.onBookSearch('');
        this.showFt = false;
    }

    getStatusSeverity(status: string, _overDueDays: number): 'success' | 'warn'| 'danger' | 'info' | 'secondary'{
        
        if (status === 'Returned' && _overDueDays <= 0) {
            return 'success';
        }

        if (status === 'Returned' && _overDueDays <= 7) {
            return 'info';
        }

        if (status === 'Returned' && (_overDueDays > 7 && _overDueDays <= 14)) {
            return 'warn';
        }

        if (status === 'Returned' && (_overDueDays > 14)) {
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

    parseCustomDateStringForUI(dateStr: Date): string {
        // 2. Pad single digits with leading zeros
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = dateStr.getFullYear();      

        // 3. Assemble into the exact "yyyy-mm-dd" layout match        
        return  `${year}-${month}-${day}`;
    }

    viewBookCirculationDetails(_bc: BookCirculationDetails): void{

    }
}

