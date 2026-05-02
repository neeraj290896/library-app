import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@services/category.service';
import { CategoryDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { AutoFocus } from "primeng/autofocus";

@Component({
    selector: 'app-books-manage-category',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule,
    PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
    SelectModule, FormsModule, TooltipModule, AutoFocus],
    templateUrl: './books-manage-category.component.html',
    styleUrl: './books-manage-category.component.scss'
})
export class BooksManageCategoryComponent implements OnInit {
    private messageService = inject(MessageService);
    private categoryService = inject(CategoryService);

    @ViewChild('dt') dataTable: Table | undefined;

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
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedCategoryNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
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

    deleteCategory(category: CategoryDetails): void { }
}
