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
    EnableEmailNotification: boolean;
    EnableWishlistNotification: boolean;
    EnableMobileNotification: boolean;
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
    Status?: string | null;
    BuildingId?: number | null;
    BuildingName?: string | null;
    FloorId?: number | null;
    FloorNumber?: number | null;
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
    IssuedByUserId?: number | null;
    IssuedByUserName?: string | null;
    IssuedDate?: string | null;
    OverDueId?: number | null;
    FineAmount?: number | null;
    OverDueFrom?: string | null;
    OverDueDays?: number | null;
    OverDueStaus?: string | null;
    SytemUpdatedDate?: string | null;
    ReturnByUserId?: number | null;
    ReturnByUserName?: string | null;
    ReturnDate?: string | null;
    Comments?: string | null;
    Status?: string | null;
    UpdatedByUserId?: number | null;
    UpdatedByUserName?: string | null;
    UpdatedDate?: string | null;
}

export interface BuildingDetails {
    BuildingId: number;
    StateId: number;
    DistrictId: number;
    CityId: number;
    AreaId: number;
    AddressLine1?: string | null;
    AddressLine2?: string | null;
    AddressLine3?: string | null;
    BuildingName?: string | null;
    IsActive: boolean;
}

export interface CategoryDetails {
    CategoryId: number;
    CategoryName?: string | null;
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
    FloorNumber: number;
    FloorName?: string | null;
    IsActive: boolean;
}

export interface LanguageDetails {
    LanguageId: number;
    LanguageName?: string | null;
    IsActive: boolean | null;
}

export interface ImportLanguageDetails {
    LanguageId: number;
    LanguageName?: string | null;
    IsActive: boolean | null;
    Error: string;
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
    ProfilePhoto?: string | null;
    CreatedBy?: string | null;
    Status?: string | null;
}

export interface OrganizationDetails {
    OrganizationId: number;
    OrganizationName?: string | null;
    LogoPath?: string | null;
    ImagePath?: string | null;
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
    FloorNumber: number;
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
    ProfilePhoto?: string | null;
    Status?: string | null;
    CreatedByUserId?: number | null;
    CreatedByUserName?: string | null;
    LastLogInTime?: string | null;
    IsActive?: boolean | null;
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



export interface TransactionTypeDetails {
   TypeId: number;
   TypeName?: string | null;
   IsActive: boolean;
}

export interface OverDueDetails {
    OverDueId?: number | null;
    BookCirculationId: number;
    BookId: number;
    BookName?: string | null;
    IssuedDate: string;
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
}