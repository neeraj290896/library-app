import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BooksManageBooksComponent } from '@app/pages/books/books-manage-books/books-manage-books.component';
import { BookDetails, StaticsticsData, StaticsticsFieldDetails } from '@app/shared/models/api.models';
import { ReportService } from '@app/shared/services/report.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import * as Xlsx from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ViewReportBookDetailsComponent } from '../view-report-book-details/view-report-book-details.component';

@Component({
  selector: 'app-statistics',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, CardModule,
        MultiSelectModule, DialogModule, InputTextModule, ViewReportBookDetailsComponent,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {

  private messageService = inject(MessageService);
  private reportService = inject(ReportService);

  @ViewChild('dt') dataTable: Table | undefined;
  @ViewChild('importDt') importDataTable: Table | undefined;

  selectedStaticstics : number = 1;
  staticsticsOptions: { label: string; value: number; }[] = [];
  statisticsFieldDetails: StaticsticsFieldDetails[] = [];
  statisticsData: StaticsticsData[] =[];
  selectedStatisticsData: StaticsticsData | null = null;
  bookDetails: BookDetails[] = [];
  public statisticsSummary: { id: number; label: string; total: number; }[] = [];
  booksManageDialogVisible: boolean = false;
  totalStatisticsCount:number = 0;
  public reportHeader: string = 'Last 10 transactions';

  ngOnInit(): void {
    this.statisticsSummary = [];
    this.loadStatisticsFieldDetails();
    this.loadStatisticsData();
  }

  loadStatisticsFieldDetails():void{
    this.reportService.getStaticsticsFieldDetails().subscribe({
        next: (data: StaticsticsFieldDetails[]) => {
            this.statisticsFieldDetails = data;
            this.initializeOptionLists();
        },
        error: (err) => {
            console.error('Error loading statistics field details:', err);
        }
    });
  }

  initializeOptionLists(): void {
        this.staticsticsOptions = this.statisticsFieldDetails.filter(x => x.IsActive == true).map(stats => {
            return { label: stats.StaticsticsField ?? '', value: stats.StaticsticsId };
        });
    }


  onStatisticsChange() {
    // Handle the change event here
    console.log('Selected Statistics:', this.selectedStaticstics);
    this.loadStatisticsData();
  }

  loadStatisticsData():void{
    this.statisticsSummary = [];
    this.totalStatisticsCount = 0;
    this.reportService.getStaticsticsData(this.selectedStaticstics).subscribe({
        next: (data: StaticsticsData[]) => {
            this.statisticsData = data;

            this.totalStatisticsCount = this.statisticsData.reduce((sum, stat) => sum + (stat.Count || 0), 0);

            this.statisticsSummary = this.statisticsData.map(stat => {
                return { id: stat.Id , label: stat.Name ?? '', total: stat.Count };
            });
        },
        error: (err) => {
            console.error('Error loading statistics data:', err);
        }
    });
  }


  openSummaryDetails(statisticsData: any):void{
    this.getBookDetailsByStatisticsId(statisticsData); 
  }

  getBookDetailsByStatisticsId(statisticsData: any): void {

    this.reportHeader = statisticsData?.label ?? '';

    this.reportService.getBookDetailsByStaticsticsId(this.selectedStaticstics, statisticsData.id).subscribe({
        next: (data: BookDetails[]) => {
            this.bookDetails = data;
            this.booksManageDialogVisible = true;
        },
        error: (err) => {
            console.error('Error loading book details:', err);
        }
    });
  }

  
  async downloadStaticsticsDetails(): Promise<void> {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('StaticsticsData');

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
        { header: 'S.NO', key: 'sno', width: 10, style: bodyStyle },
        { header: 'STATICSTICS', key: 'name', width: 30, style: bodyStyle },
        { header: 'COUNT', key: 'count', width: 10, style: bodyStyle }                
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

    worksheet.autoFilter = { from: 'A1', to: 'C1' };

    // 3. Fast Row Injection using Object Keys
    // This allows ExcelJS to stream array values efficiently internal to its build process
    const rowsData = this.statisticsData.map((stats: StaticsticsData, index: number) => ({
        sno: String(index + 1),          // Generates '1', '2', '3', etc.
        name: stats.Name || '',
        count: String(stats.Count ?? 0) // Safely handles 0 and missing values
    }));

    rowsData.push({
        sno: String(this.statisticsData.length + 1),          
        name: 'Total',                         
        count: String(this.totalStatisticsCount)        
    });


    worksheet.addRows(rowsData);

    // 4. File Generation
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'save-staticstics-details.xlsx');

  }

}
