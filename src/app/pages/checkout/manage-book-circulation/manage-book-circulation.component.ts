import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, BookDetails } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-book-circulation',
  imports: [ CommonModule, TagModule, TableModule, ButtonModule,
        FormsModule, PaginatorModule, MultiSelectModule,
        InputTextModule,],
  templateUrl: './manage-book-circulation.component.html',
  styleUrl: './manage-book-circulation.component.scss'
})
export class ManageBookCirculationComponent {
  searchBookTerm = '';
  searchUserTerm = '';
  private messageService = inject(MessageService);
  private _bcService = inject(BookCirculationService);
  @ViewChild('dt') dataTable: Table | undefined;
  public showFt: boolean = false;
  public bookNameList: { label: string, value: string }[] = [];
  public borrowerNameList: { label: string, value: string }[] = [];
  public issuedByList: { label: string, value: string }[] = [];
  public statusList: { label: string, value: string }[] = [];
  public selectedBookNameList: string[] = [];
  public selectedBorrowerNameList: string[] = [];
  public selectedIssuedByList: string[] = [];
  public selectedStatusList: string[] = [];
  public bcDetails: BookCirculationDetails[] = [];
  public filteredBcDetails: BookCirculationDetails[] = [];
  bcDetailsCount = 0;

    ngOnInit(): void {
        this.getAllBookCirculartion();
        
    }

    getAllBookCirculartion(): void{
        this._bcService.getAllBookCirculationDetails('A').subscribe({
                next: (data: BookCirculationDetails[]) => {
                    this.bcDetails = data;
                    this.filteredBcDetails = data;
                    this.bcDetailsCount = data.length;    
                    
                    this.initializeFilterLists();
                },
                error: (err) => {
                    console.error('Error loading book circulation:', err);
                }
            });
    }


  onBookSearch(term: string) {
      this.searchBookTerm = term;

      if(this.searchBookTerm !="")
      {
        if(this.filteredBcDetails !=null && this.filteredBcDetails.length >0)
        {
            
        }
      }
      else
      {
        this.filteredBcDetails = this.bcDetails;
      }
      
      
  }

  onUserSearch(term: string) {
      this.searchUserTerm = term;
  }
    initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.bcDetails.map(book => book.BookName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.borrowerNameList = [...new Set(this.bcDetails.map(book => book.BorrowerName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.issuedByList = [...new Set(this.bcDetails.map(book => book.IssuedByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.statusList = [...new Set(this.bcDetails.map(book => book.Status))].map(e => ({ label: e ?? "", value: e ?? "" }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedBorrowerNameList = [];
        this.selectedIssuedByList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(status: string): 'success' | 'warning' | 'info' {
        switch (status) {
            case 'Available': return 'success';
            case 'Borrowed': return 'warning';
            case 'Reserved': return 'info';
            default: return 'info';
        }
    }

    editBook(book: BookCirculationDetails): void { }
    
}
