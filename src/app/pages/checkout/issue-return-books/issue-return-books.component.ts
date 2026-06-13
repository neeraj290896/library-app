import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, BookDetails, TransactionTypeDetails, UserDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { BookService } from '@app/shared/services/book.service';
import { TransactionTypeService } from '@app/shared/services/transactiontype.service';
import { UserService } from '@app/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-issue-return-books',
    imports: [
        CommonModule, ButtonModule, CheckboxModule, FormsModule,
        DialogModule, InputTextModule, SelectModule,
        DatePickerModule
    ],
    templateUrl: './issue-return-books.component.html',
    styleUrl: './issue-return-books.component.scss'
})
export class IssueReturnBooksComponent implements OnInit, OnChanges {
    @Input() public bc: BookCirculationDetails | null = null;
    @Input() public type: string = "";
    @Input() public showDialog: boolean = false;
    @Output() private onSuccess: EventEmitter<void> = new EventEmitter<void>();
    @Output() private onDialogClose: EventEmitter<void> = new EventEmitter<void>();

    private messageService = inject(MessageService);
    private bcService = inject(BookCirculationService);
    private bookService = inject(BookService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private ttService = inject(TransactionTypeService);

    public header: string = '';
    public todayDate: string | undefined;
    public minDate: Date | undefined;
    public maxDate: Date | undefined;

    public bcDialogVisible = false;
    public isReturnByDifferentUser: boolean = false;
    public isReturnBook: boolean = true;
    public isOverDue: boolean = false;
    public isIssueNewBook: boolean = false;

    public loggedInUserDetails: UserDetails = {};
    public lstBookDetails: BookDetails[] = [];
    public lstUserDetails: UserDetails[] = [];
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
    public transactionTypeOptions: { label: string; value: number; }[] = [];

    public selectedBook: BookCirculationDetails = {
        BookCirculationId: 0, BookId: 0, BookName: '',
        BorrowerId: 0, BorrowerName: '', IssuedByUserId: 0,
        IssuedByUserName: '', IssuedDate: '', OverDueId: 0,
        FineAmount: 0.0, OverDueFrom: '', OverDueDays: 0,
        OverDueStatus: '', SytemUpdatedDate: '',
        ReturnByUserId: 0, ReturnByUserName: '', ReturnDate: '',
        Comments: '', Status: '',
        UpdatedByUserId: 0, UpdatedByUserName: '', UpdatedDate: '',
        BorrowerMailId: '', IssuedByUserMailId: '', ReturnByUserMailId: '',
        UpdatedByUserMailId: '', PaidAmount: 0, PaymentTypeId: 0
    };
    public errors: {
        BookName: string, BorrowerName: string, IssuedByUserName: string,
        ReturnByUserName: string, Status: string, PaidAmount: string,
        PaymentTypeId: string
    } = {
            BookName: '', BorrowerName: '', IssuedByUserName: '',
            ReturnByUserName: '', Status: '', PaidAmount: '',
            PaymentTypeId: ''
        };

    ngOnInit(): void {
        const today = new Date();
        this.setMinAndMaxDate(today);
        this.todayDate = this.parseCustomDateStringForUI(today);
        this.loggedInUserDetails = this.authService.userData() ?? {};

        this.loadBooks();
        this.loadUserDetails();
        this.loadTransactionDetails();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['showDialog'] && changes['showDialog'].currentValue) {
            this.openDialog();
        }
    }

    private openDialog(): void {
        this.isIssueNewBook = false;
        this.isOverDue = false;
        this.isReturnBook = false;

        if (this.bc) {
            this.bindOnlyActiveDetails();

            if (this.bc.IssuedDate != null && this.bc.IssuedDate !== '') {
                this.setMinAndMaxDate(new Date(this.bc.IssuedDate));
            }
            else {
                const today = new Date();
                this.setMinAndMaxDate(today);
            }

            this.selectedBook = { ...this.bc };

            if (this.bc.IssuedDate != null && this.bc.IssuedDate !== '') {
                this.selectedBook.IssuedDate = this.parseCustomDateStringForUI(new Date(this.bc.IssuedDate));
            }

            if (this.bc.ReturnDate != null && this.bc.ReturnDate !== '') {
                this.selectedBook.ReturnDate = this.parseCustomDateStringForUI(new Date(this.bc.ReturnDate));
            }
            else {
                this.selectedBook.ReturnDate = this.todayDate;
            }

            if (this.bc.OverDueFrom != null && this.bc.OverDueFrom !== '') {
                this.selectedBook.OverDueFrom = this.parseCustomDateStringForUI(new Date(this.bc.OverDueFrom));
            }

            if (this.selectedBook.OverDueId != null && this.selectedBook.OverDueId > 0) {
                this.isOverDue = true;
            }

            if (this.type === 'CheckIn') {
                this.selectedBook.Status = 'Returned';
            }

            this.returnByDifferentUser();

            if (this.bc.Status === 'Issued') {
                this.header = 'Update Issued Book Details';
            }
            else {
                this.header = 'Update Returned Book Details';
            }
        }
        else {
            this.bindOnlyActiveDetails();

            const today = new Date();
            this.setMinAndMaxDate(today);

            this.selectedBook = {
                BookCirculationId: 0, BookId: 0, BookName: '',
                BorrowerId: 0, BorrowerName: '', IssuedByUserId: 0,
                IssuedByUserName: '', IssuedDate: '', OverDueId: 0,
                FineAmount: 0.0, OverDueFrom: '', OverDueDays: 0,
                OverDueStatus: '', SytemUpdatedDate: '',
                ReturnByUserId: 0, ReturnByUserName: '', ReturnDate: '',
                Comments: '', Status: '',
                UpdatedByUserId: 0, UpdatedByUserName: '', UpdatedDate: '',
                BorrowerMailId: '', IssuedByUserMailId: '', ReturnByUserMailId: '',
                UpdatedByUserMailId: '', PaidAmount: 0, PaymentTypeId: 0
            };

            this.header = 'Issue book';
        }

        this.onStatusChange();

        this.errors = {
            BookName: '', BorrowerName: '', IssuedByUserName: '',
            ReturnByUserName: '', Status: '', PaidAmount: '',
            PaymentTypeId: ''
        };

        this.bcDialogVisible = true;
    }

    bindOnlyActiveDetails(): void {
        if (this.isIssueNewBook) {
            this.userOptions = this.lstUserDetails.filter(x => x.IsActive == true && x.FullName?.trim() != '').map(usr => {
                return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
            });

            this.bookOptions = this.lstBookDetails.filter(x => x.Status == "Available").map(book => {
                return { label: book.BookName ?? '', value: book.BookId };
            });
        }
        else {
            this.userOptions = this.lstUserDetails.filter(x => x.FullName?.trim() != '').map(usr => {
                return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
            });

            this.bookOptions = this.lstBookDetails.map(book => {
                return { label: book.BookName ?? '', value: book.BookId };
            });
        }
    }

    setMinAndMaxDate(dateStr: Date): void {
        const yesterday = new Date();
        yesterday.setDate(dateStr.getDate() - 1);

        this.minDate = yesterday;
        this.maxDate = new Date();
    }

    parseCustomDateStringForAPI(dateStr: string): string | null {
        if (!dateStr) return null;

        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[2], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[0], 10);

        const nativeDate = new Date(year, month, day);
        return nativeDate.toISOString();
    }

    parseCustomDateStringForUI(dateStr: Date): string {
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0');
        const year = dateStr.getFullYear();

        return `${year}-${month}-${day}`;
    }

    loadBooks(): void {
        this.bookService.getAllBookDetails().subscribe({
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
        this.userService.getAllUserDetails().subscribe({
            next: (data: UserDetails[]) => {
                this.lstUserDetails = data;
                this.userOptions = data.filter(x => x.FullName?.trim() != '').map(usr => {
                    return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                });
            },
            error: (err) => {
                console.error('Error loading users:', err);
            }
        });
    }

    loadTransactionDetails(): void {
        this.ttService.getTransactionTypeDetails().subscribe({
            next: (data: TransactionTypeDetails[]) => {
                this.transactionTypeOptions = data.filter(x => x.TypeName?.trim() != '').map(usr => {
                    return { label: usr.TypeName ?? '', value: usr.TypeId ?? 0 };
                });
            },
            error: (err) => {
                console.error('Error loading transaction type details:', err);
            }
        });
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
            case 'PaidAmount':
                if (this.selectedBook.OverDueId != null && this.selectedBook.OverDueId > 0 && this.selectedBook.FineAmount != null && this.selectedBook.FineAmount > 0 && this.selectedBook.OverDueStatus == "Paid" && this.selectedBook.PaidAmount == null) {
                    this.errors.PaidAmount = 'Paid amount is required.';
                    isValid = false;
                } else {
                    this.errors.PaidAmount = '';
                }
                break;
            case 'PaymentType':
                if (this.selectedBook.OverDueId != null && this.selectedBook.OverDueId > 0 && this.selectedBook.OverDueStatus == "Paid" && !(this.selectedBook.PaymentTypeId != null && this.selectedBook.PaymentTypeId > 0)) {
                    this.errors.PaymentTypeId = 'PaymentType is required.';
                    isValid = false;
                } else {
                    this.errors.PaymentTypeId = '';
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
        const isPaidAmountValid = this.validateInput('PaidAmount');
        const isPaymentTypeValid = this.validateInput('PaymentType');

        return isBookNameValid && isBorrowerNameValid && isIssuedByUserNameValid && isStatusValid && isReturnByUserNameValid && isPaidAmountValid && isPaymentTypeValid;

    }

    saveBcDetails(): void {
        if (!this.validateBcDetails()) {
            return;
        }

        if (this.selectedBook.Status == "Returned") {
            this.returnBook();
        }
        else if (this.selectedBook.BookCirculationId > 0) {
            this.updateBcBook();
        }
        else {
            this.issueBook();
        }
    }

    issueBook(): void {
        let _issuedBook = { ...this.selectedBook };
        _issuedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");

        this.bcService.issueBook(_issuedBook).subscribe({
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

                    this.bcDialogVisible = false;
                    this.onSuccess.emit();
                }
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

    updateBcBook(): void {
        let _issuedBook = { ...this.selectedBook };
        _issuedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");

        if (_issuedBook.Status == "Issued" && _issuedBook.ReturnByUserId != null && _issuedBook.ReturnByUserId > 0) {
            _issuedBook.ReturnByUserId = null;
            _issuedBook.ReturnByUserName = null;
            _issuedBook.ReturnByUserMailId = null;
        }

        _issuedBook.UpdatedByUserId = this.loggedInUserDetails.UserId;
        _issuedBook.UpdatedByUserMailId = this.loggedInUserDetails.MailId;
        _issuedBook.UpdatedByUserName = this.loggedInUserDetails.FullName;

        this.bcService.updateBookCirculation(_issuedBook).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book circulation - Failed',
                        detail: res ? res.Message : 'Failed to Issue book. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book circulation - Success',
                        detail: 'Updated Book circulation successfully.'
                    });

                    this.bcDialogVisible = false;
                    this.onSuccess.emit();
                }
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

    returnBook(): void {
        let _returnedBook = { ...this.selectedBook };
        _returnedBook.IssuedDate = this.parseCustomDateStringForAPI(this.selectedBook.IssuedDate ?? "");
        _returnedBook.ReturnDate = this.parseCustomDateStringForAPI(this.selectedBook.ReturnDate ?? "");
        _returnedBook.UpdatedByUserId = this.loggedInUserDetails.UserId;

        if (_returnedBook.OverDueId == null || _returnedBook.OverDueId == 0) {
            _returnedBook.PaidAmount = 0;
            _returnedBook.PaymentTypeId = 0;
        }

        this.bcService.returnBook(this.selectedBook).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book circulation - Failed',
                        detail: res ? res.Message : 'Failed to Return book. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book circulation - Success',
                        detail: 'Updated Book circulation successfully.'
                    });

                    this.bcDialogVisible = false;
                    this.onSuccess.emit();
                }
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

    onBookChange(): void {
        const book = this.bookOptions.find(l => l.value === this.selectedBook.BookId);
        if (book) {
            this.selectedBook.BookName = book.label;
        }

        this.validateInput('BookName');
    }

    onBorrowerChange(): void {
        const _borrower = this.lstUserDetails.find(l => l.UserId === this.selectedBook.BorrowerId);
        if (_borrower) {
            this.selectedBook.BorrowerName = _borrower.FullName;
            this.selectedBook.BorrowerMailId = _borrower.MailId;
        }

        this.validateInput('BorrowerName');
    }

    onIssuedChange(): void {
        const _issuedBy = this.lstUserDetails.find(l => l.UserId === this.selectedBook.IssuedByUserId);
        if (_issuedBy) {
            this.selectedBook.IssuedByUserName = _issuedBy.FullName;
            this.selectedBook.IssuedByUserMailId = _issuedBy.MailId;
        }

        this.validateInput('IssuedByUserName');
    }

    onStatusChange(): void {
        if (this.selectedBook.Status == "Returned") {
            this.isReturnBook = true;
        }
        else {
            this.isReturnBook = false;
        }

        this.validateInput('Status');
    }

    onReturnedChange(): void {
        const _returnedBy = this.lstUserDetails.find(l => l.UserId === this.selectedBook.ReturnByUserId);
        if (_returnedBy) {
            this.selectedBook.ReturnByUserName = _returnedBy.FullName;
            this.selectedBook.ReturnByUserMailId = _returnedBy.MailId;
        }

        this.validateInput('ReturnByUserName');
    }

    returnByDifferentUser(): void {
        if (this.isReturnByDifferentUser) {
            this.selectedBook.ReturnByUserName = null;
            this.selectedBook.ReturnByUserId = null;
            this.selectedBook.ReturnByUserMailId = null;
        }
        else {
            this.selectedBook.ReturnByUserName = this.selectedBook.IssuedByUserName;
            this.selectedBook.ReturnByUserId = this.selectedBook.IssuedByUserId;
            this.selectedBook.ReturnByUserMailId = this.selectedBook.IssuedByUserMailId;
        }

        this.validateInput('ReturnByUserName');
    }

    hideDialog(): void {
        this.onDialogClose.emit();
    }
}
