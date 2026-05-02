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
import { PublisherService } from '@services/publisher.service';
import { PublisherDetails } from '@app/shared/models/api.models';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-books-manage-publisher',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, TagModule, 
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule, 
        SelectModule, FormsModule],
    templateUrl: './books-manage-publisher.component.html',
    styleUrl: './books-manage-publisher.component.scss'
})
export class BooksManagePublisherComponent implements OnInit {
    private messageService = inject(MessageService);
    private publisherService = inject(PublisherService);

    @ViewChild('dt') dataTable: Table | undefined;

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
            .map(e => ({ label: e ? 'Active' : 'In-active', value: e }));
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

    editPublisher(publisher: PublisherDetails | null = null): void {
        if (publisher) {
            this.currentPublisher = { ...publisher };
            this.header = 'Edit Publisher';
        } 
        else {
            this.currentPublisher = { PublisherId: 0, PublisherName: '', IsActive: null };
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

    deletePublisher(publisher: PublisherDetails): void { }
}
