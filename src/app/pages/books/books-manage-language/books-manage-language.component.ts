import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@services/language.service';
import { LanguageDetails } from '@app/shared/models/api.models';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-books-manage-language',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        FormsModule, SelectModule],
    templateUrl: './books-manage-language.component.html',
    styleUrl: './books-manage-language.component.scss'
})
export class BooksManageLanguageComponent implements OnInit {
    private messageService = inject(MessageService);
    private languageService = inject(LanguageService);

    @ViewChild('dt') dataTable: Table | undefined;

    public languages: LanguageDetails[] = [];
    public showFt: boolean = false;
    public languageNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedLanguageNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public languageDialogVisible = false;
    public header: string = '';
    public currentLanguage: LanguageDetails = { LanguageId: 0, LanguageName: '', IsActive: null };
    public errors: { LanguageName: string, IsActive: string } = {
        LanguageName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    ngOnInit(): void {
        this.loadLanguages();
    }

    loadLanguages(): void {
        this.languageService.getLanguageDetails().subscribe({
            next: (data: LanguageDetails[]) => {
                this.languages = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading languages:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.languageNameList = [...new Set(this.languages.map(lang => lang.LanguageName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.languages.map(lang => lang.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedLanguageNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editLanguage(language: LanguageDetails | null = null): void {
        if (language) {
            this.currentLanguage = { ...language };
            this.header = 'Edit Language';
        }
        else {
            this.currentLanguage = { LanguageId: 0, LanguageName: '', IsActive: null };
            this.header = 'Add Language';
        }
        this.errors = { LanguageName: '', IsActive: '' };
        this.languageDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'LanguageName':
                if (!this.currentLanguage.LanguageName?.trim()) {
                    this.errors.LanguageName = 'Language is required.';
                    isValid = false;
                }
                else {
                    this.errors.LanguageName = '';
                }
                break;

            case 'IsActive':
                if (this.currentLanguage.IsActive === null) {
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

    validateLanguage(): boolean {
        const isNameValid = this.validateInput('LanguageName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveLanguage(): void {
        if (!this.validateLanguage()) {
            return;
        }

        const payload = [this.currentLanguage];
        this.languageService.updateLanguageDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Language - Failed',
                        detail: res ? res.Message : 'Failed to update language. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Language - Success',
                        detail: 'Language updated successfully.'
                    });
                }

                this.loadLanguages();
                this.languageDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Language - Failed',
                    detail: 'Failed to update language. Please try again.'
                });
            }
        });
    }

    deleteLanguage(language: LanguageDetails): void { }
}
