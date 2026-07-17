import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationDetails } from '@app/shared/models/api.models';
import { OrganizationService } from '@app/shared/services/organization.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Tooltip } from "primeng/tooltip";
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-organization',
 imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule, Tooltip, DialogModule, InputTextModule, 
           SelectModule],
  templateUrl: './manage-organization.component.html',
  styleUrl: './manage-organization.component.scss'
})
export class ManageOrganizationComponent {
@ViewChild('dt') dataTable: Table | undefined;
private messageService = inject(MessageService);

    public organizations: OrganizationDetails[] = [];
    public showFt: boolean = false;
    public organizationNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedOrganizationNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public organizationDialogVisible: boolean = false;
    public currentOrganization: OrganizationDetails = { OrganizationId: 0, OrganizationName: '', ImagePath: '', LogoPath: '', ValidUpto: '', IsActive: true }
    public header: string = '';
    public options: { label: string, value: boolean }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ]
    public errors: { OrganizationName: string, ImagePath: string, LogoPath: string, ValidUpto: string, IsActive: string } = { 
        OrganizationName: '', 
        ImagePath: '',
        LogoPath: '',
        ValidUpto: '',
        IsActive: '' 
    };
    public imagePrefixPath: string = environment.apiUrl + environment.uploadedFilesPath;


    constructor(private organizationService: OrganizationService) { }

    ngOnInit(): void {
        this.loadOrganizations();
    }

    loadOrganizations(): void {
        this.organizationService.getOrganizationDetails().subscribe({
            next: (data: OrganizationDetails[]) => {
                this.organizations = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading organizations:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.organizationNameList = [...new Set(this.organizations.map(organization => organization.OrganizationName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.organizations.map(organization => organization.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedOrganizationNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editOrganization(_org: OrganizationDetails | null = null): void { 

        if (_org) {
                this.currentOrganization = { ..._org };
                this.header = 'Edit Organization';
            } 
            else {
                this.currentOrganization = { OrganizationId: 0, OrganizationName: '', ImagePath: null, LogoPath: null, ValidUpto: null, IsActive: true };
                this.header = 'Add Organization';
            }
            this.errors = { OrganizationName: '', ImagePath: '', LogoPath: '', ValidUpto: '', IsActive: '' };            
            this.organizationDialogVisible = true;
    }

    deleteOrganization(_org: OrganizationDetails): void {
        
        let _orgDetails = this.organizations.filter(x => x.IsActive === true && x.OrganizationId !== _org.OrganizationId);

        if(_orgDetails ==null || _orgDetails.length === 0) {
            this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Organization - Warning',
                        detail: 'Please create new Organization before deleting this one.'
                    });
            return;
        }

        _org.IsActive = false;

        this.organizationService.deleteOrganizationDetails(_org).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Organization - Failed',
                        detail: res ? res.Message : 'Failed to delete Organization details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Organization - Success',
                        detail: 'Organization deleted successfully.'
                    });

                    this.loadOrganizations();                    
                }

                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Organization - Failed',
                    detail: 'Failed to delete Organization. Please try again.'
                });
            }
        });
     }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'OrganizationName':
                const organizationName = this.currentOrganization.OrganizationName?.trim();
                if (!organizationName) {
                    this.errors.OrganizationName = 'Organization name is required.';
                    isValid = false;
                }
                else if (this.organizations.some(org => 
                    org.OrganizationName?.toLowerCase() === organizationName.toLowerCase() && 
                    org.OrganizationId !== this.currentOrganization.OrganizationId)) {
                    this.errors.OrganizationName = 'Organization already exists.';
                    isValid = false;
                }
                else {
                    this.errors.OrganizationName = '';
                }
                break;

            case 'IsActive':
                if (this.currentOrganization.IsActive === null) {
                    this.errors.IsActive = 'Status is required.';
                    isValid = false;
                }
                else {
                    this.errors.IsActive = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateOrganization(): boolean {
        const isNameValid = this.validateInput('OrganizationName');
        const isImagePathValid = this.validateInput('ImagePath');
        const isLogoPathValid = this.validateInput('LogoPath');
        const isValidUptoValid = this.validateInput('ValidUpto');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isImagePathValid && isLogoPathValid && isValidUptoValid && isStatusValid;
    }

    saveOrganization(): void {

        if (!this.validateOrganization()) {
            return;
        }

        if(this.currentOrganization.OrganizationId >0)
        {
            this.updateOrganization();
        }
        else
        {
            this.addNewOrganization();
        }

    }

    addNewOrganization(): void {
        this.organizationService.addOrganizationDetails(this.currentOrganization).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Organization - Failed',
                        detail: res ? res.Message : 'Failed to add new Organization. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Organization - Success',
                        detail: 'Organization inserted successfully.'
                    });

                        this.loadOrganizations();
                    this.organizationDialogVisible = false;

                }

                
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Organization - Failed',
                    detail: 'Failed to insert Organization. Please try again.'
                });
            }
        });
    }

    updateOrganization(): void {
        this.organizationService.updateOrganizationDetails(this.currentOrganization).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Organization - Failed',
                        detail: res ? res.Message : 'Failed to update Organization. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Organization - Success',
                        detail: 'Organization updated successfully.'
                    });
                    this.loadOrganizations();
                    this.organizationDialogVisible = false;
                }                    
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Organization - Failed',
                    detail: 'Failed to update Organization. Please try again.'
                });
            }
        });
    }

    getImageSrc(path: string | null | undefined): string {
        if (!path) {
            return '';
        }

        return path.startsWith('http') ? path : `${this.imagePrefixPath}${path}`;
    }

    onFileSelected(event: Event, type: 'image' | 'logo'): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('type', type);

        this.organizationService.uploadOrganizationImage(formData).subscribe({
            next: (response) => {
                const uploadedPath =
                    response?.filePath ||
                    response?.path ||
                    response?.imagePath ||
                    response?.logoPath;

                if (!uploadedPath) {
                    this.errors[type === 'image' ? 'ImagePath' : 'LogoPath'] =
                        'Upload failed. No file path returned.';
                    return;
                }

                if (type === 'image') {
                    this.currentOrganization.ImagePath = uploadedPath;
                    this.errors.ImagePath = '';
                } else {
                    this.currentOrganization.LogoPath = uploadedPath;
                    this.errors.LogoPath = '';
                }

                input.value = '';
            },
            error: () => {
                this.errors[type === 'image' ? 'ImagePath' : 'LogoPath'] =
                    'Image upload failed.';
            }
        });
    }

}