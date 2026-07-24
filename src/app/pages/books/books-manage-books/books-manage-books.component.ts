import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { BookService } from '@services/book.service';
import { AuthorDetails, BookCirculationDetails, BookDetails, BuildingDetails, CategoryDetails, FloorDetails, LanguageDetails, PublisherDetails, RackDetails, SubjectDetails, UserDetails } from '@app/shared/models/api.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthorService } from '@app/shared/services/author.service';
import { PublisherService } from '@app/shared/services/publisher.service';
import { CategoryService } from '@app/shared/services/category.service';
import { LanguageService } from '@app/shared/services/language.service';
import { BuildingService } from '@app/shared/services/building.service';
import { FloorService } from '@app/shared/services/floor.service';
import { RackService } from '@app/shared/services/rack.service';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { BooksViewCirculationComponent } from '../books-view-circulation/books-view-circulation.component';
import { NgxBarcode6 } from 'ngx-barcode6';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { AuthService } from '@app/shared/services/auth.service';
import { IssueReturnBooksComponent } from '@app/pages/checkout/issue-return-books/issue-return-books.component';
import { ManageWishlistComponent } from '../manage-wishlist/manage-wishlist.component';
import { AddWishlistComponent } from '../add-wishlist/add-wishlist.component';
import { environment } from '../../../../environments/environment';
import { UserService } from '@app/shared/services/user.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SubjectService } from '@app/shared/services/subject.service';

type ImportBookDetails = BookDetails & {
    Error: string;
};

@Component({
    selector: 'app-books-manage-books',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, DatePickerModule, TooltipModule, TabViewModule, BooksViewCirculationComponent, NgxBarcode6, IssueReturnBooksComponent,
         ManageWishlistComponent, AddWishlistComponent, ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: './books-manage-books.component.html',
    styleUrl: './books-manage-books.component.scss'
})
export class BooksManageBooksComponent implements OnInit {
    @Input() public searchTerm: string = '';
    @ViewChild('userInput') set userInputElement(content: ElementRef<HTMLInputElement>) {
    if (content && content.nativeElement) {
        setTimeout(() => {
            content.nativeElement.focus();
        }, 150); // Slightly longer delay to bypass heavy framework rendering
        }
    }

    private messageService = inject(MessageService);
    private bookService = inject(BookService);
    private authorService = inject(AuthorService);
    private publisherService = inject(PublisherService);
    private categoryService = inject(CategoryService);
    private languageService = inject(LanguageService);
    private buildingService = inject(BuildingService);
    private floorService = inject(FloorService);
    private rackService = inject(RackService);
    private _bcService = inject(BookCirculationService);
    public _authService = inject(AuthService);
    public userService = inject(UserService);
    public subjectService = inject(SubjectService);
    private confirmationService = inject(ConfirmationService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public books: BookDetails[] = [];
    public authors: AuthorDetails[] = [];
    public publishers: PublisherDetails[] = [];
    public categories: CategoryDetails[] = [];
    public subjects: SubjectDetails[] = [];
    public languages: LanguageDetails[] = [];
    public buildings: BuildingDetails[] = [];
    public floors: FloorDetails[] = [];
    public racks: RackDetails[] = [];
    public showFt: boolean = false;
    public bookNameList: { label: string, value: string }[] = [];
    public authorNameList: { label: string, value: string }[] = [];
    public publisherNameList: { label: string, value: string }[] = [];
    public categoryNameList: { label: string, value: string }[] = [];
    public languageNameList: { label: string, value: string }[] = [];
    public publishedYearList: { label: number, value: number }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedBookNameList: string[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedPublisherNameList: string[] = [];
    public selectedCategoryNameList: string[] = [];
    public selectedLanguageNameList: string[] = [];
    public selectedPublishedYearList: number[] = [];
    public selectedStatusList: boolean[] = [];
    public bookDialogVisible = false;
    public header: string = '';
    public publishedDate: Date | null = null;
    public currentBook: BookDetails = {
        BookId: 0,
        BookName: '',
        AuthorId: null,
        AuthorName: '',
        PublisherId: null,
        PublisherName: '',
        CategoryId: null,
        CategoryName: '',
        LanguageId: null,
        LanguageName: '',
        PublishedYear: null,
        Price: 0,
        BillNo: '',
        CallNo: '',
        AccessionNo: '',
        Source: '',
        SubjectId: 0,
        SubjectName: '',
        Status: 'Available',
        BuildingId: null,
        BuildingName: '',
        FloorId: null,
        FloorNumber: null,
        FloorName: '',
        RackId: null,
        RackNumber: 0,
        RackLabel: '',
        BookBarcode: '',
        IsActive: null
    };
    public errors: {
        BookName: string,
        AuthorId: string,
        PublisherId: string,
        CategoryId: string,
        LanguageId: string,
        PublishedYear: string,
        Price: string,
        BuildingId: string,
        FloorId: string,
        RackId: string,
        SubjectId: string,
        BookBarcode: string,
        IsActive: string
    } = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            BookBarcode: '',
            IsActive: ''
        };
    public authorOptions: { label: string; value: number; }[] = [];
    public publisherOptions: { label: string; value: number; }[] = [];
    public categoryOptions: { label: string; value: number; }[] = [];
    public subjectOptions: { label: string; value: number; }[] = [];
    public languageOptions: { label: string; value: number; }[] = [];
    public buildingOptions: { label: string; value: number; }[] = [];
    public floorOptions: { label: string; value: number; }[] = [];
    public rackOptions: { label: string; value: number; }[] = [];
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importIndex: number = -1;
    public importBookDialogVisible = false;
    public importDialogVisible: boolean = false;
    public importPreview: ImportBookDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importBookNameList: { label: string, value: string }[] = [];
    public importAuthorNameList: { label: string, value: string }[] = [];
    public importPublisherNameList: { label: string, value: string }[] = [];
    public importCategoryNameList: { label: string, value: string }[] = [];
    public importLanguageNameList: { label: string, value: string }[] = [];
    public importPublishedYearList: { label: number, value: number }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importBillNoList: { label: string, value: string }[] = [];
    public importCallNoList: { label: string, value: string }[] = [];
    public importAccessionNoList: { label: string, value: string }[] = [];
    public importSourceList: { label: string, value: string }[] = [];
    public importSubjectList: { label: number, value: number }[] = [];

    public importSelectedBookNameList: string[] = [];
    public importSelectedAuthorNameList: string[] = [];
    public importSelectedPublisherNameList: string[] = [];
    public importSelectedCategoryNameList: string[] = [];
    public importSelectedLanguageNameList: string[] = [];
    public importSelectedPublishedYearList: number[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];
    public importSelectedBillNoList: string[] = [];
    public importSelectedCallNoList: string[] = [];
    public importSelectedAccessionNoList: string[] = [];
    public importSelectedSourceList: string[] = [];
    public importSelectedSubjectList: number[] = [];

    public activeTab: number = 0;

    public selectedBookDetails: BookDetails[] = [];
    public selectedIds: number[] = [];
    public printBarcodeDialogVisible: boolean = false;
    public isViewOnly: boolean = false;

    public loggedInUserDetails: UserDetails | null = null;
    public bc: BookCirculationDetails | null = null;
    public type: string = '';
    public bcDialogVisible: boolean = false;
    public todayDate: string | undefined;
    public addWishlistDialogVisible: boolean = false;
    public isBarcodeSearch : boolean = false;
    public searchUserTerm: string = '';
    public lstUserDetails: UserDetails[] = [];

    ngOnInit(): void {
        const today = new Date();
        this.todayDate = this.parseCustomDateStringForUI(today);

        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.loadBooks();
        this.loadAuthors();
        this.loadPublishers();
        this.loadCategories();
        this.loadSubjects();
        this.loadLanguages();
        this.loadBuildings();
        this.loadFloors();
        this.loadRacks();
        this.loadUserDetails();
    }

    // private focusUserInput(): void {
    //     if (this.userInput && this.userInput.nativeElement) {
    //     // Wrap in a microtask timeout to clear the browser's execution stack 
    //     // and avoid ExpressionChangedAfterItHasBeenCheckedError
    //     setTimeout(() => {
    //         this.userInput.nativeElement.focus();
    //     }, 100);
    //     }
    // }

    // ngAfterViewInit(): void {
    //     console.log('this.isBarcodeSearch :', this.isBarcodeSearch);
    //     // if(this.isBarcodeSearch)
    //         this.focusUserInput();
    // }

    loadBooks(updateCurrentBook: boolean = false): void {

        // this.isBarcodeSearch = false;

        if (this.searchTerm) {
            this.bookService.searchBookDetails(this.searchTerm).subscribe({
                next: (data: BookDetails[]) => {
                    this.books = data;
                    this.initializeFilterLists();

                    if(this.books !=null && this.books.length ==1 )
                    {
                        this.isBarcodeSearch = true;
                        this.currentBook = {...this.books[0]};                        
                    }

                    if (updateCurrentBook) {
                        if (this.currentBook.BookId) {
                            const index = this.books.findIndex(e => e.BookId === this.currentBook.BookId);
                            if (index >= 0) {
                                if (this.isViewOnly) {
                                    this.viewBook(this.books[index]);
                                }
                                else {
                                    this.editBook(this.books[index]);
                                }
                            }
                        }
                    }
                },
                error: (err) => {
                    console.error('Error loading books:', err);
                }
            });
        }
        else {
            this.bookService.getAllBookDetails().subscribe({
                next: (data: BookDetails[]) => {
                    this.books = data;
                    this.initializeFilterLists();

                    if (updateCurrentBook) {
                        if (this.currentBook.BookId) {
                            const index = this.books.findIndex(e => e.BookId === this.currentBook.BookId);
                            if (index >= 0) {
                                if (this.isViewOnly) {
                                    this.viewBook(this.books[index]);
                                }
                                else {
                                    this.editBook(this.books[index]);
                                }
                            }
                        }
                    }
                },
                error: (err) => {
                    console.error('Error loading books:', err);
                }
            });
        }
    }

    loadAuthors(): void {
        this.authorService.getAuthorDetails().subscribe({
            next: (data: AuthorDetails[]) => {
                this.authors = data;
                this.authorOptions = data.filter(x => x.IsActive == true).map(author => {
                    return { label: author.AuthorName ?? '', value: author.AuthorId };
                });
            },
            error: (err) => {
                console.error('Error loading authors:', err);
            }
        });
    }

    loadPublishers(): void {
        this.publisherService.getPublisherDetails().subscribe({
            next: (data: PublisherDetails[]) => {
                this.publishers = data;
                this.publisherOptions = data.filter(x => x.IsActive == true).map(publisher => {
                    return { label: publisher.PublisherName ?? '', value: publisher.PublisherId };
                });
            },
            error: (err) => {
                console.error('Error loading publishers:', err);
            }
        });
    }

    loadCategories(): void {
        this.categoryService.getCategoryDetails().subscribe({
            next: (data: CategoryDetails[]) => {
                this.categories = data;
                this.categoryOptions = data.filter(x => x.IsActive == true).map(category => {
                    return { label: category.CategoryName ?? '', value: category.CategoryId };
                });
            },
            error: (err) => {
                console.error('Error loading categories:', err);
            }
        });
    }

    loadSubjects(): void {
        this.subjectService.getSubjectDetails().subscribe({
            next: (data: SubjectDetails[]) => {
                this.subjects = data;
                this.subjectOptions = data.filter(x => x.IsActive == true).map(subject => {
                    return { label: subject.SubjectName ?? '', value: subject.SubjectId };
                });
            },
            error: (err) => {
                console.error('Error loading subjects:', err);
            }
        });
    }

    loadLanguages(): void {
        this.languageService.getLanguageDetails().subscribe({
            next: (data: LanguageDetails[]) => {
                this.languages = data;
                this.languageOptions = data.filter(x => x.IsActive == true).map(language => {
                    return { label: language.LanguageName ?? '', value: language.LanguageId };
                });
            },
            error: (err) => {
                console.error('Error loading languages:', err);
            }
        });
    }

    loadBuildings(): void {
        this.buildingService.getAllBuildingDetails().subscribe({
            next: (data: BuildingDetails[]) => {
                this.buildings = data;
                this.buildingOptions = data.filter(x => x.IsActive == true).map(building => {
                    return { label: building.BuildingName ?? '', value: building.BuildingId };
                });
            },
            error: (err) => {
                console.error('Error loading buildings:', err);
            }
        });
    }

    loadFloors(): void {
        this.floorService.getAllFloorDetails().subscribe({
            next: (data: FloorDetails[]) => {
                this.floors = data;
            },
            error: (err) => {
                console.error('Error loading floors:', err);
            }
        });
    }

    loadRacks(): void {
        this.rackService.getAllRackDetails().subscribe({
            next: (data: RackDetails[]) => {
                this.racks = data;
            },
            error: (err) => {
                console.error('Error loading racks:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.books.map(book => book.BookName))]
            .map(e => ({ label: e!, value: e! }));
        this.authorNameList = [...new Set(this.books.map(book => book.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.publisherNameList = [...new Set(this.books.map(book => book.PublisherName))]
            .map(e => ({ label: e!, value: e! }));
        this.categoryNameList = [...new Set(this.books.map(book => book.CategoryName))]
            .map(e => ({ label: e!, value: e! }));
        this.languageNameList = [...new Set(this.books.map(book => book.LanguageName))]
            .map(e => ({ label: e!, value: e! }));
        this.publishedYearList = [...new Set(this.books.map(book => book.PublishedYear))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.books.map(book => book.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importBookNameList = [...new Set(this.importPreview.map(book => book.BookName))]
            .map(e => ({ label: e!, value: e! }));
        this.importAuthorNameList = [...new Set(this.importPreview.map(book => book.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.importPublisherNameList = [...new Set(this.importPreview.map(book => book.PublisherName))]
            .map(e => ({ label: e!, value: e! }));
        this.importCategoryNameList = [...new Set(this.importPreview.map(book => book.CategoryName))]
            .map(e => ({ label: e!, value: e! }));
        this.importLanguageNameList = [...new Set(this.importPreview.map(book => book.LanguageName))]
            .map(e => ({ label: e!, value: e! }));
        this.importPublishedYearList = [...new Set(this.importPreview.map(book => book.PublishedYear))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(book => book.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(lang => lang.Error))]
            .map(e => ({ label: e!, value: e! }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    showImportFilter(): void {
        this.importShowFt = !this.importShowFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedAuthorNameList = [];
        this.selectedPublisherNameList = [];
        this.selectedCategoryNameList = [];
        this.selectedLanguageNameList = [];
        this.selectedPublishedYearList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedBookNameList = [];
        this.importSelectedAuthorNameList = [];
        this.importSelectedPublisherNameList = [];
        this.importSelectedCategoryNameList = [];
        this.importSelectedLanguageNameList = [];
        this.importSelectedPublishedYearList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(status: string): 'success' | 'danger' {
        return status == 'Available' ? 'success' : 'danger';
    }

    editBook(book: BookDetails | null = null): void {
        if (book) {
            this.currentBook = { ...book };
            this.header = 'Edit Book';
            this.publishedDate = book.PublishedYear ? new Date(book.PublishedYear, 0, 1) : null;

            this.floorOptions = this.floors
                .filter(floor => floor.BuildingId === this.currentBook.BuildingId)
                .map(floor => {
                    return { label: floor.FloorName ?? '', value: floor.FloorId };
                });

            this.rackOptions = this.racks
                .filter(rack => rack.BuildingId === this.currentBook.BuildingId &&
                    rack.FloorId === this.currentBook.FloorId)
                .map(rack => {
                    return { label: rack.RackLabel ?? '', value: rack.RackId };
                });

            if(this.currentBook.Status == "Unavailable")
            {
                this.currentBook.Status = "Available";
            }
        }
        else {
            this.currentBook = {
                BookId: 0,
                BookName: '',
                AuthorId: null,
                AuthorName: '',
                PublisherId: null,
                PublisherName: '',
                CategoryId: null,
                CategoryName: '',
                LanguageId: null,
                LanguageName: '',
                PublishedYear: null,
                Price: 0,
                BillNo: '',
                CallNo: '',
                AccessionNo: '',
                Source: '',
                SubjectId: 0,
                SubjectName: '',
                Status: 'Available',
                BuildingId: null,
                BuildingName: '',
                FloorId: null,
                FloorNumber: null,
                FloorName: '',
                RackId: null,
                RackNumber: 0,
                RackLabel: '',
                BookBarcode: '',
                IsActive: true
            };
            this.header = 'Add Book';
            this.publishedDate = null;
        }

        this.errors = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            BookBarcode: '',
            IsActive: ''
        };
        this.activeTab = 0;
        this.bookDialogVisible = true;
        this.isViewOnly = false;
    }

    viewBook(book: BookDetails): void {
        if (book) {
            this.currentBook = { ...book };
            this.header = 'View Book';
            this.publishedDate = book.PublishedYear ? new Date(book.PublishedYear, 0, 1) : null;

            this.floorOptions = this.floors
                .filter(floor => floor.BuildingId === this.currentBook.BuildingId)
                .map(floor => {
                    return { label: floor.FloorName ?? '', value: floor.FloorId };
                });

            this.rackOptions = this.racks
                .filter(rack => rack.BuildingId === this.currentBook.BuildingId &&
                    rack.FloorId === this.currentBook.FloorId)
                .map(rack => {
                    return { label: rack.RackLabel ?? '', value: rack.RackId };
                });
        }

        this.errors = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            BookBarcode: '',
            IsActive: ''
        };
        this.activeTab = 0;
        this.bookDialogVisible = true;
        this.isViewOnly = true;
    }

    onLanguageChange(): void {
        const language = this.languageOptions.find(l => l.value === this.currentBook.LanguageId);
        if (language) {
            this.currentBook.LanguageName = language.label;
        }

        this.validateInput('LanguageId');
    }

    onCategoryChange(): void {
        const category = this.categoryOptions.find(c => c.value === this.currentBook.CategoryId);
        if (category) {
            this.currentBook.CategoryName = category.label;
        }

        this.validateInput('CategoryId');
    }

    onSubjectChange(): void {
        const subject = this.subjectOptions.find(s => s.value === this.currentBook.SubjectId);
        if (subject) {
            this.currentBook.SubjectName = subject.label;
        }
        else
        {
            this.currentBook.SubjectName = '';
        }

        this.validateInput('SubjectId');
    }

    onPublisherChange(): void {
        const publisher = this.publisherOptions.find(p => p.value === this.currentBook.PublisherId);
        if (publisher) {
            this.currentBook.PublisherName = publisher.label;
        }

        this.validateInput('PublisherId');
    }

    onAuthorChange(): void {
        const author = this.authorOptions.find(a => a.value === this.currentBook.AuthorId);
        if (author) {
            this.currentBook.AuthorName = author.label;
        }

        this.validateInput('AuthorId');
    }

    onPublishedYearChange(): void {
        if (this.publishedDate) {
            this.currentBook.PublishedYear = this.publishedDate.getFullYear();
        }
        else {
            this.currentBook.PublishedYear = null;
        }

        this.validateInput('PublishedYear');
    }

    onBuildingChange(): void {
        this.currentBook.FloorId = 0;
        this.currentBook.FloorNumber = '';
        this.currentBook.FloorName = '';
        this.currentBook.RackId = 0;
        this.currentBook.RackNumber = 0;
        this.currentBook.RackLabel = '';

        this.floorOptions = this.floors
            .filter(floor => floor.BuildingId === this.currentBook.BuildingId && floor.IsActive == true)
            .map(floor => {
                return { label: floor.FloorName ?? '', value: floor.FloorId };
            });

        const building = this.buildingOptions.find(b => b.value === this.currentBook.BuildingId);
        if (building) {
            this.currentBook.BuildingName = building.label;
        }

        this.validateInput('BuildingId');
    }

    onFloorChange(): void {
        this.currentBook.RackId = 0;
        this.currentBook.RackNumber = 0;
        this.currentBook.RackLabel = '';

        this.rackOptions = this.racks
            .filter(rack => rack.BuildingId === this.currentBook.BuildingId &&
                rack.FloorId === this.currentBook.FloorId && rack.IsActive == true)
            .map(rack => {
                return { label: rack.RackLabel ?? '', value: rack.RackId };
            });

        const floor = this.floors.find(f => f.FloorId === this.currentBook.FloorId);
        if (floor) {
            this.currentBook.FloorNumber = floor.FloorNumber;
            this.currentBook.FloorName = floor.FloorName ?? '';
        }

        this.validateInput('FloorId');
    }

    onRackChange(): void {
        const rack = this.racks.find(r => r.RackId === this.currentBook.RackId);
        if (rack) {
            this.currentBook.RackNumber = rack.RackNumber;
            this.currentBook.RackLabel = rack.RackLabel;
        }

        this.validateInput('RackId');
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.currentBook.BookName?.trim()) {
                    this.errors.BookName = 'Book is required.';
                    isValid = false;
                } else {
                    this.errors.BookName = '';
                }
                break;

            case 'AuthorId':
                if (!this.currentBook.AuthorId) {
                    this.errors.AuthorId = 'Author is required.';
                    isValid = false;
                } 
                else if(!(this.authorOptions.some(option => option.value === this.currentBook.AuthorId)))
                {
                    this.errors.AuthorId = 'Please Select valid Author.';
                    isValid = false;
                }
                else {
                    this.errors.AuthorId = '';
                }
                break;

            case 'PublisherId':
                if (!this.currentBook.PublisherId) {
                    this.errors.PublisherId = 'Publisher is required.';
                    isValid = false;
                } 
                else if(!(this.publisherOptions.some(option => option.value === this.currentBook.PublisherId)))
                {
                    this.errors.PublisherId = 'Please Select valid Publisher.';
                    isValid = false;
                }
                else {
                    this.errors.PublisherId = '';
                }
                break;

            case 'CategoryId':
                if (!this.currentBook.CategoryId) {
                    this.errors.CategoryId = 'Category is required.';
                    isValid = false;
                } 
                else if(!(this.categoryOptions.some(option => option.value === this.currentBook.CategoryId)))
                {
                    this.errors.CategoryId = 'Please Select valid Category.';
                    isValid = false;
                }
                else {
                    this.errors.CategoryId = '';
                }
                break;

            case 'LanguageId':
                if (!this.currentBook.LanguageId) {
                    this.errors.LanguageId = 'Language is required.';
                    isValid = false;
                } 
                else if(!(this.languageOptions.some(option => option.value === this.currentBook.LanguageId)))
                {
                    this.errors.LanguageId = 'Please Select valid Language.';
                    isValid = false;
                }
                else {
                    this.errors.LanguageId = '';
                }
                break;

            case 'PublishedYear':
                if (!this.currentBook.PublishedYear) {
                    this.errors.PublishedYear = 'Published year is required.';
                    isValid = false;
                } else {
                    this.errors.PublishedYear = '';
                }
                break;

            case 'Price':
                if (!/^\d+(\.\d+)?$/.test(this.currentBook.Price?.toString().trim() ?? '')) {
                    this.errors.Price = 'Price is required and must be a valid input.';
                    isValid = false;
                } 
                else if(!(this.currentBook.Price!=null && this.currentBook.Price >0)){
                    this.errors.Price = 'Price must be a valid input.';
                    isValid = false;
                }
                else {
                    this.errors.Price = '';
                }
                break;

            case 'BuildingId':
                if (!this.currentBook.BuildingId) {
                    this.errors.BuildingId = 'Building is required.';
                    isValid = false;
                } 
                else if(!(this.buildingOptions.some(option => option.value === this.currentBook.BuildingId)))
                {
                    this.errors.BuildingId = 'Please Select valid Building.';
                    isValid = false;
                }
                else {
                    this.errors.BuildingId = '';
                }
                break;

            case 'FloorId':
                if (!this.currentBook.FloorId) {
                    this.errors.FloorId = 'Floor is required.';
                    isValid = false;
                } 
                else if(!(this.floorOptions.some(option => option.value === this.currentBook.FloorId)))
                {
                    this.errors.FloorId = 'Please Select valid Floor.';
                    isValid = false;
                }
                else {
                    this.errors.FloorId = '';
                }
                break;

            case 'RackId':
                if (!this.currentBook.RackId) {
                    this.errors.RackId = 'Rack is required.';
                    isValid = false;
                } 
                else if(!(this.rackOptions.some(option => option.value === this.currentBook.RackId)))
                {
                    this.errors.RackId = 'Please Select valid Rack.';
                    isValid = false;
                }
                else {
                    this.errors.RackId = '';
                }
                break;
            
            case 'SubjectId':
                if (!this.currentBook.SubjectId) {
                    this.errors.SubjectId = 'Subject is required.';
                    isValid = false;
                } 
                else if(!(this.subjectOptions.some(option => option.value === this.currentBook.SubjectId)))
                {
                    this.errors.SubjectId = 'Please Select valid Subject.';
                    isValid = false;
                }
                else {
                    this.errors.SubjectId = '';
                }
                break;

            // case 'BookBarcode':
            //     if (!this.currentBook.BookBarcode?.trim()) {
            //         this.errors.BookBarcode = 'Barcode is required.';
            //         isValid = false;
            //     } else {
            //         this.errors.BookBarcode = '';
            //     }
            //     break;

            // case 'IsActive':
            //     if (this.currentBook.IsActive === null) {
            //         this.errors.IsActive = 'Status is required.';
            //         isValid = false;
            //     } else {
            //         this.errors.IsActive = '';

            //     }
            //     break;

            default:
                break;
        }

        return isValid;
    }

    validateBook(): boolean {
        const isBookNameValid = this.validateInput('BookName');
        const isAuthorIdValid = this.validateInput('AuthorId');
        const isPublisherIdValid = this.validateInput('PublisherId');
        const isCategoryIdValid = this.validateInput('CategoryId');
        const isLanguageIdValid = this.validateInput('LanguageId');
        const isPublishedYearValid = this.validateInput('PublishedYear');
        const isPriceValid = this.validateInput('Price');
        const isBuildingIdValid = this.validateInput('BuildingId');
        const isFloorIdValid = this.validateInput('FloorId');
        const isRackIdValid = this.validateInput('RackId');
        const isSubjectIdValid = this.validateInput('SubjectId');
        // const isBookBarcodeValid = this.validateInput('BookBarcode');
        // const isStatusValid = this.validateInput('IsActive');
        return isBookNameValid && isAuthorIdValid && isPublisherIdValid &&
            isCategoryIdValid && isLanguageIdValid && isPublishedYearValid &&
            isPriceValid && isBuildingIdValid && isFloorIdValid &&
            isRackIdValid && isSubjectIdValid; // && isBookBarcodeValid && isStatusValid;
    }

    saveBook(): void {
        console.log('currentBook :', this.currentBook);

        if (!this.validateBook()) {
            return;
        }

        if(this.currentBook.BookId == null || this.currentBook.BookId == 0)
        {
            const isBookExistsAlready = this.books.find(x => x.BookName == this.currentBook.BookName && x.AuthorId == this.currentBook.AuthorId && 
                            x.PublisherId == this.currentBook.PublisherId && x.CategoryId == this.currentBook.CategoryId && x.LanguageId == this.currentBook.LanguageId &&
                            x.PublishedYear == this.currentBook.PublishedYear);

            if(isBookExistsAlready !=null && isBookExistsAlready.BookId >0)
            {
                this.errors.BookName = 'Book already exists.';
                    
                // this.messageService.add({
                //         severity: 'success',
                //         summary: 'Manage Book - Failed',
                //         detail: '"'+this.currentBook.BookName+'" Book already exists.'
                //     });

                return;
            }
        }
        else
        {
            const isBookExistsAlready = this.books.find(x => x.BookName == this.currentBook.BookName && x.AuthorId == this.currentBook.AuthorId && 
                            x.PublisherId == this.currentBook.PublisherId && x.CategoryId == this.currentBook.CategoryId && x.LanguageId == this.currentBook.LanguageId &&
                            x.PublishedYear == this.currentBook.PublishedYear);

            if(isBookExistsAlready !=null && isBookExistsAlready.BookId >0 && isBookExistsAlready.BookId != this.currentBook.BookId)
            {
                this.errors.BookName = 'Book already exists.';
                    
                // this.messageService.add({
                //         severity: 'success',
                //         summary: 'Manage Book - Failed',
                //         detail: '"'+this.currentBook.BookName+'" Book already exists.'
                //     });

                return;
            }
        }

        if(this.currentBook.Status =="Available" && this.currentBook.IsActive == false)
        {
            this.confirmationService.confirm({
                message: "Do you want to activate this book?",
                header: 'Book Activation Confirmation',
                icon: 'pi pi-book',
                acceptLabel: 'Yes',
                rejectLabel: 'No',
                accept: () => {
                    this.currentBook.IsActive = true;
                    this.initiateUpdateOrAddBook();
                },
                reject: () => {                    
                    return;
                }
            });
        }
        else{
           this.initiateUpdateOrAddBook();
        }        
    }

    initiateUpdateOrAddBook() : void{
         const payload = [this.currentBook];
            if (this.currentBook.BookId > 0) {
                this.updateBook(payload);
            }
            else {
                this.addNewBook(payload);
            }
    }

    addNewBook(_bookDetails: BookDetails[]): void {
        this.bookService.addBookDetails(_bookDetails).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book - Failed',
                        detail: res ? res.Message : 'Failed to add new book. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book - Success',
                        detail: 'Book added successfully.'
                    });

                    this.loadBooks();    
                    
                    // 1. Get the message string
                    const responseMsg: string = res.Message;

                    // 2. Split by "-" and grab the first element safely using optional chaining
                    const firstPart: string = responseMsg?.split('-')[0] || '';

                    // 3. Split the first part by "," to get your final array
                    const finalArray: string[] = firstPart ? firstPart.split(',') : [];
              
                    if(finalArray !=null && finalArray.length >0)
                    {

                        this.confirmationService.confirm({
                            message: "Do you want to print book's barcode?",
                            header: 'Print Confirmation',
                            icon: 'pi pi-print',
                            acceptLabel: 'Yes',
                            rejectLabel: 'No',
                            accept: () => {
                                this.selectedBookDetails = [];
                                finalArray.forEach(ele => {
                                    const _importedData = this.books.find(x => x.BookId == parseInt(ele));
                                        
                                    if(_importedData !=null)
                                    {
                                        this.selectedBookDetails.push(_importedData);
                                    }
                                }); 
                                this.bookDialogVisible = false;
                                this.onSelectionChange();
                                this.printBarcode();

                            },
                            reject: () => {
                                this.bookDialogVisible = false;
                            }
                        });
                    }
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Book - Failed',
                    detail: 'Failed to add new book. Please try again.'
                });
            }
        });
    }

    updateBook(_bookDetails: BookDetails[]): void {
        this.bookService.updateBookDetails(_bookDetails).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book - Failed',
                        detail: res ? res.Message : 'Failed to update book. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book - Success',
                        detail: 'Book updated successfully.'
                    });

                    this.loadBooks();
                    this.bookDialogVisible = false;
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Book - Failed',
                    detail: 'Failed to update book. Please try again.'
                });
            }
        });
    }

    deleteBook(book: BookDetails): void {

        book.Status = "Unavailable";

        const payload = [book];

        this.bookService.deleteBookDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Book - Failed',
                        detail: res ? res.Message : 'Failed to delete book. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Book - Success',
                        detail: 'Book deleted successfully.'
                    });
                }

                this.loadBooks();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Book - Failed',
                    detail: 'Failed to delete book. Please try again.'
                });
            }
        });
    }

    importBook(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadBookTemplate(): Promise<void> {
        const workbook = new ExcelJS.Workbook();

        const bodyStyle: Partial<ExcelJS.Style> = {
            border: {
                top: { style: 'thin', color: { argb: '00000000' } },
                left: { style: 'thin', color: { argb: '00000000' } },
                bottom: { style: 'thin', color: { argb: '00000000' } },
                right: { style: 'thin', color: { argb: '00000000' } },
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
        };

        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } },
            ...bodyStyle
        };

        const worksheet = workbook.addWorksheet('Books');
        worksheet.addRow(['BOOK', 'AUTHOR', 'PUBLISHER', 'CATEGORY', 'LANGUAGE', 'YEAR', 'PRICE(₹)', 'BILL NO', 'CALL NO', 
            'ACCESSION NO', 'SOURCE', 'SUBJECT', 'BUILDING', 'FLOOR', 'RACK']);

        worksheet.getRow(1).eachCell(cell => {
            cell.style = headerStyle;
        });

        worksheet.autoFilter = {
            from: 'A1',
            to: 'O1'
        };

        const authorsSheet = workbook.addWorksheet('AuthorList');
        this.authors.filter(x => x.IsActive == true).forEach((author, idx) => {
            authorsSheet.getCell(idx + 1, 1).value = author.AuthorName;
        });
        authorsSheet.state = 'hidden';

        const publishersSheet = workbook.addWorksheet('PublisherList');
        this.publishers.filter(x => x.IsActive == true).forEach((pub, idx) => {
            publishersSheet.getCell(idx + 1, 1).value = pub.PublisherName;
        });
        publishersSheet.state = 'hidden';

        const categoriesSheet = workbook.addWorksheet('CategoryList');
        this.categories.filter(x => x.IsActive == true).forEach((cat, idx) => {
            categoriesSheet.getCell(idx + 1, 1).value = cat.CategoryName;
        });
        categoriesSheet.state = 'hidden';

        const subjectSheet = workbook.addWorksheet('SubjectList');
        this.subjects.filter(x => x.IsActive == true).forEach((cat, idx) => {
            subjectSheet.getCell(idx + 1, 1).value = cat.SubjectName;
        });
        subjectSheet.state = 'hidden';

        const languagesSheet = workbook.addWorksheet('LanguageList');
        this.languages.filter(x => x.IsActive == true).forEach((lang, idx) => {
            languagesSheet.getCell(idx + 1, 1).value = lang.LanguageName;
        });
        languagesSheet.state = 'hidden';

        const buildingsSheet = workbook.addWorksheet('BuildingList');
        this.buildings.filter(x => x.IsActive == true).forEach((building, idx) => {
            buildingsSheet.getCell(idx + 1, 1).value = building.BuildingName;
        });
        buildingsSheet.state = 'hidden';

        const floorsSheet = workbook.addWorksheet('FloorList');
        this.floors.filter(x => x.IsActive == true).forEach((floor, idx) => {
            floorsSheet.getCell(idx + 1, 1).value = floor.FloorName;
        });
        floorsSheet.state = 'hidden';

        const racksSheet = workbook.addWorksheet('RackList');
        this.racks.filter(x => x.IsActive == true).forEach((rack, idx) => {
            racksSheet.getCell(idx + 1, 1).value = rack.RackLabel;
        });
        racksSheet.state = 'hidden';

        for (let rowIndex = 2; rowIndex <= 1000; rowIndex++) {
            const authorCell = worksheet.getCell(rowIndex, 2);
            authorCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`AuthorList!$A$1:$A$${this.authors.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Author',
                error: 'Please select a valid author from the list.'
            };

            const publisherCell = worksheet.getCell(rowIndex, 3);
            publisherCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`PublisherList!$A$1:$A$${this.publishers.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Publisher',
                error: 'Please select a valid publisher from the list.'
            };

            const categoryCell = worksheet.getCell(rowIndex, 4);
            categoryCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`CategoryList!$A$1:$A$${this.categories.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Category',
                error: 'Please select a valid category from the list.'
            };

            const languageCell = worksheet.getCell(rowIndex, 5);
            languageCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`LanguageList!$A$1:$A$${this.languages.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Language',
                error: 'Please select a valid language from the list.'
            };

            const yearCell = worksheet.getCell(rowIndex, 6);
            yearCell.dataValidation = {
                type: 'whole',
                operator: 'between',
                formulae: ['1000', '9999'],
                allowBlank: true,
                showErrorMessage: true,
                errorTitle: 'Invalid Year',
                error: 'Please enter a 4-digit year (e.g., 2024).'
            };

            const priceCell = worksheet.getCell(rowIndex, 7);
            priceCell.dataValidation = {
                type: 'decimal',
                operator: 'greaterThan',
                formulae: ['0'],
                allowBlank: true,
                showErrorMessage: true,
                errorTitle: 'Invalid Price',
                error: 'Please enter a valid price (greater than 0).'
            };

            const subjectCell = worksheet.getCell(rowIndex, 12);
            subjectCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`SubjectList!$A$1:$A$${this.subjects.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Subject',
                error: 'Please select a valid subject from the list.'
            };

            const buildingCell = worksheet.getCell(rowIndex, 13);
            buildingCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`BuildingList!$A$1:$A$${this.buildings.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Building',
                error: 'Please select a valid building from the list.'
            };

            const floorCell = worksheet.getCell(rowIndex, 14);
            floorCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`FloorList!$A$1:$A$${this.floors.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Floor',
                error: 'Please select a valid floor for a selected building.'
            };

            const rackCell = worksheet.getCell(rowIndex, 15);
            rackCell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: [`RackList!$A$1:$A$${this.racks.length}`],
                showErrorMessage: true,
                errorTitle: 'Invalid Rack',
                error: 'Please select a valid rack for the selected floor.'
            };
        }

        worksheet.columns.forEach(col => {
            const lengths = col.values === undefined ? [] : col.values.map(v => {
                if (v === null || v === undefined) return 0;
                else return v.toString().length;
            });
            col.width = Math.max(...lengths.filter(v => typeof v === 'number')) + 10;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'import-book-template.xlsx');
    }

    onImportFileSelected(event: Event): void {
        this.importPreview = [];
        this.importUploadError = '';

        const input = event.target as HTMLInputElement;
        if (!input.files || !input.files.length) {
            this.importUploadError = 'File not selected.';
            input.value = '';
            return;
        }

        if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(input.files[0].type)) {
            this.importUploadError = 'Invalid file type. Please upload an Excel file (.xlsx or .xls).';
            input.value = '';
            return;
        }

        const file = input.files[0];
        input.value = '';
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            const data = e.target?.result;
            if (!data) {
                this.importUploadError = 'Unable to read file.';
                return;
            }

            try {
                const workbook = Xlsx.read(data as ArrayBuffer, { type: 'array' });
                if (!workbook.SheetNames.length) {
                    this.importUploadError = 'Excel file does not contain any worksheets.';
                    return;
                }

                const rows = Xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                    defval: null,
                    blankrows: false,
                    raw: false
                });

                if (!rows.length) {
                    this.importUploadError = 'No data rows were found in the file.';
                    return;
                }

                const headerRow = Object.keys(rows[0] || {});
                const expectedHeaders = ['BOOK', 'AUTHOR', 'PUBLISHER', 'CATEGORY', 'LANGUAGE', 'YEAR',
                    'PRICE(₹)', 'BILL NO', 'CALL NO', 'ACCESSION NO', 'SOURCE', 'SUBJECT', 'BUILDING', 'FLOOR', 'RACK'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {

                    // console.log('rows :', rows);

                    const bookName = row['BOOK']?.toString().trim();
                    const authorName = row['AUTHOR']?.toString().trim();
                    const publisherName = row['PUBLISHER']?.toString().trim();
                    const categoryName = row['CATEGORY']?.toString().trim();
                    const languageName = row['LANGUAGE']?.toString().trim();
                    const publishedYear = Number(row['YEAR']?.toString().trim());
                    const price = Number(row['PRICE(₹)']?.toString().trim());
                    const billNo = row['BILL NO']?.toString().trim();
                    const callNo = row['CALL NO']?.toString().trim();
                    const accessionNo = row['ACCESSION NO']?.toString().trim();
                    const source = row['SOURCE']?.toString().trim();
                    const subjectName = row['SUBJECT']?.toString().trim();
                    const buildingName = row['BUILDING']?.toString().trim();
                    const floorName = row['FLOOR']?.toString().trim();
                    const rackLabel = row['RACK']?.toString().trim();
                    // const bookBarcode = row['BARCODE']?.toString().trim();
                    // const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    // console.log('publishedYear :', publishedYear, '. price:', price);

                    const importItem: ImportBookDetails = {
                        BookId: 0,
                        BookName: bookName,
                        AuthorId: null,
                        AuthorName: authorName,
                        PublisherId: null,
                        PublisherName: publisherName,
                        CategoryId: null,
                        CategoryName: categoryName,
                        LanguageId: null,
                        LanguageName: languageName,
                        PublishedYear: publishedYear,
                        Price: price,
                        BillNo: billNo,
                        CallNo: callNo,
                        AccessionNo: accessionNo,
                        Source: source,
                        SubjectName: subjectName,                        
                        Status: 'Available',
                        BuildingId: null,
                        BuildingName: buildingName,
                        FloorId: null,
                        FloorNumber: null,
                        FloorName: floorName,
                        RackId: null,
                        RackNumber: 0,
                        RackLabel: rackLabel,
                        BookBarcode: '',
                        IsActive: true,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportBook();
                this.initializeImportFilterLists();
            }
            catch (error) {
                this.importUploadError = 'Invalid file data.';
            }
        };
    }

    editImportBook(book: BookDetails, index: number): void {
        this.importIndex = index;
        this.currentBook = { ...book };
        this.header = 'Edit Book';
        this.publishedDate = book.PublishedYear ? new Date(book.PublishedYear, 0, 1) : null;

        this.floorOptions = this.floors
            .filter(floor => floor.BuildingId === this.currentBook.BuildingId)
            .map(floor => {
                return { label: floor.FloorName ?? '', value: floor.FloorId };
            });

        this.rackOptions = this.racks
            .filter(rack => rack.BuildingId === this.currentBook.BuildingId &&
                rack.FloorId === this.currentBook.FloorId)
            .map(rack => {
                return { label: rack.RackLabel ?? '', value: rack.RackId };
            });

        this.errors = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            BookBarcode: '',
            IsActive: ''
        };
        this.importBookDialogVisible = true;
        this.isViewOnly = false;
    }

    viewImportBook(book: BookDetails): void {
        this.currentBook = { ...book };
        this.header = 'View Book';
        this.publishedDate = book.PublishedYear ? new Date(book.PublishedYear, 0, 1) : null;

        this.floorOptions = this.floors
            .filter(floor => floor.BuildingId === this.currentBook.BuildingId)
            .map(floor => {
                return { label: floor.FloorName ?? '', value: floor.FloorId };
            });

        this.rackOptions = this.racks
            .filter(rack => rack.BuildingId === this.currentBook.BuildingId &&
                rack.FloorId === this.currentBook.FloorId)
            .map(rack => {
                return { label: rack.RackLabel ?? '', value: rack.RackId };
            });

        this.errors = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            BookBarcode: '',
            IsActive: ''
        };
        this.activeTab = 0;
        this.importBookDialogVisible = true;
        this.isViewOnly = true;
    }

    saveImportBook(): void {
        if (!this.validateBook()) {
            return;
        }

        this.importPreview[this.importIndex] = {
            ...this.importPreview[this.importIndex],
            ...this.currentBook
        };

        this.validateImportInput('BookName', this.importIndex);
        this.validateImportInput('AuthorName', this.importIndex);
        this.validateImportInput('PublisherName', this.importIndex);
        this.validateImportInput('CategoryName', this.importIndex);
        this.validateImportInput('LanguageName', this.importIndex);
        this.validateImportInput('PublishedYear', this.importIndex);
        this.validateImportInput('Price', this.importIndex);
        this.validateImportInput('BuildingName', this.importIndex);
        this.validateImportInput('FloorName', this.importIndex);
        this.validateImportInput('RackLabel', this.importIndex);

        this.importIndex = -1;
        this.importBookDialogVisible = false;
    }

    deleteImportBook(index: number): void {
        this.importPreview.splice(index, 1);
    }

    validateImportInput(key: string, index: number): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.importPreview[index].BookName?.trim()) {
                    this.importPreview[index].Error = 'Book Name is required.';
                    isValid = false;
                }
                else if (this.books.find(x => x.BookName == this.importPreview[index].BookName?.trim() && (x.AuthorName == this.importPreview[index].AuthorName?.trim() || x.PublisherName == this.importPreview[index].PublisherName?.trim()))) {
                    this.importPreview[index].Error = 'Book already exists.';
                    isValid = false;
                }
                else if (this.importPreview.find((x, idx) => x.BookName?.trim() === this.importPreview[index].BookName?.trim() && idx !== index)) {
                    this.importPreview[index].Error = 'Duplicate BookName exists.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'AuthorName':
                if (!this.importPreview[index].AuthorName?.trim()) {
                    this.importPreview[index].Error = 'Author is required.';
                    isValid = false;
                }
                else if (!this.authors.some(author => author.AuthorName?.toLowerCase() === this.importPreview[index].AuthorName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Author not enlisted.';
                    isValid = false;
                }
                else {
                    const author = this.authors.find(a => a.AuthorName?.toLowerCase() === this.importPreview[index].AuthorName?.trim().toLowerCase());
                    if (author) {
                        this.importPreview[index].AuthorId = author.AuthorId;
                        this.importPreview[index].AuthorName = author.AuthorName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'PublisherName':
                if (!this.importPreview[index].PublisherName?.trim()) {
                    this.importPreview[index].Error = 'Publisher is required.';
                    isValid = false;
                }
                else if (!this.publishers.some(publisher => publisher.PublisherName?.toLowerCase() === this.importPreview[index].PublisherName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Publisher not enlisted.';
                    isValid = false;
                }
                else {
                    const publisher = this.publishers.find(p => p.PublisherName?.toLowerCase() === this.importPreview[index].PublisherName?.trim().toLowerCase());
                    if (publisher) {
                        this.importPreview[index].PublisherId = publisher.PublisherId;
                        this.importPreview[index].PublisherName = publisher.PublisherName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'CategoryName':
                if (!this.importPreview[index].CategoryName?.trim()) {
                    this.importPreview[index].Error = 'Category is required.';
                    isValid = false;
                }
                else if (!this.categories.some(category => category.CategoryName?.toLowerCase() === this.importPreview[index].CategoryName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Category not enlisted.';
                    isValid = false;
                }
                else {
                    const category = this.categories.find(c => c.CategoryName?.toLowerCase() === this.importPreview[index].CategoryName?.trim().toLowerCase());
                    if (category) {
                        this.importPreview[index].CategoryId = category.CategoryId;
                        this.importPreview[index].CategoryName = category.CategoryName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'LanguageName':
                if (!this.importPreview[index].LanguageName?.trim()) {
                    this.importPreview[index].Error = 'Language is required.';
                    isValid = false;
                }
                else if (!this.languages.some(lang => lang.LanguageName?.toLowerCase() === this.importPreview[index].LanguageName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Language not enlisted.';
                    isValid = false;
                }
                else {
                    const language = this.languages.find(l => l.LanguageName?.toLowerCase() === this.importPreview[index].LanguageName?.trim().toLowerCase());
                    if (language) {
                        this.importPreview[index].LanguageId = language.LanguageId;
                        this.importPreview[index].LanguageName = language.LanguageName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'PublishedYear':
                if (!this.importPreview[index].PublishedYear || this.importPreview[index].PublishedYear < 1000 || this.importPreview[index].PublishedYear > 9999) {
                    this.importPreview[index].Error = 'Invalid published year.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'Price':
                if (!this.importPreview[index].Price || this.importPreview[index].Price <= 0) {
                    this.importPreview[index].Error = 'Invalid price.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'BuildingName':
                if (!this.importPreview[index].BuildingName?.trim()) {
                    this.importPreview[index].Error = 'Building is required.';
                    isValid = false;
                }
                else if (!this.buildings.some(building => building.BuildingName?.toLowerCase() === this.importPreview[index].BuildingName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Building not enlisted.';
                    isValid = false;
                }
                else {
                    const building = this.buildings.find(b => b.BuildingName?.toLowerCase() === this.importPreview[index].BuildingName?.trim().toLowerCase());
                    if (building) {
                        this.importPreview[index].BuildingId = building.BuildingId;
                        this.importPreview[index].BuildingName = building.BuildingName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'FloorName':
                if (!this.importPreview[index].FloorName?.trim()) {
                    this.importPreview[index].Error = 'Floor is required.';
                    isValid = false;
                }
                else if (!this.floors.some(floor => floor.BuildingId === this.importPreview[index].BuildingId &&
                    floor.FloorName?.toLowerCase() === this.importPreview[index].FloorName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Floor not enlisted for the selected building.';
                    isValid = false;
                }
                else {
                    const floor = this.floors.find(f => f.BuildingId === this.importPreview[index].BuildingId &&
                        f.FloorName?.toLowerCase() === this.importPreview[index].FloorName?.trim().toLowerCase());
                    if (floor) {
                        this.importPreview[index].FloorId = floor.FloorId;
                        this.importPreview[index].FloorNumber = floor.FloorNumber;
                        this.importPreview[index].FloorName = floor.FloorName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'RackLabel':
                if (!this.importPreview[index].RackLabel?.trim()) {
                    this.importPreview[index].Error = 'Rack label is required.';
                    isValid = false;
                }
                else if (!this.racks.some(rack => rack.BuildingId === this.importPreview[index].BuildingId &&
                    rack.FloorId === this.importPreview[index].FloorId &&
                    rack.RackLabel?.trim().toLowerCase() === this.importPreview[index].RackLabel?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Rack label not enlisted for the selected building and floor.';
                    isValid = false;
                }
                else {
                    const rack = this.racks.find(r => r.BuildingId === this.importPreview[index].BuildingId &&
                        r.FloorId === this.importPreview[index].FloorId &&
                        r.RackLabel?.trim().toLowerCase() === this.importPreview[index].RackLabel?.trim().toLowerCase());
                    if (rack) {
                        this.importPreview[index].RackId = rack.RackId;
                        this.importPreview[index].RackNumber = rack.RackNumber;
                        this.importPreview[index].RackLabel = rack.RackLabel;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            case 'SubjectName':
                if (!this.importPreview[index].SubjectName?.trim()) {
                    this.importPreview[index].Error = 'Subject is required.';
                    isValid = false;
                }
                else if (!this.subjects.some(subject => subject.SubjectName?.toLowerCase() === this.importPreview[index].SubjectName?.trim().toLowerCase())) {
                    this.importPreview[index].Error = 'Subject not enlisted.';
                    isValid = false;
                }
                else {
                    const subject = this.subjects.find(s => s.SubjectName?.toLowerCase() === this.importPreview[index].SubjectName?.trim().toLowerCase());
                    if (subject) {
                        this.importPreview[index].SubjectId = subject.SubjectId;
                        this.importPreview[index].SubjectName = subject.SubjectName;
                    }
                    this.importPreview[index].Error = '';
                }
                break;

            // case 'BookBarcode':
            //     if (!this.importPreview[index].BookBarcode?.trim()) {
            //         this.importPreview[index].Error = 'Barcode is required.';
            //         isValid = false;
            //     }
            //     else {
            //         this.importPreview[index].Error = '';
            //     }
            //     break;

            // case 'IsActive':
            //     if (this.importPreview[index].IsActive === null) {
            //         this.importPreview[index].Error = 'Status is required.';
            //         isValid = false;
            //     }
            //     else {
            //         this.importPreview[index].Error = '';
            //     }
            //     break;

            default:
                break;
        }

        return isValid;
    }

    validateImportBook(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('BookName', index) &&
                this.validateImportInput('AuthorName', index) &&
                this.validateImportInput('PublisherName', index) &&
                this.validateImportInput('CategoryName', index) &&
                this.validateImportInput('LanguageName', index) &&
                this.validateImportInput('PublishedYear', index) &&
                this.validateImportInput('Price', index) &&
                this.validateImportInput('BuildingName', index) &&
                this.validateImportInput('FloorName', index) &&
                this.validateImportInput('RackLabel', index) &&
                this.validateImportInput('SubjectName', index);
            // this.validateImportInput('BookBarcode', index) &&
            // this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportBook()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                BookId: item.BookId,
                BookName: item.BookName,
                AuthorId: item.AuthorId,
                AuthorName: item.AuthorName,
                PublisherId: item.PublisherId,
                PublisherName: item.PublisherName,
                CategoryId: item.CategoryId,
                CategoryName: item.CategoryName,
                LanguageId: item.LanguageId,
                LanguageName: item.LanguageName,
                PublishedYear: item.PublishedYear,
                Price: item.Price,
                Status: item.Status,
                BuildingId: item.BuildingId,
                BuildingName: item.BuildingName,
                FloorId: item.FloorId,
                FloorNumber: item.FloorNumber,
                FloorName: item.FloorName,
                RackId: item.RackId,
                RackNumber: item.RackNumber,
                RackLabel: item.RackLabel,
                BookBarcode: item.BookBarcode,
                IsActive: item.IsActive
            };
        });
        this.bookService.updateBookDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Books - Failed',
                        detail: res ? res.Message : 'Failed to import books. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Books - Success',
                        detail: 'Books imported successfully.'
                    });

                    this.loadBooks();

                    // 1. Get the message string
                    const responseMsg: string = res.Message;

                    // 2. Split by "-" and grab the first element safely using optional chaining
                    const firstPart: string = responseMsg?.split('-')[0] || '';

                    // 3. Split the first part by "," to get your final array
                    const finalArray: string[] = firstPart ? firstPart.split(',') : [];
              
                    if(finalArray !=null && finalArray.length >0)
                    {
                        this.confirmationService.confirm({
                            message: "Do you want to print imported book's barcode?",
                            header: 'Print Confirmation',
                            icon: 'pi pi-print',
                            acceptLabel: 'Yes',
                            rejectLabel: 'No',
                            accept: () => {

                                this.selectedBookDetails = [];
                                finalArray.forEach(ele => {
                                    const _importedData = this.books.find(x => x.BookId == parseInt(ele));
                                        
                                    if(_importedData !=null)
                                    {
                                        this.selectedBookDetails.push(_importedData);
                                    }
                                });                            

                                this.importDialogVisible = false;
                                this.onSelectionChange();
                                this.printBarcode();

                            },
                            reject: () => {
                                this.importDialogVisible = false;
                            }
                        });
                    }
                    else
                    {
                        this.importDialogVisible = false;
                    }
                    
                }                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Books - Failed',
                    detail: 'Failed to import books. Please try again.'
                });
            }
        });
    }

    onSelectionChange() {
        // Extract only the IDs from the selected objects
        this.selectedIds = this.selectedBookDetails.map(x => x.BookId);

        console.log('Selected IDs:', this.selectedIds);
    }

    printBarcode() {
        if (this.selectedIds != null && this.selectedIds.length > 0) {
            this.printBarcodeDialogVisible = true;
        }
    }

    checkInBook(_book: BookDetails): void {
        this.getBookCirculartionBookId(_book.BookId);
    }

    checkOutBook(_book: BookDetails): void {
        this.bc = {
            BookCirculationId: 0, BookId: _book.BookId, BookName: _book.BookName, BorrowerId: 0, BorrowerName: '',
            IssuedByUserId: this.loggedInUserDetails?.UserId, IssuedByUserName: this.loggedInUserDetails?.FullName,
            IssuedDate: this.todayDate, IssuedByUserMailId: this.loggedInUserDetails?.MailId, OverDueId: 0, FineAmount: 0.0,
            OverDueFrom: null, OverDueDays: 0, OverDueStatus: '', SytemUpdatedDate: null, ReturnByUserId: 0,
            ReturnByUserName: '', ReturnDate: null, Comments: '', Status: 'Issued', UpdatedByUserId: 0,
            UpdatedByUserName: '', UpdatedDate: null, PaidAmount: 0, PaymentTypeId: 0
        };

        this.type = "CheckOut";
        this.bcDialogVisible = true;
        // console.log('this.bc :', this.bc);
    }

    getBookCirculartionBookId(_bookId: number): void {
        this._bcService.getBookCirculationDetailsById(_bookId).subscribe({
            next: (data: BookCirculationDetails[]) => {

                this.bc = data.find(x => x.Status == "Issued") ?? null;

                this.type = "CheckIn";
                this.bcDialogVisible = true;
            },
            error: (err) => {
                console.error('Error loading book circulation by BookId:', err);
            }
        });
    }

    parseCustomDateStringForUI(dateStr: Date): string {
        // 2. Pad single digits with leading zeros
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = dateStr.getFullYear();

        // 3. Assemble into the exact "yyyy-mm-dd" layout match        
        return `${year}-${month}-${day}`;
    }

    addToWishlist(): void{
        this.addWishlistDialogVisible = true;
    }

    loadUserDetails(): void {
        this.userService.getAllUserDetails().subscribe({
            next: (data: UserDetails[]) => {
                this.lstUserDetails = data;
                
            },
            error: (err) => {
                console.error('Error loading users:', err);
            }
        });
    }

    onUserSearch():void{
        const isMobile = /^[6-9]\d{9}$/.test(this.searchUserTerm);
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.searchUserTerm);

         let searchUser = null;

        if (this.searchUserTerm.includes(environment.usersBarcodeSyntax)) {
            searchUser = this.lstUserDetails.find(x => x.UserBarcode === this.searchUserTerm);
        }
        else if(isMobile)
        {
            searchUser = this.lstUserDetails.find(x => x.MobileNo === this.searchUserTerm);
        }
        else if(isEmail)
        {
            searchUser = this.lstUserDetails.find(x => x.MailId === this.searchUserTerm);
        }
        else{
            searchUser = this.lstUserDetails.find(x => x.FullName === this.searchUserTerm.trim());
        }

        if(searchUser != null && searchUser.UserId != null &&  searchUser.UserId > 0)
        {
            if(searchUser.FullName !=null && searchUser.FullName !='')
            {
                this.searchUserTerm = searchUser.FullName;
            }
            else
            {
                this.searchUserTerm = '';
            }
            

            if(this.currentBook !=null && this.currentBook.Status !=null && this.currentBook.Status == "Available")
            {
                this.bc = {
                    BookCirculationId: 0, BookId: this.currentBook.BookId, BookName: this.currentBook.BookName, BorrowerId: searchUser.UserId, BorrowerName: searchUser.FullName,
                    IssuedByUserId: this.loggedInUserDetails?.UserId, IssuedByUserName: this.loggedInUserDetails?.FullName,
                    IssuedDate: this.todayDate, IssuedByUserMailId: this.loggedInUserDetails?.MailId, OverDueId: 0, FineAmount: 0.0,
                    OverDueFrom: null, OverDueDays: 0, OverDueStatus: '', SytemUpdatedDate: null, ReturnByUserId: 0,
                    ReturnByUserName: '', ReturnDate: null, Comments: '', Status: 'Issued', UpdatedByUserId: 0,
                    UpdatedByUserName: '', UpdatedDate: null, PaidAmount: 0, PaymentTypeId: 0
                };

                this.type = "CheckOut";
                this.bcDialogVisible = true;
            }
            else if(this.currentBook !=null && this.currentBook.Status !=null && this.currentBook.Status == "Issued")
            {
                this.checkInBook(this.currentBook);
            }
        }
        
    }

    printTable(): void {
        window.print();
    }

   async downloadBooksDetails(): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Books');

        // 1. Define Column Properties & Styles Globally (Massive Performance Boost)
        const bodyStyle: Partial<ExcelJS.Style> = {
            border: {
                top: { style: 'thin', color: { argb: '00000000' } },
                left: { style: 'thin', color: { argb: '00000000' } },
                bottom: { style: 'thin', color: { argb: '00000000' } },
                right: { style: 'thin', color: { argb: '00000000' } },
            },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: false } // Wrap text slows down rendering
        };

        // Set fixed widths to avoid heavy auto-fit calculation loops
        worksheet.columns = [
            { header: 'BOOK', key: 'bookName', width: 30, style: bodyStyle },
            { header: 'AUTHOR', key: 'author', width: 25, style: bodyStyle },
            { header: 'PUBLISHER', key: 'publisher', width: 25, style: bodyStyle },
            { header: 'CATEGORY', key: 'category', width: 20, style: bodyStyle },
            { header: 'LANGUAGE', key: 'language', width: 20, style: bodyStyle },
            { header: 'YEAR', key: 'year', width: 15, style: bodyStyle },
            { header: 'PRICE(₹)', key: 'price', width: 15, style: bodyStyle },
            { header: 'BILL NO', key: 'billNo', width: 15, style: bodyStyle },
            { header: 'CALL NO', key: 'callNo', width: 20, style: bodyStyle },
            { header: 'ACCESSION NO', key: 'accessionNo', width: 20, style: bodyStyle },
            { header: 'SOURCE', key: 'source', width: 20, style: bodyStyle },
            { header: 'SUBJECT', key: 'subject', width: 20, style: bodyStyle },
            { header: 'BUILDING', key: 'building', width: 20, style: bodyStyle },
            { header: 'FLOOR', key: 'floor', width: 15, style: bodyStyle },
            { header: 'RACK', key: 'rack', width: 15, style: bodyStyle },
            { header: 'STATUS', key: 'status', width: 15, style: bodyStyle }
        ];

        // 2. Format Header Row directly
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } },
            ...bodyStyle
        };
        
        worksheet.getRow(1).eachCell(cell => {
            cell.style = headerStyle;
        });

        worksheet.autoFilter = { from: 'A1', to: 'P1' };

        // 3. Fast Row Injection using Object Keys
        // This allows ExcelJS to stream array values efficiently internal to its build process
        const rowsData = this.books.map( (book : BookDetails) => ({
            bookName: book.BookName || '',
            author: book.AuthorName || '',
            publisher: book.PublisherName || '',
            category: book.CategoryName || '',
            language: book.LanguageName || '',
            year: book.PublishedYear || '',
            price: book.Price || 0,
            billNo: book.BillNo || '',
            callNo: book.CallNo || '',
            accessionNo: book.AccessionNo || '',
            source: book.Source || '',
            subject: book.SubjectName || '',
            building: book.BuildingName || '',
            floor: book.FloorName || '',
            rack: book.RackLabel || '',
            status: book.Status || ''
        }));

        worksheet.addRows(rowsData);

        // 4. File Generation
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'save-book-details.xlsx');
    }

}
