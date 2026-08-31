import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookCirculationDetails, SearchQuery } from '@app/shared/models/api.models';
import { BookCirculationService } from '@app/shared/services/book-circulation.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
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
import { IssueReturnBooksComponent } from '@app/pages/checkout/issue-return-books/issue-return-books.component';
import { ReportService } from '@app/shared/services/report.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-transaction-details',
  imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
          SelectModule, DatePickerModule, TooltipModule, FormsModule, IssueReturnBooksComponent],
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.scss'
})
export class TransactionDetailsComponent {

  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public fromDate: Date | undefined;
  public toDate: Date | undefined;

  private messageService = inject(MessageService);
  private reportService = inject(ReportService);
  private _bcService = inject(BookCirculationService);
  @ViewChild('dt') dataTable: Table | undefined;
  public showFt: boolean = false;
  public bookNameList: { label: string, value: string }[] = [];
  public accessionNoList: { label: string, value: string }[] = [];
  public subjectNameList: { label: string, value: string }[] = [];
  public borrowerNameList: { label: string, value: string }[] = [];
  public issuedByList: { label: string, value: string }[] = [];
  public statusList: { label: string, value: string }[] = [];
  public returnByList: { label: string, value: string }[] = [];
  public selectedBookNameList: string[] = [];
  public selectedAccessionNoList: string[] = [];
  public selectedSubjectNameList: string[] = [];
  public selectedBorrowerNameList: string[] = [];
  public selectedIssuedByList: string[] = [];
  public selectedStatusList: string[] = [];
  public selectedReturnByList: string[] = [];
  public bcDetails: BookCirculationDetails[] = [];
  public filteredBcDetails: BookCirculationDetails[] = [];
  public bc: BookCirculationDetails | null = null;
  public type: string = '';
  public bcDialogVisible: boolean = false;
  public isViewOnly: boolean = true;
  public reportHeader: string = 'Last 10 transactions';

  ngOnInit():void{
    this.maxDate = new Date(); 
    this.minDate = new Date("2026-08-01 00:00:00");
    this.getTransactionDetails('Last10');
  }

  getTransactionDetails(filterType: string):void{
   

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

    this.bcDetails = [];
    this.filteredBcDetails = [];
    this.clear();
    this.reportHeader = this.getDaysFromMode(filterType);
            

    const _searchQuery : SearchQuery = {
        DsMode : filterType,
        FromDate: filterType == "DateRange" ? this.formatToCustomDateForDB(fromDateObj) : null,
        ToDate: filterType == "DateRange" ? this.formatToCustomDateForDB(toDateObj) : null
    };

    this.reportService.viewTransactionDetailsForReport(_searchQuery).subscribe({
            next: (data: BookCirculationDetails[]) => {
                this.bcDetails = data;
                this.filteredBcDetails = data;

                this.initializeFilterLists();
            },
            error: (err) => {
                console.error('Error loading book circulation:', err);
            }
        });
  }

  initializeFilterLists(): void {
      this.bookNameList = [...new Set(this.bcDetails.map(book => book.BookName))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.accessionNoList = [...new Set(this.bcDetails.map(book => book.AccessionNo))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.subjectNameList = [...new Set(this.bcDetails.map(book => book.SubjectName))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.borrowerNameList = [...new Set(this.bcDetails.map(book => book.BorrowerName))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.issuedByList = [...new Set(this.bcDetails.map(book => book.IssuedByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.statusList = [...new Set(this.bcDetails.map(book => book.Status))].map(e => ({ label: e ?? "", value: e ?? "" }));
      this.returnByList = [...new Set(this.bcDetails.map(book => book.ReturnByUserName))].map(e => ({ label: e ?? "", value: e ?? "" }));
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
      this.selectedReturnByList = [];
      this.selectedAccessionNoList = [];
      this.selectedSubjectNameList = [];      
      this.showFt = false;
    //   this.getTransactionDetails('Last10');
  }

  getStatusSeverity(status: string, _overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
      if (status === 'Returned' && _overDueDays <= 0) {
          return 'success';
      }

      if (status === 'Returned' && _overDueDays <= 2) {
          return 'info';
      }

      if (status === 'Issued' && _overDueDays <= 2) {
          return 'info';
      }

      if (status === 'Issued' && _overDueDays > 2 && _overDueDays <= 5) {
          return 'warn';
      }

      if (status === 'Issued' && _overDueDays > 5) {
          return 'danger';
      }

      return 'secondary'
  }

  getBookDueSeverity(_dateParam: Date): 'success' | 'warn'| 'danger' | 'info' | 'secondary' {
      
      // 1. Create a copy of the parameter and strip its time
      const inputDate = new Date(_dateParam);
      inputDate.setHours(0, 0, 0, 0);

      // 2. Create a copy of today's date and strip its time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 3. Compare using timestamps
      if (inputDate.getTime() > today.getTime()) {
          return 'success';
      }

      if (inputDate.getTime() === today.getTime()) {
          return 'warn';
      }

      return 'danger'; // Remaining case: inputDate > today
      
  }

  getOverDueSeverity(_overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
      if (_overDueDays <= 2) {
          return 'info';
      }

      if (_overDueDays > 2 && _overDueDays <= 5) {
          return 'warn';
      }

      if (_overDueDays > 5) {
          return 'danger';
      }

      return 'success';
  }

  getOverDueStatusSeverity(status: string, _overDueDays: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
      if (status == null || status == undefined || status == '-') {
          return 'secondary';
      }

      if (status === 'Paid' && _overDueDays <= 0) {
          return 'success';
      }

      if (status != null && _overDueDays <= 2) {
          return 'info';
      }

      if (status != null && (_overDueDays > 2 && _overDueDays <= 5)) {
          return 'warn';
      }

      return 'danger';
  }

  viewBookCirculationDetails(_bcD: BookCirculationDetails): void {

      this.bc = _bcD;
      this.type = (_bcD.Status == "Returned") ? "CheckIn" : "CheckOut";
      this.isViewOnly = true;
      this.bcDialogVisible = true;

  }

  private formatDateTime(value: string | Date | null | undefined): string {
      if (!value) {
          return '';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
          return '';
      }

      return date.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
      });
  }

  async downloadBookCirculationDetails(): Promise<void> {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Books');

      // 1. Define Column Properties & Styles Globally (Massive Performance Boost)
      const bodyStyle: Partial<ExcelJS.Style> = {
          border: {
              top: { style: 'thin', color: { argb: '00000000' } },
              left: { style: 'thin', color: { argb: '00000000' } },
              bottom: { style: 'thin', color: { argb: '00000000' } },
              right: { style: 'thin', color: { argb: '00000000' } },
          },
          alignment: { horizontal: 'center', vertical: 'middle', wrapText: false } // Wrap text slows down rendering
      };

      // Set fixed widths to avoid heavy auto-fit calculation loops
      worksheet.columns = [
          { header: 'BOOK', key: 'bookName', width: 35, style: bodyStyle },
          { header: 'BORROWER NAME', key: 'borrowerName', width: 25, style: bodyStyle },
          { header: 'ISSUED BY', key: 'issuedBy', width: 25, style: bodyStyle },
          { header: 'ISSUED DATE', key: 'issuedDate', width: 20, style: bodyStyle },
          { header: 'STATUS', key: 'status', width: 20, style: bodyStyle },
          { header: 'RETURN BY', key: 'returnBy', width: 25, style: bodyStyle },
          { header: 'RETURN DATE', key: 'returnDate', width: 20, style: bodyStyle },
          { header: 'OVER DUE FROM', key: 'overDueFrom', width: 20, style: bodyStyle },
          { header: 'OVER DUE IN DAYS', key: 'overDueDays', width: 20, style: bodyStyle },
          { header: 'OVER DUE STATUS', key: 'overDueStatus', width: 20, style: bodyStyle }
          
      ];

      // 2. Format Header Row directly
      const headerStyle: Partial<ExcelJS.Style> = {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } },
          ...bodyStyle
      };
      
      worksheet.getRow(1).eachCell(cell => {
          cell.style = headerStyle;
      });

      worksheet.autoFilter = { from: 'A1', to: 'J1' };

      
      const rowsData = this.filteredBcDetails.map((bcDetails: BookCirculationDetails) => ({
          bookName: bcDetails.BookName || '',
          borrowerName: bcDetails.BorrowerName || '',
          issuedBy: bcDetails.IssuedByUserName || '',
          issuedDate: this.formatDateTime(bcDetails.IssuedDate),
          status: bcDetails.Status || '',
          returnBy: bcDetails.ReturnByUserName || '',
          returnDate: this.formatDateTime(bcDetails.ReturnDate),
          OverDueFrom: this.formatDateTime(bcDetails.OverDueFrom),
          overDueDays: bcDetails.OverDueDays || '',
          overDueStatus: bcDetails.OverDueStatus || ''
      }));

      worksheet.addRows(rowsData);

      // 4. File Generation
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'save-book-circulation-details.xlsx');
  }

  getDaysFromMode(filterType: string): string {
      const modeMap: Record<string, string> = {
        'Last10': 'Last 10 transaction',
        'Last30': 'Last 30 days transaction',
        'ThisMonth': 'Current month ('+ new Date().toLocaleString('default', { month: 'long' }) +') transaction', 
        'Last90':'Last 90 days transaction',
        'Last180': 'Last 180 days transaction',
        'LastYear': 'Last year ('+ (new Date().getFullYear() - 1) +') transaction',
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
