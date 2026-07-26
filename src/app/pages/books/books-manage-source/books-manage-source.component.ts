import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SourceDetails } from '@app/shared/models/api.models';
import { SourceService } from '@app/shared/services/source.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type ImportSourceDetails = SourceDetails & {
    Error: string;
};

@Component({
  selector: 'app-books-manage-source',
  imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './books-manage-source.component.html',
  styleUrl: './books-manage-source.component.scss'
})
export class BooksManageSourceComponent {
 private messageService = inject(MessageService);
    private sourceService = inject(SourceService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public sources: SourceDetails[] = [];
    public showFt: boolean = false;
    public sourceNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedSourceNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public sourceDialogVisible = false;
    public header: string = '';
    public currentSource: SourceDetails = { SourceId: 0, SourceName: '', IsActive: null };
    public errors: { SourceName: string, IsActive: string } = {
        SourceName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importDialogVisible: boolean = false;
    public importPreview: ImportSourceDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importSourceNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedSourceNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    ngOnInit(): void {
        this.loadSources();
    }

    loadSources(): void {
        this.sourceService.getSourceDetails().subscribe({
            next: (data: SourceDetails[]) => {
                this.sources = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading Sources:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.sourceNameList = [...new Set(this.sources.map(sub => sub.SourceName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.sources.map(sub => sub.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importSourceNameList = [...new Set(this.importPreview.map(sub => sub.SourceName))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(sub => sub.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(sub => sub.Error))]
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
        this.selectedSourceNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedSourceNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editSource(Source: SourceDetails | null = null): void {
        if (Source) {
            this.currentSource = { ...Source };
            this.header = 'Edit Source';
        }
        else {
            this.currentSource = { SourceId: 0, SourceName: '', IsActive: true };
            this.header = 'Add Source';
        }
        this.errors = { SourceName: '', IsActive: '' };
        this.sourceDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'SourceName':
              const SourceName = this.currentSource.SourceName?.trim();

              if (!SourceName) {
                  this.errors.SourceName = 'Source is required.';
                  isValid = false;
              } else if (
                  this.sources.some(_source =>
                      _source.SourceName?.trim().toLowerCase() === SourceName.toLowerCase() &&
                      _source.SourceId !== this.currentSource.SourceId
                  )
              ) {
                  this.errors.SourceName = 'Source already exists.';
                  isValid = false;
              } else {
                  this.errors.SourceName = '';
              }
              break;

            case 'IsActive':
                if (this.currentSource.IsActive === null) {
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

    validateSource(): boolean {
        const isNameValid = this.validateInput('SourceName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveSource(): void {
        if (!this.validateSource()) {
            return;
        }



        const payload = [this.currentSource];
        this.sourceService.updateSourceDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Source - Failed',
                        detail: res ? res.Message : 'Failed to update Source. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Source - Success',
                        detail: 'Source updated successfully.'
                    });
                }

                this.loadSources();
                this.sourceDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Source - Failed',
                    detail: 'Failed to update Source. Please try again.'
                });
            }
        });
    }

    deleteSource(Source: SourceDetails): void {
        const payload = [Source];
        this.sourceService.deleteSourceDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Source - Failed',
                        detail: res ? res.Message : 'Failed to delete Source. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Source - Success',
                        detail: 'Source deleted successfully.'
                    });
                }

                this.loadSources();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Source - Failed',
                    detail: 'Failed to delete Source. Please try again.'
                });
            }
        });
    }

    importSource(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadSourceTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Sources');
        worksheet.addRow(['Source', 'STATUS']);

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
        saveAs(blob, 'import-Source-template.xlsx');
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
                const expectedHeaders = ['Source', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const SourceName = row['Source']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportSourceDetails = {
                        SourceId: 0,
                        SourceName: SourceName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportSource();
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
            case 'SourceName':
                if (!this.importPreview[index].SourceName?.trim()) {
                    this.importPreview[index].Error = 'Source is required.';
                    isValid = false;
                }
                else if (this.sources.some(Source => Source.SourceName?.toLowerCase() === this.importPreview[index].SourceName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Source already exists.';
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

    validateImportSource(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('SourceName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportSource()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                SourceId: 0,
                SourceName: item.SourceName,
                IsActive: item.IsActive
            };
        });
        this.sourceService.updateSourceDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Source - Failed',
                        detail: res ? res.Message : 'Failed to update Source. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Source - Success',
                        detail: 'Source updated successfully.'
                    });
                }

                this.loadSources();
                this.sourceDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Source - Failed',
                    detail: 'Failed to update Source. Please try again.'
                });
            }
        });
    }
}
