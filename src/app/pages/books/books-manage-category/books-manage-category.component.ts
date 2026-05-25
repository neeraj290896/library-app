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
import { CategoryService } from '@services/category.service';
import { CategoryDetails } from '@app/shared/models/api.models';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

type ImportCategoryDetails = CategoryDetails & {
    Error: string;
};

@Component({
    selector: 'app-books-manage-category',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
    templateUrl: './books-manage-category.component.html',
    styleUrl: './books-manage-category.component.scss'
})
export class BooksManageCategoryComponent implements OnInit {
    private messageService = inject(MessageService);
    private categoryService = inject(CategoryService);

    @ViewChild('dt') dataTable: Table | undefined;
    @ViewChild('importDt') importDataTable: Table | undefined;

    public categories: CategoryDetails[] = [];
    public showFt: boolean = false;
    public categoryNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedCategoryNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public categoryDialogVisible = false;
    public header: string = '';
    public currentCategory: CategoryDetails = { CategoryId: 0, CategoryName: '', IsActive: null };
    public errors: { CategoryName: string, IsActive: string } = {
        CategoryName: '',
        IsActive: ''
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];

    public importDialogVisible: boolean = false;
    public importPreview: ImportCategoryDetails[] = [];
    public importUploadError: string = '';
    public importShowFt: boolean = false;
    public importCategoryNameList: { label: string, value: string }[] = [];
    public importStatusList: { label: string, value: boolean }[] = [];
    public importErrorList: { label: string, value: string }[] = [];
    public importSelectedCategoryNameList: string[] = [];
    public importSelectedStatusList: boolean[] = [];
    public importSelectedErrorList: string[] = [];

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoryService.getCategoryDetails().subscribe({
            next: (data: CategoryDetails[]) => {
                this.categories = data;
                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading categories:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.categoryNameList = [...new Set(this.categories.map(cat => cat.CategoryName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.categories.map(cat => cat.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    initializeImportFilterLists(): void {
        this.importCategoryNameList = [...new Set(this.importPreview.map(cat => cat.CategoryName))]
            .map(e => ({ label: e!, value: e! }));
        this.importStatusList = [...new Set(this.importPreview.map(cat => cat.IsActive ?? false))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
        this.importErrorList = [...new Set(this.importPreview.map(cat => cat.Error))]
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
        this.selectedCategoryNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    clearImport(): void {
        this.importDataTable?.reset();
        this.importSelectedCategoryNameList = [];
        this.importSelectedStatusList = [];
        this.importSelectedErrorList = [];
        this.importShowFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editCategory(category: CategoryDetails | null = null): void {
        if (category) {
            this.currentCategory = { ...category };
            this.header = 'Edit Category';
        }
        else {
            this.currentCategory = { CategoryId: 0, CategoryName: '', IsActive: null };
            this.header = 'Add Category';
        }
        this.errors = { CategoryName: '', IsActive: '' };
        this.categoryDialogVisible = true;
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'CategoryName':
                if (!this.currentCategory.CategoryName?.trim()) {
                    this.errors.CategoryName = 'Category is required.';
                    isValid = false;
                } else {
                    this.errors.CategoryName = '';
                }
                break;

            case 'IsActive':
                if (this.currentCategory.IsActive === null) {
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

    validateCategory(): boolean {
        const isNameValid = this.validateInput('CategoryName');
        const isStatusValid = this.validateInput('IsActive');
        return isNameValid && isStatusValid;
    }

    saveCategory(): void {
        if (!this.validateCategory()) {
            return;
        }

        const payload = [this.currentCategory];
        this.categoryService.updateCategoryDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Category - Failed',
                        detail: res ? res.Message : 'Failed to update category. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Category - Success',
                        detail: 'Category updated successfully.'
                    });
                }

                this.loadCategories();
                this.categoryDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Category - Failed',
                    detail: 'Failed to update category. Please try again.'
                });
            }
        });
    }

    deleteCategory(category: CategoryDetails): void {
        const payload = [category];
        this.categoryService.deleteCategoryDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Delete Category - Failed',
                        detail: res ? res.Message : 'Failed to delete category. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete Category - Success',
                        detail: 'Category deleted successfully.'
                    });
                }

                this.loadCategories();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Delete Category - Failed',
                    detail: 'Failed to delete category. Please try again.'
                });
            }
        });
    }

    importCategory(): void {
        this.importDialogVisible = true;
        this.importPreview = [];
        this.importUploadError = '';
    }

    async downloadCategoryTemplate(): Promise<void> {
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

        const worksheet = workbook.addWorksheet('Categories');
        worksheet.addRow(['CATEGORY', 'STATUS']);

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
        saveAs(blob, 'import-category-template.xlsx');
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
                const expectedHeaders = ['CATEGORY', 'STATUS'];
                if (headerRow.length < expectedHeaders.length || !expectedHeaders.some(header => headerRow.includes(header))) {
                    this.importUploadError = `Invalid headers. Expected: ${expectedHeaders.join(', ')}`;
                    return;
                }

                rows.forEach((row: any) => {
                    const categoryName = row['CATEGORY']?.toString().trim();
                    const isActive = row['STATUS']?.toString().trim().toLowerCase() === 'active';

                    const importItem: ImportCategoryDetails = {
                        CategoryId: 0,
                        CategoryName: categoryName,
                        IsActive: isActive,
                        Error: ''
                    };
                    this.importPreview.push(importItem);
                });

                this.validateImportCategory();
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
            case 'CategoryName':
                if (!this.importPreview[index].CategoryName?.trim()) {
                    this.importPreview[index].Error = 'Category is required.';
                    isValid = false;
                }
                else if (this.categories.some(cat => cat.CategoryName?.toLowerCase() === this.importPreview[index].CategoryName?.toLowerCase())) {
                    this.importPreview[index].Error = 'Category already exists.';
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

    validateImportCategory(): boolean {
        return this.importPreview.every((item, index) => {
            return this.validateImportInput('CategoryName', index) &&
                this.validateImportInput('IsActive', index);
        });
    }

    saveImport(): void {
        if (!this.importPreview.length) {
            this.importUploadError = 'No data to import.';
            return;
        }

        if (!this.validateImportCategory()) {
            return;
        }

        const payload = this.importPreview.map(item => {
            return {
                CategoryId: 0,
                CategoryName: item.CategoryName,
                IsActive: item.IsActive
            };
        });
        this.categoryService.updateCategoryDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Category - Failed',
                        detail: res ? res.Message : 'Failed to update category. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Category - Success',
                        detail: 'Category updated successfully.'
                    });
                }

                this.loadCategories();
                this.categoryDialogVisible = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Category - Failed',
                    detail: 'Failed to update category. Please try again.'
                });
            }
        });
    }
}
