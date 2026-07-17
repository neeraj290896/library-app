export interface AccessRequestDetails {
    UserId: number;
    RoleId: number;
    RoleName?: string | null;
    FullName?: string | null;
    MobileNo?: string | null;
    MailId?: string | null;
    Status?: string | null;
    CreatedDate: string;
    ApprovedBy?: number | null;
    ApprovedByUserName?: string | null;
    ApprovedDate?: string | null;
}

export interface SettingDetails {
    SettingId: number;
    CutOffDays: number;
    FinePercentage: number;
    EnableFineRule: boolean;
    EnableEmailNotification: boolean;
    EnableWishlistNotification: boolean;
    EnableMobileNotification: boolean;
    EnableBarcodeScanning: boolean;
    ReminderMailNotificationInDays: number;
    IsActive: boolean;
}

export interface AreaDetails {
    AreaId: number;
    StateId: number;
    StateName?: string | null;
    DistrictId: number;
    DistrictName?: string | null;
    CityId: number;
    CityName?: string | null;
    AreaName?: string | null;
    Pincode: number;
    IsActive: boolean;
}

export interface AuthorDetails {
    AuthorId: number;
    AuthorName?: string | null;
    IsActive: boolean | null;
}

export interface BookDetails {
    BookId: number;
    BookName?: string | null;
    AuthorId?: number | null;
    AuthorName?: string | null;
    PublisherId?: number | null;
    PublisherName?: string | null;
    CategoryId?: number | null;
    CategoryName?: string | null;
    LanguageId?: number | null;
    LanguageName?: string | null;
    PublishedYear?: number | null;
    Price?: number | null;
    BillNo?: string | null;
    CallNo?: string | null;
    AccessionNo?: string | null;
    Source?: string | null;
    SubjectId?: number | null;
    SubjectName?: string | null;
    Status?: string | null;
    BuildingId?: number | null;
    BuildingName?: string | null;
    FloorId?: number | null;
    FloorNumber?: string | null;
    FloorName?: string | null;
    RackId?: number | null;
    RackNumber?: number | null;
    RackLabel?: string | null;
    BookBarcode?: string | null;
    IsActive: boolean | null;
}

export interface BookCirculationDetails {
    BookCirculationId: number;
    BookId: number;
    BookName?: string | null;
    BorrowerId?: number | null;
    BorrowerName?: string | null;
    BorrowerMailId?: string | null;
    IssuedByUserId?: number | null;
    IssuedByUserName?: string | null;
    IssuedByUserMailId?: string | null;
    IssuedDate?: string | null;
    OverDueId?: number | null;
    FineAmount?: number | null;
    OverDueFrom?: string | null;
    OverDueDays?: number | null;
    OverDueStatus?: string | null;
    SytemUpdatedDate?: string | null;
    ReturnByUserId?: number | null;
    ReturnByUserName?: string | null;
    ReturnDate?: string | null;
    ReturnByUserMailId?: string | null;
    Comments?: string | null;
    Status?: string | null;
    UpdatedByUserId?: number | null;
    UpdatedByUserName?: string | null;
    UpdatedDate?: string | null;
    UpdatedByUserMailId?: string | null;  
    PaidAmount?: number | 0;
    PaymentTypeId?: number | 0;
    PaidOn?: string | null;
    PaidByUserId?: number | null;
    PaidByUserName?: string | null;
    PaidByUserMailId?: string | null;
    
}

export interface BuildingDetails {
    BuildingId: number;
    StateId: number;
    StateName?: string | null;
    DistrictId: number;
    DistrictName?: string | null;    
    CityId: number;
    CityName?: string | null;
    AreaId: number;
    AreaName?:string | null;
    AddressLine1?: string | null;
    AddressLine2?: string | null;
    AddressLine3?: string | null;
    BuildingName?: string | null;
    IsActive: boolean;
    CreatedByUserId: number;
    CreatedByUserName?: string | null
}

export interface CategoryDetails {
    CategoryId: number;
    CategoryName?: string | null;
    IsActive: boolean | null;
}

export interface SubjectDetails {
    SubjectId: number;
    SubjectName?: string | null;
    IsActive: boolean | null;
}

export interface CityDetails {
    CityId: number;
    StateId: number;
    StateName?: string | null;
    DistrictId: number;
    DistrictName?: string | null;
    CityName?: string | null;
    IsActive: boolean;
}

export interface CredDetails {
    MobileNo?: string | null;
    MailId?: string | null;
    Password?: string | null;
}

export interface DepartmentDetails {
    DepartmentId: number;
    DepartmentName?: string | null;
    IsActive: boolean;
}

export interface DistrictDetails {
    DistrictId: number;
    StateId: number;
    StateName?: string | null;
    DistrictName?: string | null;
    IsActive: boolean;
}

export interface FloorDetails {
    FloorId: number;
    BuildingId: number;
    BuildingName?: string | null;
    FloorNumber?: string | null;
    FloorName?: string | null;
    IsActive: boolean;
}

export interface LanguageDetails {
    LanguageId: number;
    LanguageName?: string | null;
    IsActive: boolean | null;
}

export interface LoggedInUserDetails {
    UserId?: number | null;
    LoggedInTime?: string | null;
    Location?: string | null;
    IPAddress?: string | null;
}

export interface MultipleUserDetails {
    RoleId?: number | null;
    FullName?: string | null;
    Gender?: string | null;
    MobileNo?: string | null;
    DOB?: string | null;
    MailId?: string | null;
    DepartmentId?: number | null;
    ProfilePhoto?: string | null;
    CreatedBy?: string | null;
    Status?: string | null;
}

export interface OrganizationDetails {
    OrganizationId: number;
    OrganizationName: string | null;
    LogoPath?: string | null;
    ImagePath?: string | null;
    ValidUpto?: string | null;
    IsActive: boolean;
}

export interface OtpDetails {
    MobileNo?: string | null;
    MailId?: string | null;
    Otp?: string | null;
}

export interface PublisherDetails {
    PublisherId: number;
    PublisherName?: string | null;
    IsActive: boolean | null;
}

export interface RackDetails {
    RackId: number;
    BuildingId: number;
    BuildingName?: string | null;
    FloorId: number;
    FloorNumber?: string | null;
    FloorName?: string | null;
    RackNumber: number;
    RackLabel?: string | null;
    IsActive: boolean;
}

export interface ResetCredPassword {
    UserId?: number | null;
    OldPwd?: string | null;
    NewPwd?: string | null;
}

export interface RoleDetails {
    RoleId: number;
    RoleName?: string | null;
    IsActive: boolean;
    UserHasEditAccess: boolean;
    UserCanLogin: boolean;
}

export interface StateDetails {
    StateId: number;
    StateName?: string | null;
    IsActive: boolean;
}

export interface TransactionTypeDetails {
    TypeId: number;
    TypeName?: string | null;
    IsActive: boolean;
}

export interface TransactionDetails {
    TransactionId: number;
    UserId: number;
    UserName?: string | null;
    TypeId: number;
    TypeName?: string | null;
    BookCirculationId: number;
    BookId: number;
    BookName?: string | null;
    IssuedDate: string;
    IssuedByUserId: number;
    IssuedByUserName?: string | null;
    BookCirculationStatus?: string | null;
    Comments?: string | null;
    OverDueId?: number | null;
    FineAmount?: number | null;
    OverDueFrom?: string | null;
    OverDueDays?: number | null;
    OverDueStatus?: string | null;
    SytemUpdatedDate?: string | null;
    PaidAmount?: number | null;
    PaidOn?: string | null;
    TransactionStatus?: string | null;
    ReturnDate?: string | null;
    PaidByUserId?: number | null;
    PaidByUserName?: string | null;
    ReceivedByUserId?: number | null;
    ReceivedByUserName?: string | null;
    UpdatedByUserId?: number | null;
    UpdatedByUserName?: string | null;
}

export interface UserDetails {
    UserId?: number | null;
    RoleId?: number | null;
    RoleName?: string | null;
    FullName?: string | null;
    Gender?: string | null;
    MobileNo?: string | null;
    DOB?: string | null;
    MailId?: string | null;
    DepartmentId?: number | null;
    DepartmentName?: string | null;
    AdmissionNumber?: number | null;
    StaffId?: string | null;
    ProfilePhoto?: string | null;
    Status?: string | null;
    CreatedByUserId?: number | null;
    CreatedByUserName?: string | null;
    LastLogInTime?: string | null;
    UserBarcode?: string | null;
    IsActive?: boolean | null;
    LibraryNo?: string | null;
    Batch?: string | null;
    IsFirstTimeLogin?: boolean | null;
    BorrowedBooksCount?: number | null;
    OverDueBooksCount?: number | null;
}


export interface RoleDetails {
    RoleId: number;
    RoleName?: string | null;
    IsActive: boolean;
}

export interface DepartmentDetails {
    DepartmentId: number;
    DepartmentName?: string | null;
    IsActive: boolean;
}


export interface OverDueDetails {
    OverDueId?: number | null;
    BookCirculationId: number;
    BookId: number;
    BookName?: string | null;
    IssuedDate?: string | null;
    IssuedByUserId: number;
    IssuedByUserName?: string | null;
    BorrowerId: number;
    BorrowerName?: string | null;
    FineAmount?: number | null;
    OverDueFrom?: string | null;
    OverDueDays?: number | null;
    OverDueStatus?: string | null;
    CreatedDate?: string | null;
    UpdatedDate?: string | null;
    UpdatedByUserId?: number | null;
    UpdatedByUserName?: string | null;
    SytemUpdatedDate?: string | null;
    ReturnByUserId?: number | null;
    ReturnByUserName?: string | null;
    ReturnDate?: string | null;
    ReturnByUserMailId?: string | null;
    BorrowerMailId?: string | null;
    IssuedByUserMailId?: string | null;
    UpdatedByUserMailId?: string | null;
    Status?: string | null;
    Comments?: string | null;
    PaidAmount?: number | 0;
    PaymentTypeId?: number | 0;
}

export interface DashboardSummaryDetails {
    TotalBooks?: number;
    TotalActiveBooks?: number;
    TotalBorrowedBooks?: number;
    ActiveBorrowedBooks?: number;
    TotalOverDue?: number;
    ActiveOverDue?: number;
    TotalUsers?: number;
    ActiveUsers?: number;
}

export interface OverDueRefreshDetails {
    Id: number;    
    Status?: string | null;    
    CreatedDate?: string | null;
    UpdatedDate?: string | null;
}


export interface WishlistDetails {
    WishlistId: number; 
    BookId: number;
    BookName: string;   
    UserId: number ;
    UserName: string;
    Status: string;    
    CreatedByUserId: number;
    CreatedByUserName: string;
    CreatedOn?: string |null;
    IsNotificationRead: boolean;
    IssuedOn?: string | null;
    NotifiedOn?: string | null;
    UpdatedOn?: string | null;
}