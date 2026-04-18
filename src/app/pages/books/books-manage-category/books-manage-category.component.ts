import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@services/category.service';
import { CategoryDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-manage-category',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-manage-category.component.html',
    styleUrl: './books-manage-category.component.scss'
})
export class BooksManageCategoryComponent implements OnInit {
    @ViewChild('dt') dataTable: Table | undefined;

    public categories: CategoryDetails[] = [];
    public showFt: boolean = false;
    public categoryNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedCategoryNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private categoryService: CategoryService) { }

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
        this.statusList = [...new Set(this.categories.map(cat => cat.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
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

    editCategory(category: CategoryDetails): void { }

    deleteCategory(category: CategoryDetails): void { }
}
