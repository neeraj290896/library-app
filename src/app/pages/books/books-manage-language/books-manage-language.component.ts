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
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

type ImportLanguageDetails = LanguageDetails & {
    Error: string;
};

@Component({
    selector: 'app-books-manage-language',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        FormsModule, SelectModule, TooltipModule],
    templateUrl: './books-manage-language.component.html',
    styleUrl: './books-manage-language.component.scss'
})
export class BooksManageLanguageComponent implements OnInit {
    private messageService = inject(MessageService);
    private languageService = inject(LanguageService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

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

    public importDialogVisible: boolean = false;
    public importPreview: ImportLanguageDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importLanguageNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedLanguageNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

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

    initializeImportFilterLists(): void {
        this.importLanguageNameList = [...new Set(this.importPreview.map(lang => lang.LanguageName))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(lang => lang.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
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
        this.selectedLanguageNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedLanguageNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
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

    deleteLanguage(language: LanguageDetails): void {
        const payload = [language];
        this.languageService.deleteLanguageDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Language - Failed',
                        detail: res ? res.Message : 'Failed to delete language. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Language - Success',
                        detail: 'Language deleted successfully.'
                    });
                }

                this.loadLanguages();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Language - Failed',
                    detail: 'Failed to delete language. Please try again.'
                });
            }
        });
    }

    importLanguage(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadLanguageTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Languages');
        worksheet.addRow(['LANGUAGE', 'STATUS']);

        worksheet.getRow(1).eachCell(cell => {
            cell.style = headerStyle;
        });

        worksheet.autoFilter = {
            from: 'A1',
            to: 'B1'
        };

        for (let rowIndex = 2; rowIndex <= 1000; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, 2);
            cell.dataValidation = {
                type: 'list',
                allowBlank: false,
                formulae: ['"Active,In-Active"'],
                showErrorMessage: true,
                errorTitle: 'Invalid Status',
                error: 'Please select a valid status.'
            };
        }

        worksheet.columns.map(col => {
            const lengths = col.values === undefined ? [] : col.values.map(v => {
                if (v === null || v === undefined) return 0;
                else return v.toString().length;
            });
            col.width = Math.max(...lengths.filter(v => typeof v === 'number')) + 10;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'import-language-template.xlsx');
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
                const expectedHeaders = ['LANGUAGE', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const languageName = row['LANGUAGE']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportLanguageDetails = {
                        LanguageId: 0,
                        LanguageName: languageName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportLanguage();
                this.initializeImportFilterLists();
            }
            catch (error) {
                this.importUploadError = 'Invalid file data.';
            }
        };
    }

    validateImportInput(key: string, index: number): boolean {
        let isValid = true;

        switch (key) {
            case 'LanguageName':
                if (!this.importPreview[index].LanguageName?.trim()) {
                    this.importPreview[index].Error = 'Language is required.';
                    isValid = false;
                }
                else if (this.languages.some(lang => lang.LanguageName?.toLowerCase() === this.importPreview[index].LanguageName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Language already exists.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            case 'IsActive':
                if (this.importPreview[index].IsActive === null) {
                    this.importPreview[index].Error = 'Status is required.';
                    isValid = false;
                }
                else {
                    this.importPreview[index].Error = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateImportLanguage(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('LanguageName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportLanguage()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                LanguageId: 0,
                LanguageName: item.LanguageName,
                IsActive: item.IsActive
            };
        });
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
}
