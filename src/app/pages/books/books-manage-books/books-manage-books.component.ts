import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { BookService } from '@services/book.service';
import { AuthorDetails, BookDetails, BuildingDetails, CategoryDetails, FloorDetails, LanguageDetails, PublisherDetails, RackDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';
import { AuthorService } from '@app/shared/services/author.service';
import { PublisherService } from '@app/shared/services/publisher.service';
import { CategoryService } from '@app/shared/services/category.service';
import { LanguageService } from '@app/shared/services/language.service';
import { BuildingService } from '@app/shared/services/building.service';
import { FloorService } from '@app/shared/services/floor.service';
import { RackService } from '@app/shared/services/rack.service';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-books-manage-books',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, DatePickerModule, TooltipModule],
    templateUrl: './books-manage-books.component.html',
    styleUrl: './books-manage-books.component.scss'
})
export class BooksManageBooksComponent implements OnInit {
    private messageService = inject(MessageService);
    private bookService = inject(BookService);
    private authorService = inject(AuthorService);
    private publisherService = inject(PublisherService);
    private categoryService = inject(CategoryService);
    private languageService = inject(LanguageService);
    private buildingService = inject(BuildingService);
    private floorService = inject(FloorService);
    private rackService = inject(RackService);

    @ViewChild('dt') dataTable: Table | undefined;

    public books: BookDetails[] = [];
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
        Status: 'Available',
        BuildingId: null,
        BuildingName: '',
        FloorId: null,
        FloorNumber: 0,
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
            BookBarcode: '',
            IsActive: ''
        };
    public authorOptions: { label: string; value: number; }[] = [];
    public publisherOptions: { label: string; value: number; }[] = [];
    public categoryOptions: { label: string; value: number; }[] = [];
    public languageOptions: { label: string; value: number; }[] = [];
    public buildingOptions: { label: string; value: number; }[] = [];
    public floorOptions: { label: string; value: number; }[] = [];
    public rackOptions: { label: string; value: number; }[] = [];
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    ngOnInit(): void {
        this.loadBooks();
        this.loadAuthors();
        this.loadPublishers();
        this.loadCategories();
        this.loadLanguages();
        this.loadBuildings();
        this.loadFloors();
        this.loadRacks();
    }

    loadBooks(): void {
        this.bookService.getAllBookDetails().subscribe({
            next: (data: BookDetails[]) => {
                this.books = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading books:', err);
            }
        });
    }

    loadAuthors(): void {
        this.authorService.getAuthorDetails().subscribe({
            next: (data: AuthorDetails[]) => {
                this.authorOptions = data.map(author => {
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
                this.publisherOptions = data.map(publisher => {
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
                this.categoryOptions = data.map(category => {
                    return { label: category.CategoryName ?? '', value: category.CategoryId };
                });
            },
            error: (err) => {
                console.error('Error loading categories:', err);
            }
        });
    }

    loadLanguages(): void {
        this.languageService.getLanguageDetails().subscribe({
            next: (data: LanguageDetails[]) => {
                this.languageOptions = data.map(language => {
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
                this.buildingOptions = data.map(building => {
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
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
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

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
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
                Status: 'Available',
                BuildingId: null,
                BuildingName: '',
                FloorId: null,
                FloorNumber: 0,
                FloorName: '',
                RackId: null,
                RackNumber: 0,
                RackLabel: '',
                BookBarcode: '',
                IsActive: null
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
            BookBarcode: '',
            IsActive: ''
        };
        this.bookDialogVisible = true;
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
        this.currentBook.FloorNumber = 0;
        this.currentBook.FloorName = '';
        this.currentBook.RackId = 0;
        this.currentBook.RackNumber = 0;
        this.currentBook.RackLabel = '';

        this.floorOptions = this.floors
            .filter(floor => floor.BuildingId === this.currentBook.BuildingId)
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
                rack.FloorId === this.currentBook.FloorId)
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
                } else {
                    this.errors.AuthorId = '';
                }
                break;

            case 'PublisherId':
                if (!this.currentBook.PublisherId) {
                    this.errors.PublisherId = 'Publisher is required.';
                    isValid = false;
                } else {
                    this.errors.PublisherId = '';
                }
                break;

            case 'CategoryId':
                if (!this.currentBook.CategoryId) {
                    this.errors.CategoryId = 'Category is required.';
                    isValid = false;
                } else {
                    this.errors.CategoryId = '';
                }
                break;

            case 'LanguageId':
                if (!this.currentBook.LanguageId) {
                    this.errors.LanguageId = 'Language is required.';
                    isValid = false;
                } else {
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
                } else {
                    this.errors.Price = '';
                }
                break;

            case 'BuildingId':
                if (!this.currentBook.BuildingId) {
                    this.errors.BuildingId = 'Building is required.';
                    isValid = false;
                } else {
                    this.errors.BuildingId = '';
                }
                break;

            case 'FloorId':
                if (!this.currentBook.FloorId) {
                    this.errors.FloorId = 'Floor is required.';
                    isValid = false;
                } else {
                    this.errors.FloorId = '';
                }
                break;

            case 'RackId':
                if (!this.currentBook.RackId) {
                    this.errors.RackId = 'Rack is required.';
                    isValid = false;
                } else {
                    this.errors.RackId = '';
                }
                break;

            case 'BookBarcode':
                if (!this.currentBook.BookBarcode?.trim()) {
                    this.errors.BookBarcode = 'Barcode is required.';
                    isValid = false;
                } else {
                    this.errors.BookBarcode = '';
                }
                break;

            case 'IsActive':
                if (this.currentBook.IsActive === null) {
                    this.errors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.IsActive = '';

                }
                break;

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
        const isBookBarcodeValid = this.validateInput('BookBarcode');
        const isStatusValid = this.validateInput('IsActive');
        return isBookNameValid && isAuthorIdValid && isPublisherIdValid &&
            isCategoryIdValid && isLanguageIdValid && isPublishedYearValid &&
            isPriceValid && isBuildingIdValid && isFloorIdValid &&
            isRackIdValid && isBookBarcodeValid && isStatusValid;
    }

    saveBook(): void {
        if (!this.validateBook()) {
            return;
        }

        const payload = [this.currentBook];
        this.bookService.updateBookDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Book - Failed',
                        detail: res ? res.Message : 'Failed to update book. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Book - Success',
                        detail: 'Book updated successfully.'
                    });
                }

                this.loadBooks();
                this.bookDialogVisible = false;
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

    deleteBook(book: BookDetails): void { }
}
