import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageRoleComponent } from './manage-role/manage-role.component';
import { ManageOrganizationComponent } from './manage-organization/manage-organization.component';
import { ManageDepartmentComponent } from './manage-department/manage-department.component';
import { ManageTransactiontypeComponent } from './manage-transactiontype/manage-transactiontype.component';
import { ManageAccessrequestComponent } from './manage-accessrequest/manage-accessrequest.component';
import { SearchComponent } from '@app/shared/components/search/search.component';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, TabViewModule, ManageUsersComponent,
        ManageRoleComponent, ManageOrganizationComponent, ManageDepartmentComponent,
        ManageTransactiontypeComponent, ManageAccessrequestComponent, SearchComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    public activeTab: number = 0;
}
