import { Component, inject } from '@angular/core';
import { UserDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { SearchComponent } from '@app/shared/components/search/search.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { SearchBooksDetailsComponent } from './search-books-details/search-books-details.component';

@Component({
  selector: 'app-report',
  imports: [CommonModule, TabViewModule, SearchComponent,  StatisticsComponent, TransactionDetailsComponent, SearchBooksDetailsComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  public activeTab: number = 0;
    private _authService = inject(AuthService);
    public loggedInUserDetails: UserDetails | null = null;
    public librarianRoleId : number = 3;

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.librarianRoleId = (environment.departmentEligibleForRoleIdAbove + 1);
    }

}
