import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { Select, SelectModule } from 'primeng/select';
import { environment } from '../../../../environments/environment';
import { AutoFocusModule } from 'primeng/autofocus';

@Component({
    selector: 'app-issue-return-books',
    imports: [
        CommonModule, ButtonModule, CheckboxModule, FormsModule,
        DialogModule, InputTextModule, SelectModule, AutoFocusModule,
        DatePickerModule
    ],
    templateUrl: './issue-return-books.component.html',
    styleUrl: './issue-return-books.component.scss'
})
export class IssueReturnBooksComponent implements OnChanges {
    @Input() public bc: BookCirculationDetails | null = null;
    @Input() public type: string = "";
    @Input() public showDialog: boolean = false;
    @Input() public isViewOnly: boolean = false;
    @Input() public selectedBorrower: UserDetails | null = null;
    @Output() private onSuccess: EventEmitter<void> = new EventEmitter<void>();
    @Output() private onDialogClose: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('borrwerDropdown', { read: ElementRef }) borrowerDropdown!: ElementRef;
    @ViewChild('bookDropdown', { read: ElementRef }) bookDropdown!: ElementRef;

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
    public issueDate: Date | null = null;
    public returnDate: Date | null = null;
    public overdueFrom: Date | null = null;
    public actualOverDueDate: Date | null = null;
    public extendedDate: Date | null = null;

    public bcDialogVisible = false;
    public isReturnByDifferentUser: boolean = false;
    public isReturnBook: boolean = true;
    public isOverDue: boolean = false;
    public isIssueNewBook: boolean = false;

    public loggedInUserDetails: UserDetails | null = null;
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
        IssuedByUserName: '', IssuedDate: '', ActualOverDueDate:'',
        ExtendedDate: '', OverDueId: 0, FineAmount: 0.0, OverDueFrom: '', OverDueDays: 0,
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

    
    private barcodeBuffer: string = '';
    private lastKeyTime: number = Date.now();

    constructor() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.minDate = new Date();
        this.maxDate = new Date();
        this.todayDate = today.toISOString();
        this.loggedInUserDetails = this.authService.userData() ?? this.authService.userDataTemp;

        this.loadBooks();
        this.loadUserDetails();
        this.loadTransactionDetails();

        console.log('ngOnInit() --> this.selectedBorrower :', this.selectedBorrower);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['showDialog'] && changes['showDialog'].currentValue) {
            this.openDialog();
        }
    }

//     ngAfterViewInit() {
//     this.setFocus();
//   }

  setFocus() {
    // console.log('this.bc?.BookId :', this.bc?.BookId);
    if(this.isViewOnly == false)
    {
        if(this.bc?.BookId !=null && this.bc?.BookId >0)
        {
            // console.log('borrwerDropdown.Focus()');        
            // Small timeout guarantees the DOM is fully painted and active
            setTimeout(() => {
                // Find the editable input text box inside PrimeNG's component structure
                const inputElement = this.borrowerDropdown.nativeElement.querySelector('.p-select-label-input, input');
                
                if (inputElement) {
                inputElement.focus();
                inputElement.select(); // Optional: selects existing text for easy overwrite scanning
                }
            }, 50);

        }
        else{
            // console.log('bookDropdown.Focus()');
        
            setTimeout(() => {
                    // Find the editable input text box inside PrimeNG's component structure
                    const inputElement = this.bookDropdown.nativeElement.querySelector('.p-select-label-input, input');
                    
                    if (inputElement) {
                    inputElement.focus();
                    inputElement.select(); // Optional: selects existing text for easy overwrite scanning
                    }
                }, 50);

        }
    }
    
  }

    private openDialog(): void {
        this.isIssueNewBook = false;
        this.isOverDue = false;
        this.isReturnBook = false;

        if (this.bc) {
            this.selectedBook = { ...this.bc };

            if (this.selectedBook.ReturnDate === null || this.selectedBook.ReturnDate === '') {
                this.selectedBook.ReturnDate = this.todayDate;
            }

            if (this.selectedBook.OverDueId != null && this.selectedBook.OverDueId > 0) {
                this.isOverDue = true;
            }

            if (this.type === 'CheckIn') {
                this.selectedBook.Status = 'Returned';
                this.selectedBook.ReturnDate = this.todayDate;
            }

            if (this.selectedBook.IssuedDate && this.selectedBook.ReturnDate) {
                this.minDate = new Date(this.selectedBook.IssuedDate);
                this.maxDate = new Date(this.selectedBook.ReturnDate);
            }

            this.returnByDifferentUser();

            if (this.isViewOnly) {
                if (this.selectedBook.Status === 'Issued') {
                    this.header = 'View Issued Book Details';
                }
                else {
                    this.header = 'View Returned Book Details';
                }
            }
            else {
                if (this.selectedBook.Status === 'Issued' && (this.selectedBook.BookCirculationId == null || this.selectedBook.BookCirculationId == 0)) {
                    this.header = 'Issue Book';
                    this.isIssueNewBook = true;
                }
                else if (this.selectedBook.Status === 'Issued' && this.selectedBook.BookCirculationId > 0) {
                    this.header = 'Update Issued Book Details';
                }
                else if (this.selectedBook.Status === 'Returned' && this.selectedBook.BookCirculationId > 0) {
                    this.header = 'Return Book Details';
                }
                else {
                    this.header = 'Update Returned Book Details';
                }
            }

            console.log('openDialog(if) --> this.isIssueNewBook :', this.isIssueNewBook);

            this.bindOnlyActiveDetails();

            this.issueDate = this.selectedBook.IssuedDate ? new Date(this.selectedBook.IssuedDate) : null;
            this.returnDate = this.selectedBook.ReturnDate ? new Date(this.selectedBook.ReturnDate) : null;
            this.overdueFrom = this.selectedBook.OverDueFrom ? new Date(this.selectedBook.OverDueFrom) : null;
            this.actualOverDueDate = this.selectedBook.ActualOverDueDate ? new Date(this.selectedBook.ActualOverDueDate) : null;
            this.extendedDate = this.selectedBook.ExtendedDate ? new Date(this.selectedBook.ExtendedDate) : null;
        }
        else {
            this.isIssueNewBook = true;

            console.log('openDialog(if) --> this.isIssueNewBook :', this.isIssueNewBook);

            this.bindOnlyActiveDetails();

            this.minDate = new Date();
            this.maxDate = new Date();

            this.selectedBook = {
                BookCirculationId: 0, BookId: 0, BookName: '',
                BorrowerId: 0, BorrowerName: '', IssuedByUserId: this.loggedInUserDetails?.UserId,
                IssuedByUserName: this.loggedInUserDetails?.FullName, IssuedDate: this.todayDate,
                ActualOverDueDate : '', ExtendedDate:'', OverDueId: 0,
                FineAmount: 0.0, OverDueFrom: '', OverDueDays: 0,
                OverDueStatus: '', SytemUpdatedDate: '',
                ReturnByUserId: 0, ReturnByUserName: '', ReturnDate: '',
                Comments: '', Status: 'Issued',
                UpdatedByUserId: 0, UpdatedByUserName: '', UpdatedDate: '',
                BorrowerMailId: '', IssuedByUserMailId: '', ReturnByUserMailId: '',
                UpdatedByUserMailId: '', PaidAmount: 0, PaymentTypeId: 0
            };

            if (this.selectedBorrower != null && this.selectedBorrower?.UserId != null && this.selectedBorrower.UserId > 0) {
                this.selectedBook.IssuedByUserId = this.selectedBorrower.UserId;
                this.selectedBook.IssuedByUserName = this.selectedBorrower.FullName;
                this.selectedBook.IssuedByUserMailId = this.selectedBorrower.MailId;
            }

            this.header = 'Issue book';
        }

        this.onStatusChange();

        this.errors = {
            BookName: '', BorrowerName: '', IssuedByUserName: '',
            ReturnByUserName: '', Status: '', PaidAmount: '',
            PaymentTypeId: ''
        };

        this.bcDialogVisible = true;
        // this.setFocus();
    }

    bindOnlyActiveDetails(): void {
        console.log('bindOnlyActiveDetails() --> this.isIssueNewBook :', this.isIssueNewBook);
        console.log('bindOnlyActiveDetails() --> this.lstUserDetails :', this.lstUserDetails);

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

        console.log('bindOnlyActiveDetails() --> this.bookOptions :', this.bookOptions);
    }

    loadBooks(): void {
        this.bookService.getAllBookDetails().subscribe({
            next: (data: BookDetails[]) => {
                this.lstBookDetails = data;
                if (this.isIssueNewBook) {
                    this.bookOptions = this.lstBookDetails
                            .filter(x => x.Status === "Available" && x.IsActive === true)
                            .map(book => {
                                const bookName = book.BookName ?? '';
                                const accessionNo = book.AccessionNo ? `(${book.AccessionNo})` : '';
        
        return { 
            label: `${bookName}${accessionNo}` || 'Unnamed Book', 
            value: book.BookId 
        };
    });

                }
                else {
                    this.bookOptions = data.map(book => {
                        return { label: book.BookName ?? '', value: book.BookId };
                    });
                }
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

                if (this.isIssueNewBook) {
                    this.userOptions = data.filter(x => x.IsActive == true && x.FullName?.trim() != '').map(usr => {
                        return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                    });

                }
                else {
                    this.userOptions = data.filter(x => x.FullName?.trim() != '').map(usr => {
                        return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                    });
                }
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

        console.log('this.selectedBook :', this.selectedBook);

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

        if (_issuedBook.Status == "Issued" && _issuedBook.ReturnByUserId != null && _issuedBook.ReturnByUserId > 0) {
            _issuedBook.ReturnByUserId = null;
            _issuedBook.ReturnByUserName = null;
            _issuedBook.ReturnByUserMailId = null;
        }

        _issuedBook.UpdatedByUserId = this.loggedInUserDetails?.UserId;
        _issuedBook.UpdatedByUserMailId = this.loggedInUserDetails?.MailId;
        _issuedBook.UpdatedByUserName = this.loggedInUserDetails?.FullName;

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
        _returnedBook.UpdatedByUserId = this.loggedInUserDetails?.UserId;

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

    onIssueDateChange(): void {
        if (this.issueDate) {
            this.selectedBook.IssuedDate = this.issueDate.toISOString();
        }
        else {
            this.selectedBook.IssuedDate = null;
        }
    }

    onReturnDateChange(): void {
        if (this.returnDate) {
            this.selectedBook.ReturnDate = this.returnDate.toISOString();
        }
        else {
            this.selectedBook.ReturnDate = null;
        }
    }

    onOverdueFromChange(): void {
        if (this.overdueFrom) {
            this.selectedBook.OverDueFrom = this.overdueFrom.toISOString();
        }
        else {
            this.selectedBook.OverDueFrom = null;
        }
    }

    onExtendedDateChange(): void {
        if (this.extendedDate) {
            this.selectedBook.ExtendedDate = this.extendedDate.toISOString();
        }
        else {
            this.selectedBook.ExtendedDate = null;
        }
    }

    hideDialog(): void {
        this.onDialogClose.emit();
    }

    onUserKeydown(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        const currentTime = Date.now();
        
        // 1. Completely ignore modifier keys so they don't corrupt the string buffer
        if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(keyboardEvent.key)) {
            return;
        }

        // 2. Always permit functional layout navigation keys
        if (['Backspace', 'Tab', 'ArrowDown', 'ArrowUp'].includes(keyboardEvent.key)) {
            return;
        }

        // 3. Process the complete barcode when Enter is fired
        if (keyboardEvent.key === 'Enter') {
            keyboardEvent.preventDefault(); 
            this.processScannedUserBarcode(keyboardEvent);
            return;
        }

        // 4. Measure time between keys to distinguish scanner vs human
        const timeDiff = currentTime - this.lastKeyTime;
        this.lastKeyTime = currentTime;

        // Scanners drop keys within 0-40ms of each other.
        if (timeDiff > 50) {
            // If the buffer is empty, this is the FIRST valid character of the scan stream.
            if (this.barcodeBuffer.length === 0) {
                this.barcodeBuffer += keyboardEvent.key;
            } else {
                // Human is typing subsequent characters slowly. Block it.
                keyboardEvent.preventDefault();
                return;
            }
        } else {
            // High-speed data stream detected (Scanner). Collect the character.
            this.barcodeBuffer += keyboardEvent.key;
        }

        // Prevent characters from visibly rendering inside the input field until validated
        keyboardEvent.preventDefault();
    }

// 3. New separate processing logic to handle the clean buffer
    private processScannedUserBarcode(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        const searchTerm = this.barcodeBuffer.trim();
        
        console.log('Collected Barcode Buffer:', searchTerm);

        // Reset buffer instantly for the next scan cycle
        this.barcodeBuffer = '';

        if (!searchTerm) return;

        if (searchTerm.includes(environment.usersBarcodeSyntax)) {
            let matchedUser = this.lstUserDetails.filter(x => x.UserBarcode === searchTerm);

            if (matchedUser && matchedUser.length > 0) {
                this.selectedBook.BorrowerId = matchedUser[0].UserId;
                
                // Sync the visible PrimeNG UI input display text with the matched label
                if (target) {
                    target.value = matchedUser[0].FullName || ''; 
                }
                
                this.onBorrowerChange();
            } else {
                console.warn('User not found for barcode:', searchTerm);
                if (target) target.value = '';
            }
        } else {
            // If it doesn't match your barcode syntax rules, clear the field
            if (target) target.value = '';
        }
    }

    onBookKeydown(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        const currentTime = Date.now();
        
        // 1. Completely ignore modifier keys so they don't corrupt the string buffer
        if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(keyboardEvent.key)) {
            return;
        }

        // 2. Always permit functional layout navigation keys
        if (['Backspace', 'Tab', 'ArrowDown', 'ArrowUp'].includes(keyboardEvent.key)) {
            return;
        }

        // 3. Process the complete barcode when Enter is fired
        if (keyboardEvent.key === 'Enter') {
            keyboardEvent.preventDefault(); 
            this.processScannedBookBarcode(keyboardEvent);
            return;
        }

        // 4. Measure time between keys to distinguish scanner vs human
        const timeDiff = currentTime - this.lastKeyTime;
        this.lastKeyTime = currentTime;

        // Scanners drop keys within 0-40ms of each other.
        if (timeDiff > 50) {
            // If the buffer is empty, this is the FIRST valid character of the scan stream.
            if (this.barcodeBuffer.length === 0) {
                this.barcodeBuffer += keyboardEvent.key;
            } else {
                // Human is typing subsequent characters slowly. Block it.
                keyboardEvent.preventDefault();
                return;
            }
        } else {
            // High-speed data stream detected (Scanner). Collect the character.
            this.barcodeBuffer += keyboardEvent.key;
        }

        // Prevent characters from visibly rendering inside the input field until validated
        keyboardEvent.preventDefault();
    }

    private processScannedBookBarcode(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        const searchTerm = this.barcodeBuffer.trim();
        
        console.log('Collected Barcode Buffer:', searchTerm);

        // Reset buffer instantly for the next scan cycle
        this.barcodeBuffer = '';

        if (!searchTerm) return;

        if (searchTerm.includes(environment.booksBarcodeSyntax)) {
            let matchedBook = this.lstBookDetails.filter(x => x.BookBarcode === searchTerm);

            if (matchedBook && matchedBook.length > 0) {
                this.selectedBook.BookId = matchedBook[0].BookId;
                
                // Sync the visible PrimeNG UI input display text with the matched label
                if (target) {
                    target.value = matchedBook[0].BookName || ''; 
                }
                
                this.onBookChange();
            } else {
                console.warn('Book not found for barcode:', searchTerm);
                if (target) target.value = '';
            }
        } else {
            // If it doesn't match your barcode syntax rules, clear the field
            if (target) target.value = '';
        }
    }
}
