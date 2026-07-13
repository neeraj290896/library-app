import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { DashboardService } from '@app/shared/services/dashboard.service';
import { AuthorDetails, BookCirculationDetails, BookDetails, BuildingDetails, CategoryDetails, DashboardSummaryDetails, DepartmentDetails, FloorDetails, LanguageDetails, OverDueDetails, PublisherDetails, RackDetails, RoleDetails, UserDetails } from '@app/shared/models/api.models';
import { OverDueService } from '@app/shared/services/overdue.service';
import { BooksOverdueComponent } from '../checkout/books-overdue/books-overdue.component';
import { BooksManageBooksComponent } from '../books/books-manage-books/books-manage-books.component';
import { ManageIssuedBooksComponent } from '../checkout/manage-issued-books/manage-issued-books.component';
import { ManageUsersComponent } from '../admin/manage-users/manage-users.component';
import { AuthorService } from '@app/shared/services/author.service';
import { BuildingService } from '@app/shared/services/building.service';
import { CategoryService } from '@app/shared/services/category.service';
import { FloorService } from '@app/shared/services/floor.service';
import { LanguageService } from '@app/shared/services/language.service';
import { PublisherService } from '@app/shared/services/publisher.service';
import { RackService } from '@app/shared/services/rack.service';
import { BookService } from '@app/shared/services/book.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { RoleService } from '@app/shared/services/role.service';
import { UserService } from '@app/shared/services/user.service';
import { IssueReturnBooksComponent } from '../checkout/issue-return-books/issue-return-books.component';
import { SearchComponent } from '@app/shared/components/search/search.component';
import { AuthService } from '@app/shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { DepartmentService } from '@app/shared/services/department.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { NgxBarcode6 } from 'ngx-barcode6';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule,
        FormsModule, InputTextModule, PaginatorModule, DialogModule, NgxBarcode6,
        BooksOverdueComponent, BooksManageBooksComponent, QRCodeComponent, 
        ManageIssuedBooksComponent, ManageUsersComponent,
        MultiSelectModule, SelectModule, DatePickerModule, TooltipModule,
        IssueReturnBooksComponent, SearchComponent, ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    private dashboardService = inject(DashboardService);
    private overDueService = inject(OverDueService);
    private messageService = inject(MessageService);
    private bookService = inject(BookService);
    private authorService = inject(AuthorService);
    private publisherService = inject(PublisherService);
    private categoryService = inject(CategoryService);
    private languageService = inject(LanguageService);
    private buildingService = inject(BuildingService);
    private floorService = inject(FloorService);
    private rackService = inject(RackService);
    private userService = inject(UserService);
    private roleService = inject(RoleService);
    private authService = inject(AuthService);
    public departmentService = inject(DepartmentService);
    private confirmationService = inject(ConfirmationService);

    public currentDate: Date = new Date();

    public booksManageDialogVisible: boolean = false;
    public issuedBooksDialogVisible: boolean = false;
    public overdueDialogVisible: boolean = false;
    public usersDialogVisible: boolean = false;

    public dashboardSummary: { label: string; total: number; active: number, isActiveVisible: boolean }[] = [
        { label: 'Total Books', total: 0, active: 0, isActiveVisible: true },
        { label: 'Issued Books', total: 0, active: 0, isActiveVisible: false },
        { label: 'Overdue Books', total: 0, active: 0, isActiveVisible: false },
        { label: 'Total Users', total: 0, active: 0, isActiveVisible: true }
    ];
    public overDues: OverDueDetails[] = [];

    public addNewBookDialogVisible: boolean = false;
    public registerUserDialogVisible: boolean = false;
    public issueBookDialogVisible: boolean = false;

    public authors: AuthorDetails[] = [];
    public publishers: PublisherDetails[] = [];
    public categories: CategoryDetails[] = [];
    public languages: LanguageDetails[] = [];
    public buildings: BuildingDetails[] = [];
    public floors: FloorDetails[] = [];
    public racks: RackDetails[] = [];
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
        FloorNumber: '',
        FloorName: '',
        RackId: null,
        RackNumber: 0,
        RackLabel: '',
        BookBarcode: '',
        IsActive: null
    };
    public bookErrors: {
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

    public roles: RoleDetails[] = [];
    public currentUser: UserDetails = {
        UserId: 0,
        FullName: '',
        Gender: '',
        DOB: '',
        MailId: '',
        MobileNo: '',
        ProfilePhoto: '',
        RoleId: 0,
        RoleName: '',
        DepartmentId: 0,
        DepartmentName: '',
        AdmissionNumber: 0,
        StaffId: '',
        CreatedByUserId: 0,
        CreatedByUserName: '',
        IsActive: true,
        Status: 'Pending'
    };
    public userErrors: {
        FullName: string,
        Gender: string,
        DOB: string,
        MailId: string,
        MobileNo: string,
        RoleId: string,
        DepartmentId: string,
        AdmissionNumber: string,
        StaffId: string,
        Status: string,
        IsActive: string
    } = {
            FullName: '',
            Gender: '',
            DOB: '',
            MailId: '',
            MobileNo: '',
            RoleId: '',
            DepartmentId: '',
            AdmissionNumber: '',
            StaffId:'',
            Status: '',
            IsActive: ''
        };
    public roleOptions: { label: string; value: number; }[] = [];
    public genderOptions: { label: string; value: string; }[] = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
        { label: 'Others', value: 'O' },
    ];
    public userStatusOptions: { label: string; value: string; }[] = [
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Pending', value: 'Pending' }
    ];

    public userMinDate: Date | undefined;
    public userMaxDate: Date | undefined;

    public bc: BookCirculationDetails | null = null;
    public type: string = '';
    public bcDialogVisible: boolean = false;
    public loggedInUserDetails: UserDetails | null = null;
    public departmentEligibleForRoleIdAbove: number  = 1;
    public departmentOptions: { label: string; value: number; }[] = [];
    public departments: DepartmentDetails[] = [];
    calendarFocusDate!: Date; 
    public dobDate: Date | null = null;
    public studentRoleId: number  = 5;
    public users: UserDetails[] = [];
    public books: BookDetails[] = [];
    public selectedUserDetails: UserDetails[] = [];
    public selectedUserIds: number[] = [];
    public printUserDialogVisible: boolean = false;
    public selectedBookDetails: BookDetails[] = [];
    public selectedBookIds: number[] = [];
    public printBarcodeDialogVisible: boolean = false;    

    ngOnInit(): void {
        this.departmentEligibleForRoleIdAbove = environment.departmentEligibleForRoleIdAbove;
        this.studentRoleId = environment.studentRoleId;

        let today = new Date();
        let year = today.getFullYear();
        let userMinYear = year - 100;
        let userMaxYear = year - environment.studentsMinimumAge;

        this.userMinDate = new Date();
        this.userMinDate.setDate(1);
        this.userMinDate.setMonth(0);
        this.userMinDate.setFullYear(userMinYear);

        this.userMaxDate = new Date();
        this.userMaxDate.setMonth(11);
        this.userMaxDate.setDate(31);
        this.userMaxDate.setFullYear(userMaxYear);

        this.calendarFocusDate = new Date(this.userMaxDate.getFullYear(),  today.getMonth(), today.getDate());

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
     

        this.loggedInUserDetails = this.authService.userData() ?? this.authService.userDataTemp;

        this.loadDashboardSummary();
        this.loadOverDueDetails();
        this.loadAuthors();
        this.loadPublishers();
        this.loadCategories();
        this.loadLanguages();
        this.loadBuildings();
        this.loadFloors();
        this.loadRacks();
        this.loadRoleDetails();
        this.loadDepartmentDetails();
        this.loadUserDetails();
        this.loadBooks();
    }

    parseCustomDateStringForUI(dateStr: Date): string {
        const day = String(dateStr.getDate()).padStart(2, '0');
        const month = String(dateStr.getMonth() + 1).padStart(2, '0');
        const year = dateStr.getFullYear();

        return `${year}-${month}-${day}`;
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

    loadDashboardSummary(): void {
        this.dashboardService.getDashboardSummary().subscribe({
            next: (data: DashboardSummaryDetails[]) => {
                if (data && data.length > 0) {
                    this.dashboardSummary = [
                        { label: 'Total Books', total: data[0].TotalBooks || 0, active: data[0].TotalActiveBooks || 0, isActiveVisible: true },
                        { label: 'Issued Books', total: data[0].ActiveBorrowedBooks || 0, active: 0, isActiveVisible: false },
                        { label: 'Overdue Books', total: data[0].ActiveOverDue || 0, active: 0, isActiveVisible: false },
                        { label: 'Total Users', total: data[0].TotalUsers || 0, active: data[0].ActiveUsers || 0, isActiveVisible: true }
                    ];
                }
            },
            error: (err) => {
                console.error('Error loading dashboard summary:', err);
            }
        });
    }

    loadOverDueDetails(): void {
        this.overDueService.getOverDueDetails().subscribe({
            next: (data: OverDueDetails[]) => {
                this.overDues = data?.filter(x => x.OverDueStatus == "Pending");
            },
            error: (err) => {
                console.error('Error loading overDue :', err);
            }
        });
    }

    loadAuthors(): void {
        this.authorService.getAuthorDetails().subscribe({
            next: (data: AuthorDetails[]) => {
                this.authors = data;
                this.authorOptions = data.filter(x=> x.IsActive == true).map(author => {
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
                this.publisherOptions = data.filter(x=> x.IsActive == true).map(publisher => {
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
                this.categoryOptions = data.filter(x=> x.IsActive == true).map(category => {
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
                this.languages = data;
                this.languageOptions = data.filter(x=> x.IsActive == true).map(language => {
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
                this.buildingOptions = data.filter(x=> x.IsActive == true).map(building => {
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

    loadRoleDetails(): void {
        this.roleService.getRoleDetails().subscribe({
            next: (data: RoleDetails[]) => {
                this.roles = data.filter(x => x.RoleId >= (this.loggedInUserDetails?.RoleId ?? 0));
                this.roleOptions = data.filter(x=> x.IsActive == true).map(role => {
                    return { label: role.RoleName ?? '', value: role.RoleId };
                });
            },
            error: (err) => {
                console.error('Error loading role:', err);
            }
        });
    }

    loadDepartmentDetails(): void {
        this.departmentService.getDepartmentDetails().subscribe({
            next: (data: DepartmentDetails[]) => {
                this.departments = data;
                this.departmentOptions = data.filter(x=> x.IsActive == true).map(dept => {
                return { label: dept.DepartmentName ?? '', value: dept.DepartmentId };
            });
            },
            error: (err :any) => {
                console.error('Error loading departments:', err);
            }
        });
    }

    openSummaryDetails(label: string) {
        switch (label) {
            case 'Total Books':
                this.booksManageDialogVisible = true;
                break;
            case 'Issued Books':
                this.issuedBooksDialogVisible = true;
                break;
            case 'Overdue Books':
                this.overdueDialogVisible = true;
                break;
            case 'Total Users':
                this.usersDialogVisible = true;
                break;
        }
    }

    openAddNewBookDialog(): void {
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
            FloorNumber: '',
            FloorName: '',
            RackId: null,
            RackNumber: 0,
            RackLabel: '',
            BookBarcode: '',
            IsActive: true
        };
        this.publishedDate = null;
        this.bookErrors = {
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
        this.addNewBookDialogVisible = true;
    }

    onLanguageChange(): void {
        const language = this.languageOptions.find(l => l.value === this.currentBook.LanguageId);
        if (language) {
            this.currentBook.LanguageName = language.label;
        }

        this.validateBookInput('LanguageId');
    }

    onCategoryChange(): void {
        const category = this.categoryOptions.find(c => c.value === this.currentBook.CategoryId);
        if (category) {
            this.currentBook.CategoryName = category.label;
        }

        this.validateBookInput('CategoryId');
    }

    onPublisherChange(): void {
        const publisher = this.publisherOptions.find(p => p.value === this.currentBook.PublisherId);
        if (publisher) {
            this.currentBook.PublisherName = publisher.label;
        }

        this.validateBookInput('PublisherId');
    }

    onAuthorChange(): void {
        const author = this.authorOptions.find(a => a.value === this.currentBook.AuthorId);
        if (author) {
            this.currentBook.AuthorName = author.label;
        }

        this.validateBookInput('AuthorId');
    }

    onPublishedYearChange(): void {
        if (this.publishedDate) {
            this.currentBook.PublishedYear = this.publishedDate.getFullYear();
        }
        else {
            this.currentBook.PublishedYear = null;
        }

        this.validateBookInput('PublishedYear');
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

        this.validateBookInput('BuildingId');
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

        this.validateBookInput('FloorId');
    }

    onRackChange(): void {
        const rack = this.racks.find(r => r.RackId === this.currentBook.RackId);
        if (rack) {
            this.currentBook.RackNumber = rack.RackNumber;
            this.currentBook.RackLabel = rack.RackLabel;
        }

        this.validateBookInput('RackId');
    }

    validateBookInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.currentBook.BookName?.trim()) {
                    this.bookErrors.BookName = 'Book is required.';
                    isValid = false;
                } else {
                    this.bookErrors.BookName = '';
                }
                break;

            case 'AuthorId':
                if (!this.currentBook.AuthorId) {
                    this.bookErrors.AuthorId = 'Author is required.';
                    isValid = false;
                } else {
                    this.bookErrors.AuthorId = '';
                }
                break;

            case 'PublisherId':
                if (!this.currentBook.PublisherId) {
                    this.bookErrors.PublisherId = 'Publisher is required.';
                    isValid = false;
                } else {
                    this.bookErrors.PublisherId = '';
                }
                break;

            case 'CategoryId':
                if (!this.currentBook.CategoryId) {
                    this.bookErrors.CategoryId = 'Category is required.';
                    isValid = false;
                } else {
                    this.bookErrors.CategoryId = '';
                }
                break;

            case 'LanguageId':
                if (!this.currentBook.LanguageId) {
                    this.bookErrors.LanguageId = 'Language is required.';
                    isValid = false;
                } else {
                    this.bookErrors.LanguageId = '';
                }
                break;

            case 'PublishedYear':
                if (!this.currentBook.PublishedYear) {
                    this.bookErrors.PublishedYear = 'Published year is required.';
                    isValid = false;
                } else {
                    this.bookErrors.PublishedYear = '';
                }
                break;

            case 'Price':
                if (!/^\d+(\.\d+)?$/.test(this.currentBook.Price?.toString().trim() ?? '')) {
                    this.bookErrors.Price = 'Price is required and must be a valid input.';
                    isValid = false;
                } else {
                    this.bookErrors.Price = '';
                }
                break;

            case 'BuildingId':
                if (!this.currentBook.BuildingId) {
                    this.bookErrors.BuildingId = 'Building is required.';
                    isValid = false;
                } else {
                    this.bookErrors.BuildingId = '';
                }
                break;

            case 'FloorId':
                if (!this.currentBook.FloorId) {
                    this.bookErrors.FloorId = 'Floor is required.';
                    isValid = false;
                } else {
                    this.bookErrors.FloorId = '';
                }
                break;

            case 'RackId':
                if (!this.currentBook.RackId) {
                    this.bookErrors.RackId = 'Rack is required.';
                    isValid = false;
                } else {
                    this.bookErrors.RackId = '';
                }
                break;

            case 'BookBarcode':
                if (!this.currentBook.BookBarcode?.trim()) {
                    this.bookErrors.BookBarcode = 'Barcode is required.';
                    isValid = false;
                } else {
                    this.bookErrors.BookBarcode = '';
                }
                break;

            case 'IsActive':
                if (this.currentBook.IsActive === null) {
                    this.bookErrors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.bookErrors.IsActive = '';

                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateBook(): boolean {
        const isBookNameValid = this.validateBookInput('BookName');
        const isAuthorIdValid = this.validateBookInput('AuthorId');
        const isPublisherIdValid = this.validateBookInput('PublisherId');
        const isCategoryIdValid = this.validateBookInput('CategoryId');
        const isLanguageIdValid = this.validateBookInput('LanguageId');
        const isPublishedYearValid = this.validateBookInput('PublishedYear');
        const isPriceValid = this.validateBookInput('Price');
        const isBuildingIdValid = this.validateBookInput('BuildingId');
        const isFloorIdValid = this.validateBookInput('FloorId');
        const isRackIdValid = this.validateBookInput('RackId');
        // const isBookBarcodeValid = this.validateBookInput('BookBarcode');
        // const isStatusValid = this.validateBookInput('IsActive');
        return isBookNameValid && isAuthorIdValid && isPublisherIdValid &&
            isCategoryIdValid && isLanguageIdValid && isPublishedYearValid &&
            isPriceValid && isBuildingIdValid && isFloorIdValid &&
            isRackIdValid;
            //  && isBookBarcodeValid && isStatusValid;
    }

    saveBook(): void {
        if (!this.validateBook()) {
            return;
        }

        const isBookExistsAlready = this.books.find(x => x.BookName == this.currentBook.BookName && x.AuthorId == this.currentBook.AuthorId && 
                            x.PublisherId == this.currentBook.PublisherId && x.CategoryId == this.currentBook.CategoryId && x.LanguageId == this.currentBook.LanguageId &&
                            x.PublishedYear == this.currentBook.PublishedYear);

        if(isBookExistsAlready !=null && isBookExistsAlready.BookId >0)
        {
            this.bookErrors.BookName = 'Book already exists.';           

            return;
        }

        const payload = [this.currentBook];
        this.bookService.addBookDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Add Book - Failed',
                        detail: res ? res.Message : 'Failed to add book. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Add Book - Success',
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
                                this.addNewBookDialogVisible = false;
                                this.onBookSelectionChange();
                                this.printBookBarcode();

                            },
                            reject: () => {
                                this.addNewBookDialogVisible = false;
                            }
                        });
                    }

                }

                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Add Book - Failed',
                    detail: 'Failed to add book. Please try again.'
                });
            }
        });
    }

    openRegisterUserDialog(): void {
        this.currentUser = {
            UserId: 0, FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', ProfilePhoto: '', RoleId: 0, RoleName: '', DepartmentId:0, DepartmentName:'',
            CreatedByUserId: this.loggedInUserDetails?.UserId, CreatedByUserName: this.loggedInUserDetails?.FullName, IsActive: true, Status: 'Pending'
        };

        this.dobDate = null;

        this.userErrors = { FullName: '', Gender: '', DOB: '', MailId: '', MobileNo: '', RoleId: '', DepartmentId: '', AdmissionNumber:'', StaffId:'', Status: '', IsActive: '' };
        this.registerUserDialogVisible = true;
    }

    onRoleChange(): void {
        
        const role = this.roleOptions.find(l => l.value === this.currentUser.RoleId);
        if (role) {
            this.currentUser.RoleName = role.label;
        }

        this.validateUserInput('RoleId');

        if(this.currentUser.RoleId !=null && this.currentUser.RoleId <= this.departmentEligibleForRoleIdAbove)
        {
            this.currentUser.DepartmentId = 0;
            this.currentUser.DepartmentName = "";
            this.currentUser.StaffId = "";
        }    

        if(this.currentUser.RoleId !=null && this.currentUser.RoleId < this.studentRoleId)
        {
            this.currentUser.AdmissionNumber = 0;            
        }

        if(this.currentUser.RoleId !=null && this.currentUser.RoleId == this.studentRoleId)
        {
            this.currentUser.StaffId = "";          
        }

        this.validateUserInput('DepartmentId');
        this.validateUserInput('AdmissionNumber');
        this.validateUserInput('StaffId');
    
    }

    onDepartmentChange(): void{
        const department = this.departmentOptions.find(l => l.value === this.currentUser.DepartmentId);
        if (department) {
            this.currentUser.DepartmentName = department.label;
        }

        this.validateUserInput('DepartmentId');
    }

    onDOBChange(): void {
        if (this.dobDate) {
            // this.dobDate.setHours(0, 0, 0, 0);
             // Reverse the 5 hour 30 min shift (in minutes: 5 * 60 + 30 = 330)
            const userTimezoneOffset = this.dobDate.getTimezoneOffset(); // Will be -330 for India    
            const correctedDate = new Date(this.dobDate.getTime() - (userTimezoneOffset * 60 * 1000));    

            this.currentUser.DOB = correctedDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
        }
        else {
            this.currentUser.DOB = null;
        }

        this.validateUserInput('DOB');
    }

    validateUserInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'FullName':
                if (!this.currentUser.FullName?.trim()) {
                    this.userErrors.FullName = 'Full name is required.';
                    isValid = false;
                } else {
                    this.userErrors.FullName = '';
                }
                break;

            case 'RoleId':
                if (!(this.currentUser.RoleId != null && this.currentUser.RoleId > 0)) {
                    this.userErrors.RoleId = 'Please select Role.';
                    isValid = false;
                } else {
                    this.userErrors.RoleId = '';
                }
                break;

            case 'Gender':
                if (!this.currentUser.Gender?.trim()) {
                    this.userErrors.Gender = 'Please select Gender.';
                    isValid = false;
                } else {
                    this.userErrors.Gender = '';
                }
                break;

            case 'MailId':
                if (!this.currentUser.MailId?.trim()) {
                    this.userErrors.MailId = 'MailId is required.';
                    isValid = false;
                } 
                else if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.currentUser.MailId?.trim())))
                {
                    this.userErrors.MailId = 'Valid MailId is required.';
                    isValid = false;
                }
                else if(this.users.find(x => x.MailId?.trim() == this.currentUser.MailId?.trim())){
                    this.userErrors.MobileNo = 'MailId already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.MailId = '';
                }
                break;

            case 'MobileNo':
                if (!this.currentUser.MobileNo?.trim()) {
                    this.userErrors.MobileNo = 'MobileNo is required.';
                    isValid = false;
                }
                else if(!(/^[6-9]\d{9}$/.test(this.currentUser.MobileNo?.trim()))){
                    this.userErrors.MobileNo = 'Valid MobileNo is required.';
                    isValid = false;
                } 
                else if(this.users.find(x => x.MobileNo == this.currentUser.MobileNo?.trim())){
                    this.userErrors.MobileNo = 'MobileNo already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.MobileNo = '';
                }
                break;

            case 'DOB':
                if (!this.currentUser.DOB?.trim()) {
                    this.userErrors.DOB = 'DOB is required.';
                    isValid = false;
                } else {
                    this.userErrors.DOB = '';
                }
                break;
                
            case 'DepartmentId':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove) && !(this.currentUser.DepartmentId != null && this.currentUser.DepartmentId > 0)) {
                    this.userErrors.DepartmentId = 'Please select Department.';
                    isValid = false;
                } else {
                    this.userErrors.DepartmentId = '';
                }
                break;
            
            case 'AdmissionNumber':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId == this.studentRoleId) && !(this.currentUser.AdmissionNumber !=null && this.currentUser.AdmissionNumber > 0)) {
                    this.userErrors.AdmissionNumber = 'Adminssion Number is required.';
                    isValid = false;
                } 
                else if ((this.currentUser.RoleId != null && this.currentUser.RoleId == this.studentRoleId) && !(this.currentUser.AdmissionNumber !=null && this.currentUser.AdmissionNumber>0) && this.users.find(x => x.AdmissionNumber == this.currentUser.AdmissionNumber && x.UserId != this.currentUser.UserId)) {
                    this.userErrors.AdmissionNumber = 'Adminssion Number already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.AdmissionNumber = '';
                }
                break;
            
            case 'StaffId':
                if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove && this.currentUser.RoleId < this.studentRoleId) && !(this.currentUser.StaffId !=null && this.currentUser.StaffId.trim() !="")) {
                    this.userErrors.StaffId = 'StaffId is required.';
                    isValid = false;
                } 
                else if ((this.currentUser.RoleId != null && this.currentUser.RoleId > this.departmentEligibleForRoleIdAbove && this.currentUser.RoleId < this.studentRoleId) && !(this.currentUser.StaffId !=null && this.currentUser.StaffId.trim() !="") && this.users.find(x => x.StaffId == this.currentUser.StaffId && x.UserId != this.currentUser.UserId)) {
                    this.userErrors.StaffId = 'StaffId is already exists.';
                    isValid = false;
                }
                else {
                    this.userErrors.StaffId = '';
                }
                break;
            
            case 'Status':
                if (this.currentUser.Status === null) {
                    this.userErrors.Status = 'Access Request Status is required.';
                    isValid = false;
                } else {
                    this.userErrors.Status = '';
                }
                break;

            case 'IsActive':
                if (this.currentUser.IsActive === null) {
                    this.userErrors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.userErrors.IsActive = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateUser(): boolean {
        const isNameValid = this.validateUserInput('FullName');
        const isRoleIdValid = this.validateUserInput('RoleId');
        const isGenderValid = this.validateUserInput('Gender');
        const isMailIdValid = this.validateUserInput('MailId');
        const isMobileNoValid = this.validateUserInput('MobileNo');
        const isDOBValid = this.validateUserInput('DOB');
        const isDepartmentIdValid = this.validateUserInput('DepartmentId');
        const isAdmissionNumberValid = this.validateUserInput('AdmissionNumber');
        const isStaffIdValid = this.validateUserInput('StaffId');
        // const isAccessRequestValid = this.validateUserInput('Status');
        // const isStatusValid = this.validateUserInput('IsActive');
        return isNameValid && isRoleIdValid && isGenderValid &&
            isMailIdValid && isMobileNoValid && isDOBValid && isDepartmentIdValid && isAdmissionNumberValid && isStaffIdValid;
            // && isAccessRequestValid && isStatusValid
    }

    saveUser(): void {
        if (!this.validateUser()) {
            return;
        }

        const payload = this.currentUser;
        this.userService.addUserDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage User - Failed',
                        detail: res ? res.Message : 'Failed to add new User. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage User - Success',
                        detail: 'User added successfully.'
                    });

                    this.loadUserDetails();
                    

                    this.confirmationService.confirm({
                        message: "Do you want to print user's barcode?",
                        header: 'Print Confirmation',
                        icon: 'pi pi-print',
                        acceptLabel: 'Yes',
                        rejectLabel: 'No',
                        accept: () => {
                            this.selectedUserDetails = this.users.filter(x => x.FullName == this.currentUser.FullName && x.RoleId == this.currentUser.RoleId && x.MobileNo == this.currentUser.MobileNo
                                && x.MailId == this.currentUser.MailId
                            );
                            this.registerUserDialogVisible = false;
                            this.onUserSelectionChange();
                            this.printUserBarcode();

                        },
                        reject: () => {
                            this.registerUserDialogVisible = false;
                        }
                    });

                }                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage User - Failed',
                    detail: 'Failed to add new User. Please try again.'
                });
            }
        });
    }

    openIssueBookDialog(): void {
        this.bc = null;
        this.type = 'CheckOut';
        this.issueBookDialogVisible = true;
    }

    openReturnBooksDialog(): void {
        this.issuedBooksDialogVisible = true;
    }

    validateNumberInput(event: KeyboardEvent, allowedKeys : string[]): void {    
        const isNumber = event.key >= '0' && event.key <= '9';

        // If it's not a number and not in our allowed keys list, block the input
        if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    loadUserDetails(): void {        
        this.userService.getAllUserDetails().subscribe({
            next: (data: UserDetails[]) => {
                this.users = data.filter(x => x.IsActive == true);                
            },
            error: (err) => {
                console.error('Error loading users:', err);
            }
        });        
    }

    loadBooks(): void {

        this.bookService.getAllBookDetails().subscribe({
            next: (data: BookDetails[]) => {
                this.books = data.filter(x => x.IsActive == true);                
            },
            error: (err) => {
                console.error('Error loading books:', err);
            }
        });
        
    }

    onUserSelectionChange() {
        this.selectedUserIds = this.selectedUserDetails
            .map(x => x.UserId)
            .filter((id): id is number => id !== null && id !== undefined);

        console.log('Selected User IDs:', this.selectedUserIds);
    }

    printUserBarcode() {
        if (this.selectedUserIds != null && this.selectedUserIds.length > 0) {
            this.printUserDialogVisible = true;
        }
    }

    onBookSelectionChange() {
        // Extract only the IDs from the selected objects
        this.selectedBookIds = this.selectedBookDetails.map(x => x.BookId);

        console.log('Selected Book IDs:', this.selectedBookIds);
    }

    printBookBarcode() {
        if (this.selectedBookIds != null && this.selectedBookIds.length > 0) {
            this.printBarcodeDialogVisible = true;
        }
    }

    printTable(): void {
        window.print();
    }
}
