import { Component, inject, ViewChild } from '@angular/core';
import { SubjectDetails } from '@app/shared/models/api.models';
import { SubjectService } from '@app/shared/services/subject.service';
import { Table, TableModule } from 'primeng/table';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

type ImportSubjectDetails = SubjectDetails & {
    Error: string;
};

@Component({
  selector: 'app-books-manage-subject',
  imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './books-manage-subject.component.html',
  styleUrl: './books-manage-subject.component.scss'
})
export class BooksManageSubjectComponent {
  private messageService = inject(MessageService);
    private subjectService = inject(SubjectService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public subjects: SubjectDetails[] = [];
    public showFt: boolean = false;
    public subjectNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedSubjectNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public subjectDialogVisible = false;
    public header: string = '';
    public currentSubject: SubjectDetails = { SubjectId: 0, SubjectName: '', IsActive: null };
    public errors: { SubjectName: string, IsActive: string } = {
        SubjectName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importDialogVisible: boolean = false;
    public importPreview: ImportSubjectDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importSubjectNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedSubjectNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    ngOnInit(): void {
        this.loadSubjects();
    }

    loadSubjects(): void {
        this.subjectService.getSubjectDetails().subscribe({
            next: (data: SubjectDetails[]) => {
                this.subjects = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading subjects:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.subjectNameList = [...new Set(this.subjects.map(sub => sub.SubjectName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.subjects.map(sub => sub.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importSubjectNameList = [...new Set(this.importPreview.map(sub => sub.SubjectName))]
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
        this.selectedSubjectNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedSubjectNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editSubject(subject: SubjectDetails | null = null): void {
        if (subject) {
            this.currentSubject = { ...subject };
            this.header = 'Edit Subject';
        }
        else {
            this.currentSubject = { SubjectId: 0, SubjectName: '', IsActive: true };
            this.header = 'Add Subject';
        }
        this.errors = { SubjectName: '', IsActive: '' };
        this.subjectDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'SubjectName':
              const subjectName = this.currentSubject.SubjectName?.trim();

              if (!subjectName) {
                  this.errors.SubjectName = 'Subject is required.';
                  isValid = false;
              } else if (
                  this.subjects.some(subject =>
                      subject.SubjectName?.trim().toLowerCase() === subjectName.toLowerCase() &&
                      subject.SubjectId !== this.currentSubject.SubjectId
                  )
              ) {
                  this.errors.SubjectName = 'Subject already exists.';
                  isValid = false;
              } else {
                  this.errors.SubjectName = '';
              }
              break;

            case 'IsActive':
                if (this.currentSubject.IsActive === null) {
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

    validateSubject(): boolean {
        const isNameValid = this.validateInput('SubjectName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveSubject(): void {
        if (!this.validateSubject()) {
            return;
        }



        const payload = [this.currentSubject];
        this.subjectService.updateSubjectDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Subject - Failed',
                        detail: res ? res.Message : 'Failed to update subject. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Subject - Success',
                        detail: 'Subject updated successfully.'
                    });
                }

                this.loadSubjects();
                this.subjectDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Subject - Failed',
                    detail: 'Failed to update subject. Please try again.'
                });
            }
        });
    }

    deleteSubject(subject: SubjectDetails): void {
        const payload = [subject];
        this.subjectService.deleteSubjectDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Subject - Failed',
                        detail: res ? res.Message : 'Failed to delete subject. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Subject - Success',
                        detail: 'Subject deleted successfully.'
                    });
                }

                this.loadSubjects();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Subject - Failed',
                    detail: 'Failed to delete subject. Please try again.'
                });
            }
        });
    }

    importSubject(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadSubjectTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Subjects');
        worksheet.addRow(['SUBJECT', 'STATUS']);

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
        saveAs(blob, 'import-subject-template.xlsx');
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
                const expectedHeaders = ['SUBJECT', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const subjectName = row['SUBJECT']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportSubjectDetails = {
                        SubjectId: 0,
                        SubjectName: subjectName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportSubject();
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
            case 'SubjectName':
                if (!this.importPreview[index].SubjectName?.trim()) {
                    this.importPreview[index].Error = 'Subject is required.';
                    isValid = false;
                }
                else if (this.subjects.some(subject => subject.SubjectName?.toLowerCase() === this.importPreview[index].SubjectName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Subject already exists.';
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

    validateImportSubject(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('SubjectName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportSubject()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                SubjectId: 0,
                SubjectName: item.SubjectName,
                IsActive: item.IsActive
            };
        });
        this.subjectService.updateSubjectDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Subject - Failed',
                        detail: res ? res.Message : 'Failed to update subject. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Subject - Success',
                        detail: 'Subject updated successfully.'
                    });
                }

                this.loadSubjects();
                this.subjectDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Subject - Failed',
                    detail: 'Failed to update subject. Please try again.'
                });
            }
        });
    }
}
