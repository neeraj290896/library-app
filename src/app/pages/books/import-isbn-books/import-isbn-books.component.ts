import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthorDetails, BookDetails, BuildingDetails, CategoryDetails, FloorDetails, LanguageDetails, PublisherDetails, RackDetails, SourceDetails, SubjectDetails, UserDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { AuthorService } from '@app/shared/services/author.service';
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
import { NgxBarcode6 } from 'ngx-barcode6';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-import-isbn-books',
  imports: [ CommonModule, ButtonModule, TableModule, TagModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, DatePickerModule, TooltipModule, NgxBarcode6, ConfirmDialogModule],
  templateUrl: './import-isbn-books.component.html',
  styleUrl: './import-isbn-books.component.scss'
})
export class ImportIsbnBooksComponent {

    @Output() onDialogClose = new EventEmitter<void>();
    @ViewChild('isbnInput') isbnInput!: ElementRef<HTMLInputElement>;
    public dialogVisible = true;

  private messageService = inject(MessageService);
    private cdr = inject(ChangeDetectorRef);
  private bookService = inject(BookService);
  private authorService = inject(AuthorService);
  private publisherService = inject(PublisherService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private buildingService = inject(BuildingService);
  private floorService = inject(FloorService);
  private rackService = inject(RackService);
  public _authService = inject(AuthService);
  public userService = inject(UserService);
  public subjectService = inject(SubjectService);
  public sourceService = inject(SourceService);
  private confirmationService = inject(ConfirmationService);
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
  public selectedBookDetails: BookDetails[] = [];
  public selectedIds: number[] = [];
  public printBarcodeDialogVisible: boolean = false;
  public loggedInUserDetails: UserDetails | null = null;
  public todayDate: string | undefined;
  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public billDate: Date | null = null;
  public isBarcodePrintOptionEnabled: boolean = false;
  public _isbnText : string = '';
  public isAdvancedSearchEnabled: boolean = false;
  private initialLoadCount = 0;
  private initialLoadsCompleted = 0;
  private fieldsClearedAfterInitialLoad = false;

  ngOnInit(): void {
        const today = new Date();
        this.todayDate = this.parseCustomDateStringForUI(today);

        this.maxDate = new Date();  

        this.minDate = new Date();
        this.minDate.setMonth(today.getMonth() - 1);        

        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.isBarcodePrintOptionEnabled = this._authService.settingsDetails()?.EnableBarcodePrintOption ?? false;
        
        this.initialLoadCount = 9;
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
  }

  private completeInitialLoad(): void {
      this.initialLoadsCompleted++;

      if (this.initialLoadsCompleted === this.initialLoadCount && !this.fieldsClearedAfterInitialLoad) {
          this.fieldsClearedAfterInitialLoad = true;
          this.clearAllFields();
      }
  }

  loadBooks(): void {    
      this.bookService.getAllBookDetails().subscribe({
          next: (data: BookDetails[]) => {
              this.books = data;
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading books:', err);
              this.completeInitialLoad();
          }
      });

    }

  loadAuthors(): void {
      this.authorService.getAuthorDetails().subscribe({
          next: (data: AuthorDetails[]) => {
              this.authors = data;
              this.authorOptions = data.filter(x => x.IsActive == true).map(author => {
                  return { label: author.AuthorName ?? '', value: author.AuthorId };
              });
              this.completeInitialLoad();

              if(this.currentBook.AuthorName !=null && this.currentBook.AuthorName.trim() !='' && this.currentBook.AuthorId == null)
              {
                    const matchingAuthor = this.authorOptions.find(option => option.label.toLowerCase() === this.currentBook.AuthorName?.trim().toLowerCase());
                    if (matchingAuthor) {
                        this.currentBook.AuthorId = matchingAuthor.value;
                        this.errors.AuthorId = '';
                    }
              }
          },
          error: (err) => {
              console.error('Error loading authors:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();

                if(this.currentBook.PublisherName !=null && this.currentBook.PublisherName.trim() !='' && this.currentBook.PublisherId == null)
                {
                    const matchingPublisher = this.publisherOptions.find(option => option.label.toLowerCase() === this.currentBook.PublisherName?.trim().toLowerCase());
                    if (matchingPublisher) {
                        this.currentBook.PublisherId = matchingPublisher.value;
                        this.errors.PublisherId = '';
                    }
                }
          },
          error: (err) => {
              console.error('Error loading publishers:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading categories:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading subjects:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading sources:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading languages:', err);
              this.completeInitialLoad();
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
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading buildings:', err);
              this.completeInitialLoad();
          }
      });
  }

  loadFloors(): void {
      this.floorService.getAllFloorDetails().subscribe({
          next: (data: FloorDetails[]) => {
              this.floors = data;
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading floors:', err);
              this.completeInitialLoad();
          }
      });
  }

  loadRacks(): void {
      this.rackService.getAllRackDetails().subscribe({
          next: (data: RackDetails[]) => {
              this.racks = data;
              this.completeInitialLoad();
          },
          error: (err) => {
              console.error('Error loading racks:', err);
              this.completeInitialLoad();
          }
      });
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

    onSourceChange():void{
        const _source = this.sourceOptions.find(s => s.value === this.currentBook.SourceId);
        if (_source) {
            this.currentBook.SourceName = _source.label;
        }
        else
        {
            this.currentBook.SourceName = '';
        }

        // this.validateInput('SourceId');
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

        if(this.floorOptions !=null && this.floorOptions.length == 1)
        {
            this.currentBook.FloorId = this.floorOptions[0].value;            
        }

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

  onBillDateChange():void{
      if (this.billDate) {
          // this.dobDate.setHours(0, 0, 0, 0);
            // Reverse the 5 hour 30 min shift (in minutes: 5 * 60 + 30 = 330)
          const userTimezoneOffset = this.billDate.getTimezoneOffset(); // Will be -330 for India    
          const correctedDate = new Date(this.billDate.getTime() - (userTimezoneOffset * 60 * 1000));    

          this.currentBook.BillDate = correctedDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
      }
      else {
          this.currentBook.BillDate = null;
      }

      this.validateInput('BillDate');
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
                  this.errors.AuthorId = 'Please enter valid Author.';
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
                  this.errors.PublisherId = 'Please enter valid Publisher.';
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
          case 'AccessionNo':
              if (!this.currentBook.AccessionNo?.trim()) {
                  this.errors.AccessionNo = 'AccessionNo is required.';
                  isValid = false;
              }
              else if (!/^\d+$/.test(this.currentBook.AccessionNo.trim())) {
                  this.errors.AccessionNo = 'AccessionNo must contain numbers only.';
                  isValid = false;
              }
              else if (this.currentBook.AccessionNo.trim().length < 6) {
                  this.errors.AccessionNo = 'AccessionNo must be at least 6 characters.';
                  isValid = false;
              }
              else if (this.currentBook.BookId == 0 && this.books.find(x => x.AccessionNo == this.currentBook.AccessionNo?.trim())) {
                  this.errors.AccessionNo = 'AccessionNo already exists.';
                  isValid = false;
              }
              else if (this.currentBook.BookId > 0 && this.books.find(x => x.AccessionNo == this.currentBook.AccessionNo?.trim() && x.BookId != this.currentBook.BookId)) {
                  this.errors.AccessionNo = 'AccessionNo already exists.';
                  isValid = false;
              }
              else {
                  this.errors.AccessionNo = '';
              }
              break;
          case 'BillDate':
              if ((this.currentBook.BillNo?.trim()) && !(this.currentBook.BillDate?.trim())) {
                  this.errors.BillDate = 'BillDate is required.';
                  isValid = false;
              } else {
                  this.errors.BillDate = '';
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
      const isAccessionNoValid = this.validateInput('AccessionNo');
      const isBillDateValid = this.validateInput('BillDate');
      // const isStatusValid = this.validateInput('IsActive');
      return isBookNameValid && isAuthorIdValid && isPublisherIdValid &&
          isCategoryIdValid && isLanguageIdValid && isPublishedYearValid &&
          isPriceValid && isBuildingIdValid && isFloorIdValid &&
          isRackIdValid && isSubjectIdValid && isAccessionNoValid && isBillDateValid;// && isStatusValid;
  }

  saveBook(): void {
      console.log('currentBook :', this.currentBook);

      if (!this.validateBook()) {
          return;
      }

      if(this.currentBook.BookId == null || this.currentBook.BookId == 0)
      {
        const isBookExistsAlready = this.books.find(x => x.AccessionNo == this.currentBook.AccessionNo && x.BookName == this.currentBook.BookName && x.AuthorId == this.currentBook.AuthorId && 
                        x.PublisherId == this.currentBook.PublisherId && x.CategoryId == this.currentBook.CategoryId && x.LanguageId == this.currentBook.LanguageId &&
                        x.PublishedYear == this.currentBook.PublishedYear);

        if(isBookExistsAlready !=null && isBookExistsAlready.BookId >0)
        {
            this.errors.BookName = 'Book already exists.';
            return;
        }

        this.addNewBook([this.currentBook]);
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

                  if(this.isBarcodePrintOptionEnabled)
                  {
                      
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
                                  
                                  this.onSelectionChange();
                                  this.printBarcode();

                              },
                              reject: () => {
                                  this.clearAllFields();
                              }
                          });
                      }
                  }

                  this.clearAllFields();
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

  printBarcode() {
      if (this.selectedIds != null && this.selectedIds.length > 0) {
          this.printBarcodeDialogVisible = true;
      }
  }

  parseCustomDateStringForUI(dateStr: Date): string {
      // 2. Pad single digits with leading zeros
      const day = String(dateStr.getDate()).padStart(2, '0');
      const month = String(dateStr.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = dateStr.getFullYear();

      // 3. Assemble into the exact "yyyy-mm-dd" layout match        
      return `${year}-${month}-${day}`;
  }

  printTable(): void {
      window.print();
  }

   onSelectionChange() {
        // Extract only the IDs from the selected objects
        this.selectedIds = this.selectedBookDetails.map(x => x.BookId);

        console.log('Selected IDs:', this.selectedIds);
    }

  clearAllFields(): void {

    this._isbnText = '';
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
      BillDate:null,
      TotalPageNo:null,
      CallNo: '',
      AccessionNo: '',
      SourceId: null,
      SourceName: '',
      SubjectId: null,
      SubjectName: '',
      Status: 'Available',
      BuildingId: this.buildingOptions.length == 1 ? this.buildingOptions[0].value : null,
      BuildingName: this.buildingOptions.length == 1 ? this.buildingOptions[0].label : '',
      FloorId: null,
      FloorNumber: null,
      FloorName: '',
      RackId: null,
      RackNumber: 0,
      RackLabel: '',
      BookBarcode: '',
      IsActive: null
    };

    this.onBuildingChange();
    this.cdr.detectChanges();

    setTimeout(() => {
        this.onFloorChange();
    }, 150);

    this.focusISBNInput();

  }

    private focusISBNInput(): void {
        setTimeout(() => {
            this.isbnInput?.nativeElement.focus();
        }, 150);
    }

    closeDialog(): void {
        this.dialogVisible = false;
        this.onDialogClose.emit();
    }

  getISBNDetails(): void {

    this.isAdvancedSearchEnabled = false;

    if(this._isbnText !=null)
    {
        this.bookService.getISBNDetails(this._isbnText).subscribe({
            next: (data: any) => {
                console.log('ISBN Details:', data);
                if (data && data.title) {
                    this.currentBook.BookName = data.title || '';
                    this.currentBook.AuthorName = data.authors ? data.authors.map((author: any) => author.name).join(' & ') : '';
                    this.currentBook.PublisherName = data.publishers ? data.publishers.map((publisher: any) => publisher.name).join(' & ') : '';
                    this.currentBook.PublishedYear = data.publish_date ? parseInt(data.publish_date.split(' ')[data.publish_date.split(' ').length - 1]) : null;
                    this.currentBook.LanguageName = data.languages ? data.languages.map((lang: any) => lang.name).join(', ') : '';
                    this.currentBook.TotalPageNo = data.number_of_pages || null;
                }
                else
                {
                  this.isAdvancedSearchEnabled = true;
                }
            }
        });
    }
    else
    {
        this.messageService.add({
            severity: 'error',
            summary: 'ISBN Search - Failed',
            detail: 'Please enter a valid ISBN number.'
        });
    }

  }

  getAdvancedSearchResults(): void {
    if(this._isbnText !=null)
    {
        this.bookService.getAdvancedSearchForISBNDetails(this._isbnText).subscribe({
            next: (data: any) => {
                console.log('ISBN Details:', data);
                if (data && data.totalItems && data.totalItems > 0) {
                    const volumeInfo = data.items[0]?.volumeInfo;
                    const publishedDate = volumeInfo?.publishedDate;

                    this.currentBook.BookName = volumeInfo?.title || '';
                    this.currentBook.AuthorName = volumeInfo?.authors?.join(' & ') || '';
                    this.currentBook.PublisherName = volumeInfo?.publisher || '';
                    this.currentBook.PublishedYear = publishedDate ? parseInt(publishedDate.substring(0, 4), 10) : null;
                    this.currentBook.LanguageName = volumeInfo?.language || '';
                    this.currentBook.TotalPageNo = volumeInfo?.pageCount || null;
                    this.currentBook.CategoryName = volumeInfo?.categories[0] || '';
                }
            } 
        });
    }
    else
    {
        this.messageService.add({
            severity: 'error',
            summary: 'ISBN Search - Failed',
            detail: 'Please enter a valid ISBN number.'
        });
    }

  }

  validateNumberInput(event: KeyboardEvent, allowedKeys : string[]): void {    
        const isNumber = event.key >= '0' && event.key <= '9';
    
            // If it's not a number and not in our allowed keys list, block the input
            if (!isNumber && !allowedKeys.includes(event.key)) {
            event.preventDefault();
            }
    }

    validateAuthorAndPublisher():void{
        if(this.currentBook.AuthorName !=null && this.currentBook.AuthorName.trim() !='')
        {
            const matchingAuthor = this.authorOptions.find(option => option.label.toLowerCase() === this.currentBook.AuthorName?.trim().toLowerCase());
            if (matchingAuthor) {
                this.currentBook.AuthorId = matchingAuthor.value;
                this.errors.AuthorId = '';
            } else {
                this.saveAuthor();   
            }
        }

        if(this.currentBook.PublisherName !=null && this.currentBook.PublisherName.trim() !='')
        {
            const matchingPublisher = this.publisherOptions.find(option => option.label.toLowerCase() === this.currentBook.PublisherName?.trim().toLowerCase());
            if (matchingPublisher) {
                this.currentBook.PublisherId = matchingPublisher.value;
                this.errors.PublisherId = '';
            } else {
                this.savePublisher();
            }
        }
    }

    saveAuthor(): void {
        
        let _currentAuthor: AuthorDetails = {
            AuthorId: 0,
            AuthorName: this.currentBook.AuthorName,
            IsActive: true  };

        const payload = [_currentAuthor];
        this.authorService.updateAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Validate Author - Failed',
                        detail: res ? res.Message : 'Failed to validate author. Please try again.'
                    });
                } else {
                    this.loadAuthors();
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Validate Author - Failed',
                    detail: 'Failed to validate author. Please try again.'
                });
            }
        });
    }

    savePublisher(): void {
        
        let _currentPublisher: PublisherDetails = {
            PublisherId: 0,
            PublisherName: this.currentBook.PublisherName,
            IsActive: true  };

        const payload = [_currentPublisher];
        this.publisherService.updatePublisherDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Validate Publisher - Failed',
                        detail: res ? res.Message : 'Failed to Validate publisher. Please try again.'
                    });
                } else {
                    this.loadPublishers();
                }              
                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Validate Publisher - Failed',
                    detail: 'Failed to validate publisher. Please try again.'
                });
            }
        });
    }

}
