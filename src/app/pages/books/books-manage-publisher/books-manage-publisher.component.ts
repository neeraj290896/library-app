import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { PublisherService } from '@services/publisher.service';
import { PublisherDetails } from '@app/shared/models/api.models';

@Component({
    selector: 'app-books-manage-publisher',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, PaginatorModule, MultiSelectModule, FormsModule],
    templateUrl: './books-manage-publisher.component.html',
    styleUrl: './books-manage-publisher.component.scss'
})
export class BooksManagePublisherComponent implements OnInit {
    @ViewChild('dt') dataTable: Table | undefined;

    public publishers: PublisherDetails[] = [];
    public showFt: boolean = false;
    public publisherNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedPublisherNameList: string[] = [];
    public selectedStatusList: boolean[] = [];

    constructor(private publisherService: PublisherService) { }

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
        this.statusList = [...new Set(this.publishers.map(pub => pub.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'Inactive', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedPublisherNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editPublisher(publisher: PublisherDetails): void { }

    deletePublisher(publisher: PublisherDetails): void { }
}
