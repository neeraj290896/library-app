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
import { AuthorService } from '@services/author.service';
import { AuthorDetails } from '@app/shared/models/api.models';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

type ImportAuthorDetails = AuthorDetails & {
    Error: string;
};

@Component({
    selector: 'app-books-manage-author',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
    templateUrl: './books-manage-author.component.html',
    styleUrl: './books-manage-author.component.scss'
})
export class BooksManageAuthorComponent implements OnInit {
    private messageService = inject(MessageService);
    private authorService = inject(AuthorService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public authors: AuthorDetails[] = [];
    public showFt: boolean = false;
    public authorNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedAuthorNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public authorDialogVisible = false;
    public header: string = '';
    public currentAuthor: AuthorDetails = { AuthorId: 0, AuthorName: '', IsActive: null };
    public errors: { AuthorName: string, IsActive: string } = {
        AuthorName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importDialogVisible: boolean = false;
    public importPreview: ImportAuthorDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importAuthorNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedAuthorNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    ngOnInit(): void {
        this.loadAuthors();
    }

    loadAuthors(): void {
        this.authorService.getAuthorDetails().subscribe({
            next: (data: AuthorDetails[]) => {
                this.authors = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading authors:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.authorNameList = [...new Set(this.authors.map(author => author.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.authors.map(author => author.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importAuthorNameList = [...new Set(this.importPreview.map(author => author.AuthorName))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(author => author.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(author => author.Error))]
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
        this.selectedAuthorNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedAuthorNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editAuthor(author: AuthorDetails | null = null): void {
        if (author) {
            this.currentAuthor = { ...author };
            this.header = 'Edit Author';
        }
        else {
            this.currentAuthor = { AuthorId: 0, AuthorName: '', IsActive: true };
            this.header = 'Add Author';
        }
        this.errors = { AuthorName: '', IsActive: '' };
        this.authorDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'AuthorName':
                if (!this.currentAuthor.AuthorName?.trim()) {
                    this.errors.AuthorName = 'Author name is required.';
                    isValid = false;
                } else {
                    this.errors.AuthorName = '';
                }
                break;

            case 'IsActive':
                if (this.currentAuthor.IsActive === null) {
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

    validateAuthor(): boolean {
        const isNameValid = this.validateInput('AuthorName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveAuthor(): void {
        if (!this.validateAuthor()) {
            return;
        }

        const payload = [this.currentAuthor];
        this.authorService.updateAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Author - Failed',
                        detail: res ? res.Message : 'Failed to update author. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Author - Success',
                        detail: 'Author updated successfully.'
                    });
                }

                this.loadAuthors();
                this.authorDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Author - Failed',
                    detail: 'Failed to update author. Please try again.'
                });
            }
        });
    }

    deleteAuthor(author: AuthorDetails): void {
        const payload = [author];
        this.authorService.deleteAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Author - Failed',
                        detail: res ? res.Message : 'Failed to delete author. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Author - Success',
                        detail: 'Author deleted successfully.'
                    });
                }

                this.loadAuthors();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Author - Failed',
                    detail: 'Failed to delete author. Please try again.'
                });
            }
        });
    }

    importAuthor(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadAuthorTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Authors');
        worksheet.addRow(['AUTHOR', 'STATUS']);

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
        saveAs(blob, 'import-author-template.xlsx');
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
                const expectedHeaders = ['AUTHOR', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const authorName = row['AUTHOR']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportAuthorDetails = {
                        AuthorId: 0,
                        AuthorName: authorName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportAuthor();
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
            case 'AuthorName':
                if (!this.importPreview[index].AuthorName?.trim()) {
                    this.importPreview[index].Error = 'Author name is required.';
                    isValid = false;
                }
                else if (this.authors.some(author => author.AuthorName?.toLowerCase() === this.importPreview[index].AuthorName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Author already exists.';
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

    validateImportAuthor(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('AuthorName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportAuthor()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                AuthorId: 0,
                AuthorName: item.AuthorName,
                IsActive: item.IsActive
            };
        });
        this.authorService.updateAuthorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Author - Failed',
                        detail: res ? res.Message : 'Failed to update author. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Author - Success',
                        detail: 'Author updated successfully.'
                    });
                }

                this.loadAuthors();
                this.authorDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Author - Failed',
                    detail: 'Failed to update author. Please try again.'
                });
            }
        });
    }
}
