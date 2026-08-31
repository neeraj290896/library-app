import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddWishlistComponent } from '@app/pages/books/add-wishlist/add-wishlist.component';
import { BooksViewCirculationComponent } from '@app/pages/books/books-view-circulation/books-view-circulation.component';
import { ManageWishlistComponent } from '@app/pages/books/manage-wishlist/manage-wishlist.component';
import { IssueReturnBooksComponent } from '@app/pages/checkout/issue-return-books/issue-return-books.component';
import { AuthorDetails, BookCirculationDetails, BookDetails, BuildingDetails, CategoryDetails, FloorDetails, LanguageDetails, PublisherDetails, RackDetails, SourceDetails, SubjectDetails, UserDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { AuthorService } from '@app/shared/services/author.service';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { BookService } from '@app/shared/services/book.service';
import { BuildingService } from '@app/shared/services/building.service';
import { CategoryService } from '@app/shared/services/category.service';
import { FloorService } from '@app/shared/services/floor.service';
import { LanguageService } from '@app/shared/services/language.service';
import { PublisherService } from '@app/shared/services/publisher.service';
import { RackService } from '@app/shared/services/rack.service';
import { SourceService } from '@app/shared/services/source.service';
import { SubjectService } from '@app/shared/services/subject.service';
import { UserService } from '@app/shared/services/user.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-view-report-book-details',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, DatePickerModule, TooltipModule, TabViewModule, BooksViewCirculationComponent, IssueReturnBooksComponent,
         ManageWishlistComponent, AddWishlistComponent, ConfirmDialogModule],
  templateUrl: './view-report-book-details.component.html',
  styleUrl: './view-report-book-details.component.scss'
})
export class ViewReportBookDetailsComponent {

    @Input() public statsData: BookDetails[] = [];
    @Input() public reportHeader: string = 'Last 10 transactions';

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
    public sourceService = inject(SourceService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public books: BookDetails[] = [];
    public authors: AuthorDetails[] = [];
    public publishers: PublisherDetails[] = [];
    public categories: CategoryDetails[] = [];
    public subjects: SubjectDetails[] = [];
    public sources: SourceDetails[] = [];
    public languages: LanguageDetails[] = [];
    public buildings: BuildingDetails[] = [];
    public floors: FloorDetails[] = [];
    public racks: RackDetails[] = [];
    public showFt: boolean = false;
    public bookNameList: { label: string, value: string }[] = [];
    public authorNameList: { label: string, value: string }[] = [];
    public publisherNameList: { label: string, value: string }[] = [];
    public categoryNameList: { label: string, value: string }[] = [];
    public accessionNoList: { label: string, value: string }[] = [];
    public subjectList: { label: string, value: string }[] = [];
    public publishedYearList: { label: number, value: number }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedBookNameList: string[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedPublisherNameList: string[] = [];
    public selectedCategoryNameList: string[] = [];
    public selectedSubjectList: string[] = [];
    public selectedAccessionNoList: string[] = [];
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
        BillDate:null,
        TotalPageNo:null,
        CallNo: '',
        AccessionNo: '',
        SourceId: null,
        SourceName: '',
        SubjectId: null,
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
        BillDate: string,
        BuildingId: string,
        FloorId: string,
        RackId: string,
        SubjectId: string,
        AccessionNo: string,
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
            BillDate:'',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            AccessionNo: '',
            BookBarcode: '',
            IsActive: ''
        };
    public authorOptions: { label: string; value: number; }[] = [];
    public publisherOptions: { label: string; value: number; }[] = [];
    public categoryOptions: { label: string; value: number; }[] = [];
    public subjectOptions: { label: string; value: number; }[] = [];
    public sourceOptions: { label: string; value: number; }[] = [];
    public languageOptions: { label: string; value: number; }[] = [];
    public buildingOptions: { label: string; value: number; }[] = [];
    public floorOptions: { label: string; value: number; }[] = [];
    public rackOptions: { label: string; value: number; }[] = [];
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public activeTab: number = 0;

    public selectedBookDetails: BookDetails[] = [];
    public selectedIds: number[] = [];
    public printBarcodeDialogVisible: boolean = false;
    public isViewOnly: boolean = true;

    public loggedInUserDetails: UserDetails | null = null;
    public bc: BookCirculationDetails | null = null;
    public type: string = '';
    public bcDialogVisible: boolean = false;
    public todayDate: string | undefined;
    public addWishlistDialogVisible: boolean = false;
    public isBarcodeSearch : boolean = false;
    public searchUserTerm: string = '';
    public lstUserDetails: UserDetails[] = [];
    public minDate: Date | undefined;
    public maxDate: Date | undefined;
    public billDate: Date | null = null;
    
    ngOnInit(): void {
        const today = new Date();
        this.todayDate = this.parseCustomDateStringForUI(today);

        this.maxDate = new Date();  

        this.minDate = new Date();
        this.minDate.setMonth(today.getMonth() - 1);        

        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        
        this.loadBooks();
        this.loadAuthors();
        this.loadPublishers();
        this.loadCategories();
        this.loadSubjects();
        this.loadSources();
        this.loadLanguages();
        this.loadBuildings();
        this.loadFloors();
        this.loadRacks();
        this.loadUserDetails();
    }

    loadBooks(): void {
      if(this.statsData !=null && this.statsData.length >0)
      {
          this.books = [...this.statsData];
          this.initializeFilterLists();
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

    loadSources(): void {
        this.sourceService.getSourceDetails().subscribe({
            next: (data: SourceDetails[]) => {
                this.sources = data;
                this.sourceOptions = data.filter(x => x.IsActive == true).map(subject => {
                    return { label: subject.SourceName ?? '', value: subject.SourceId };
                });
            },
            error: (err) => {
                console.error('Error loading sources:', err);
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
        this.accessionNoList = [...new Set(this.books.map(book => book.AccessionNo))]
            .map(e => ({ label: e!, value: e! }));
        this.publishedYearList = [...new Set(this.books.map(book => book.PublishedYear))]
            .map(e => ({ label: e!, value: e! }));
        this.subjectList = [...new Set(this.books.map(book => book.SubjectName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.books.map(book => book.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
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
        this.selectedAccessionNoList = [];
        this.selectedSubjectList = [];
        this.selectedPublishedYearList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(status: string): 'success' | 'danger' {
        return status == 'Available' ? 'success' : 'danger';
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

            this.billDate = book.BillDate ? new Date(book.BillDate) : null;
        }

        this.errors = {
            BookName: '',
            AuthorId: '',
            PublisherId: '',
            CategoryId: '',
            LanguageId: '',
            PublishedYear: '',
            Price: '',
            BillDate:'',
            BuildingId: '',
            FloorId: '',
            RackId: '',
            SubjectId: '',
            AccessionNo:'',
            BookBarcode: '',
            IsActive: ''
        };
        this.activeTab = 0;
        this.bookDialogVisible = true;
        this.isViewOnly = true;
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
            { header: 'ACCESSION NO', key: 'accessionNo', width: 20, style: bodyStyle },
            { header: 'BOOK', key: 'bookName', width: 30, style: bodyStyle },
            { header: 'AUTHOR', key: 'author', width: 25, style: bodyStyle },
            { header: 'PUBLISHER', key: 'publisher', width: 25, style: bodyStyle },
            { header: 'CATEGORY', key: 'category', width: 20, style: bodyStyle },
            { header: 'LANGUAGE', key: 'language', width: 20, style: bodyStyle },
            { header: 'YEAR', key: 'year', width: 15, style: bodyStyle },
            { header: 'PRICE(₹)', key: 'price', width: 15, style: bodyStyle },
            { header: 'BILL NO', key: 'billNo', width: 15, style: bodyStyle },
            { header: 'BILL DATE', key: 'billDate', width: 15, style: bodyStyle },
            { header: 'TOTAL PAGE NO', key: 'pageNo', width: 15, style: bodyStyle },
            { header: 'CALL NO', key: 'callNo', width: 20, style: bodyStyle },            
            { header: 'SOURCE', key: 'source', width: 20, style: bodyStyle },
            { header: 'SUBJECT', key: 'subject', width: 20, style: bodyStyle },
            { header: 'BUILDING', key: 'building', width: 20, style: bodyStyle },
            { header: 'FLOOR', key: 'floor', width: 15, style: bodyStyle },
            { header: 'RACK', key: 'rack', width: 15, style: bodyStyle },
            { header: 'STATUS', key: 'status', width: 15, style: bodyStyle },
            { header: 'CREATED DATE', key: 'createdDate', width: 15, style: bodyStyle }
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

        worksheet.autoFilter = { from: 'A1', to: 'S1' };

        // 3. Fast Row Injection using Object Keys
        // This allows ExcelJS to stream array values efficiently internal to its build process
        const rowsData = this.books.map( (book : BookDetails) => ({
            accessionNo: book.AccessionNo || '',
            bookName: book.BookName || '',
            author: book.AuthorName || '',
            publisher: book.PublisherName || '',
            category: book.CategoryName || '',
            language: book.LanguageName || '',
            year: book.PublishedYear || '',
            price: book.Price || 0,
            billNo: book.BillNo || '',
            billDate: book.BillDate || '',
            pageNo: book.TotalPageNo || '',
            callNo: book.CallNo || '',            
            source: book.SourceName || '',
            subject: book.SubjectName || '',
            building: book.BuildingName || '',
            floor: book.FloorName || '',
            rack: book.RackLabel || '',
            status: book.Status || '',
            createdDate: book.CreatedDate || ''
        }));

        worksheet.addRows(rowsData);

        // 4. File Generation
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'save-book-details.xlsx');
    }

}
