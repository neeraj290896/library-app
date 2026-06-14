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
import { PublisherService } from '@services/publisher.service';
import { PublisherDetails } from '@app/shared/models/api.models';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

type ImportPublisherDetails = PublisherDetails & {
    Error: string;
};

@Component({
    selector: 'app-books-manage-publisher',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
    templateUrl: './books-manage-publisher.component.html',
    styleUrl: './books-manage-publisher.component.scss'
})
export class BooksManagePublisherComponent implements OnInit {
    private messageService = inject(MessageService);
    private publisherService = inject(PublisherService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public publishers: PublisherDetails[] = [];
    public showFt: boolean = false;
    public publisherNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedPublisherNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public publisherDialogVisible = false;
    public header: string = '';
    public currentPublisher: PublisherDetails = { PublisherId: 0, PublisherName: '', IsActive: null };
    public errors: { PublisherName: string, IsActive: string } = {
        PublisherName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importDialogVisible: boolean = false;
    public importPreview: ImportPublisherDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importPublisherNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedPublisherNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    ngOnInit(): void {
        this.loadPublishers();
    }

    loadPublishers(): void {
        this.publisherService.getPublisherDetails().subscribe({
            next: (data: PublisherDetails[]) => {
                this.publishers = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading publishers:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.publisherNameList = [...new Set(this.publishers.map(pub => pub.PublisherName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.publishers.map(pub => pub.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importPublisherNameList = [...new Set(this.importPreview.map(pub => pub.PublisherName))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(pub => pub.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(pub => pub.Error))]
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
        this.selectedPublisherNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedPublisherNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editPublisher(publisher: PublisherDetails | null = null): void {
        if (publisher) {
            this.currentPublisher = { ...publisher };
            this.header = 'Edit Publisher';
        }
        else {
            this.currentPublisher = { PublisherId: 0, PublisherName: '', IsActive: true };
            this.header = 'Add Publisher';
        }
        this.errors = { PublisherName: '', IsActive: '' };
        this.publisherDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'PublisherName':
                if (!this.currentPublisher.PublisherName?.trim()) {
                    this.errors.PublisherName = 'Publisher is required.';
                    isValid = false;
                }
                else {
                    this.errors.PublisherName = '';
                }
                break;

            case 'IsActive':
                if (this.currentPublisher.IsActive === null) {
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

    validatePublisher(): boolean {
        const isNameValid = this.validateInput('PublisherName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    savePublisher(): void {
        if (!this.validatePublisher()) {
            return;
        }

        const payload = [this.currentPublisher];
        this.publisherService.updatePublisherDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Publisher - Failed',
                        detail: res ? res.Message : 'Failed to update publisher. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Publisher - Success',
                        detail: 'Publisher updated successfully.'
                    });
                }

                this.loadPublishers();
                this.publisherDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Publisher - Failed',
                    detail: 'Failed to update publisher. Please try again.'
                });
            }
        });
    }

    deletePublisher(publisher: PublisherDetails): void {
        const payload = [publisher];
        this.publisherService.deletePublisherDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Publisher - Failed',
                        detail: res ? res.Message : 'Failed to delete publisher. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Publisher - Success',
                        detail: 'Publisher deleted successfully.'
                    });
                }

                this.loadPublishers();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Publisher - Failed',
                    detail: 'Failed to delete publisher. Please try again.'
                });
            }
        });
    }

    importPublisher(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadPublisherTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Publishers');
        worksheet.addRow(['PUBLISHER', 'STATUS']);

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
        saveAs(blob, 'import-publisher-template.xlsx');
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
                const expectedHeaders = ['PUBLISHER', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const publisherName = row['PUBLISHER']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportPublisherDetails = {
                        PublisherId: 0,
                        PublisherName: publisherName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportPublisher();
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
            case 'PublisherName':
                if (!this.importPreview[index].PublisherName?.trim()) {
                    this.importPreview[index].Error = 'Publisher is required.';
                    isValid = false;
                }
                else if (this.publishers.some(pub => pub.PublisherName?.toLowerCase() === this.importPreview[index].PublisherName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Publisher already exists.';
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

    validateImportPublisher(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('PublisherName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportPublisher()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                PublisherId: 0,
                PublisherName: item.PublisherName,
                IsActive: item.IsActive
            };
        });
        this.publisherService.updatePublisherDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Publisher - Failed',
                        detail: res ? res.Message : 'Failed to update publisher. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Publisher - Success',
                        detail: 'Publisher updated successfully.'
                    });
                }

                this.loadPublishers();
                this.publisherDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Publisher - Failed',
                    detail: 'Failed to update publisher. Please try again.'
                });
            }
        });
    }
}
