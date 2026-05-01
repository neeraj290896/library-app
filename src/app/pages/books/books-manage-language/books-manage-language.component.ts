import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@services/language.service';
import { LanguageDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-manage-language',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-manage-language.component.html',
    styleUrl: './books-manage-language.component.scss'
})
export class BooksManageLanguageComponent implements OnInit {
    @ViewChild('dt') dataTable: Table | undefined;

    public languages: LanguageDetails[] = [];
    public showFt: boolean = false;
    public languageNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedLanguageNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private languageService: LanguageService) { }

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
        this.statusList = [...new Set(this.languages.map(lang => lang.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
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

    editLanguage(language: LanguageDetails): void { }

    deleteLanguage(language: LanguageDetails): void { }
}
