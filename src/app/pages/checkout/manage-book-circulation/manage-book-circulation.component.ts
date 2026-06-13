import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { IssueReturnBooksComponent } from '../issue-return-books/issue-return-books.component';

@Component({
    selector: 'app-manage-book-circulation',
    imports: [CommonModule, TagModule, TableModule, ButtonModule,
        MultiSelectModule, DialogModule, SelectModule, FormsModule,
        DatePickerModule, TooltipModule, IssueReturnBooksComponent
    ],
    templateUrl: './manage-book-circulation.component.html',
    styleUrl: './manage-book-circulation.component.scss'
})
export class ManageBookCirculationComponent {
    searchBookTerm = '';
    searchUserTerm = '';
    private _bcService = inject(BookCirculationService);
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
    public bc: BookCirculationDetails | null = null;
    public type: string = '';
    public bcDialogVisible: boolean = false;

    ngOnInit(): void {
        this.getAllBookCirculartion();
    }

    getAllBookCirculartion(): void {
        this._bcService.getAllBookCirculationDetails('A').subscribe({
            next: (data: BookCirculationDetails[]) => {
                this.bcDetails = data;
                this.filteredBcDetails = data;

                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading book circulation:', err);
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

    commonBookCirculationSearch() {
        var _userBarcode: number = 0
        var _bookBarcode: number = 0

        if (this.searchUserTerm != "" && this.searchUserTerm.includes(environment.usersBarcodeSyntax)) {
            let strSplitBarcode = this.searchUserTerm.split("_").pop() ?? '0';
            _userBarcode = parseInt(strSplitBarcode);
        }

        if (this.searchBookTerm != "" && this.searchBookTerm.includes(environment.booksBarcodeSyntax)) {
            let strSplitBarcode = this.searchBookTerm.split("_").pop() ?? '0';
            _bookBarcode = parseInt(strSplitBarcode);
        }

        if (this.bcDetails != null && this.bcDetails.length > 0) {

            if (_userBarcode > 0 && _bookBarcode > 0) {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerId == _userBarcode && x.BookId == _bookBarcode);
            }
            else if (_userBarcode == 0 && _bookBarcode > 0) {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookId == _bookBarcode);
            }
            else if (_userBarcode > 0 && _bookBarcode == 0) {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerId == _userBarcode);
            }
            else if (this.searchBookTerm != "" && this.searchUserTerm != "") {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()) && x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));
            }
            else if (this.searchBookTerm != "" && this.searchUserTerm == "") {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()));
            }
            else if (this.searchBookTerm == "" && this.searchUserTerm != "") {
                this.filteredBcDetails = this.bcDetails.filter(x => x.BorrowerName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));
            }
            else {
                this.filteredBcDetails = this.bcDetails;
            }

        }
        else {
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

    getStatusSeverity(status: string, _overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
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

    getOverDueSeverity(_overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
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

    getOverDueStatusSeverity(status: string, _overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
        if (status == null || status == undefined || status == '-') {
            return 'secondary';
        }

        if (status === 'Paid' && _overDueDays <= 0) {
            return 'success';
        }

        if (status != null && _overDueDays <= 7) {
            return 'info';
        }

        if (status != null && (_overDueDays > 7 && _overDueDays <= 14)) {
            return 'warn';
        }

        return 'danger';
    }

    editBook(_bc: BookCirculationDetails | null = null, type: string): void {

        // if(_bc)
        // {
        //     this.isIssueNewBook = false;
        //     this.bindOnlyActiveDetails();
           
        //     if(_bc.IssuedDate !=null)
        //     {
        //         this.setMinAndMaxDate(new Date(_bc.IssuedDate));
        //     }
        //     else
        //     {
        //          const today = new Date();
        //         this.setMinAndMaxDate(today);   
        //     }
            
            
        //     this.selectedBook  = { ..._bc };

        //     if(_bc.IssuedDate !=null && _bc.IssuedDate !="")
        //     {
        //         this.selectedBook.IssuedDate = this.parseCustomDateStringForUI(new Date(_bc.IssuedDate));
        //     }
           
        //     if(_bc.ReturnDate !=null && _bc.ReturnDate !="")
        //     {
        //         this.selectedBook.ReturnDate = this.parseCustomDateStringForUI(new Date(_bc.ReturnDate));
        //     }
        //     else{
        //         this.selectedBook.ReturnDate = this.todayDate;
        //     }

        //     if(_bc.OverDueFrom !=null && _bc.OverDueFrom !="")
        //     {
        //         this.selectedBook.OverDueFrom = this.parseCustomDateStringForUI(new Date(_bc.OverDueFrom));
        //     } 
            
        //     if(this.selectedBook.OverDueId !=null && this.selectedBook.OverDueId>0)
        //     {
        //         this.isOverDue = true;
        //     }
        //     else
        //     {
        //       this.isOverDue = false;
        //     }

        //     if(type =="CheckIn")
        //     {
        //         this.selectedBook.Status = "Returned";
        //     }

        //     this.returnByDifferentUser();

        //      if (_bc.Status == "Issued") {
                
        //         this.header = 'Update Issued Book Details';
        //     } 
        //     else {                
        //         this.header = 'Update Returned Book Details';
        //     }
        // }
        // else
        // {   
        //     this.isIssueNewBook = true;
        //     this.bindOnlyActiveDetails();     
            
        //     const today = new Date();
        //     this.setMinAndMaxDate(today);               

        //     this.selectedBook  = { BookCirculationId: 0, BookId: 0,  BookName: '', BorrowerId:0, BorrowerName : '', 
        //                         IssuedByUserId: this.loggedInUserDetails.UserId, IssuedByUserName :this.loggedInUserDetails.FullName, 
        //                         IssuedDate : this.todayDate, IssuedByUserMailId: this.loggedInUserDetails.MailId, OverDueId: 0, FineAmount: 0.0, 
        //                         OverDueFrom : null, OverDueDays: 0, OverDueStatus : '', SytemUpdatedDate:null, ReturnByUserId: 0,
        //                         ReturnByUserName : '', ReturnDate : null,  Comments: '', Status : 'Issued', UpdatedByUserId : 0, 
        //                         UpdatedByUserName :'', UpdatedDate: null, PaidAmount:0, PaymentTypeId:0 };

        //     this.header = "Issue book";  
        // }

        // console.log("selectedBook :", this.selectedBook);

        // this.onStatusChange();
        
        // this.errors = { BookName: '', BorrowerName : '', IssuedByUserName :'', ReturnByUserName : '', Status : '', PaidAmount: '', PaymentTypeId:''} 
            
        this.bc = _bc;
        this.type = type;
        this.bcDialogVisible = true;
    }

    viewBookCirculationDetails(_bc: BookCirculationDetails): void { }
}
