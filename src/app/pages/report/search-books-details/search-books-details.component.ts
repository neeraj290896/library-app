import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { BookDetails, SearchQuery } from '@app/shared/models/api.models';
import { ReportService } from '@app/shared/services/report.service';
import { ViewReportBookDetailsComponent } from '../view-report-book-details/view-report-book-details.component';

@Component({
  selector: 'app-search-books-details',
  imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
          SelectModule, DatePickerModule, TooltipModule, FormsModule, ViewReportBookDetailsComponent],
  templateUrl: './search-books-details.component.html',
  styleUrl: './search-books-details.component.scss'
})
export class SearchBooksDetailsComponent {

  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public fromDate: Date | undefined;
  public toDate: Date | undefined;

  private messageService = inject(MessageService);
  private reportService = inject(ReportService);
  public books: BookDetails[] = [];
  public booksManageDialogVisible: boolean = false;
  public reportHeader: string = 'Last 10 transactions';

  ngOnInit():void{
      this.maxDate = new Date(); 
      this.minDate = new Date("2026-08-01 00:00:00");
      this.searchBookDetailsForReport('Last10');
    }
  
    searchBookDetailsForReport(filterType: string):void{
       
      let fromDateObj = new Date();
      let toDateObj = new Date();
  
      if(filterType == "DateRange")
      {
  
        if(this.fromDate == null || this.fromDate == undefined)
        {
          this.messageService.add({
                          severity: 'error',
                          summary: 'View Transaction details',
                          detail: 'Please select Fromdate.'
                      });
          return;
        }
  
        if(this.toDate == null || this.toDate == undefined)
        {
          this.messageService.add({
                          severity: 'error',
                          summary: 'View Transaction details',
                          detail: 'Please select Todate.'
                      });
          return;
        }
  
        fromDateObj = this.fromDate ? new Date(this.fromDate) : new Date();
        toDateObj = this.toDate ? new Date(this.toDate) : new Date();
      }
      else
      {
        this.fromDate = undefined;
        this.toDate = undefined;
      }
  
      this.books = [];
      this.booksManageDialogVisible = false;

      this.reportHeader = this.getDaysFromMode(filterType);
  
      const _searchQuery : SearchQuery = {
          DsMode : filterType,
          FromDate: filterType == "DateRange" ? this.formatToCustomDateForDB(fromDateObj) : null,
        ToDate: filterType == "DateRange" ? this.formatToCustomDateForDB(toDateObj) : null
      };
  
      this.reportService.viewBookDetailsForReport(_searchQuery).subscribe({
              next: (data: BookDetails[]) => {
                  this.books = data;
                  this.booksManageDialogVisible = true;
              },
              error: (err) => {
                  console.error('Error loading book circulation:', err);
              }
          });
    }

  getDaysFromMode(filterType: string): string {
      const modeMap: Record<string, string> = {
        'Last10': 'Recently Added 10 books',
        'Last30': 'Added in last 30 days',
        'ThisMonth': 'Added in Current month ('+ new Date().toLocaleString('default', { month: 'long' }) +')', 
        'Last90':'Added in last 90 days',
        'Last180':'Added in last 180 days',
        'LastYear': 'Added in last year',
         'Date': 'Date range from ' + this.formatDateText(this.fromDate) + ' - to : '+ this.formatDateText(this.toDate)
    };

    return modeMap[filterType];
  }

  formatDateText(date: Date | null | undefined): string {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB'); // Outputs: dd/mm/yyyy
  };

  formatToCustomDateForDB(inputDate: Date): string {
    //   const date = new Date(inputDateStr);

    // Validate the date input
    if (isNaN(inputDate.getTime())) {
        throw new Error("Invalid date string provided");
    }

    // Extract and pad date components
    const yyyy = inputDate.getFullYear();
    const mm = String(inputDate.getMonth() + 1).padStart(2, '0');
    const dd = String(inputDate.getDate()).padStart(2, '0');

    // Return the final formatted string
    return `${yyyy}-${mm}-${dd}`;
    }

}
