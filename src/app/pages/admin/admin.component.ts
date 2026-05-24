import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TabViewModule } from 'primeng/tabview';
import { UserService } from '../../shared/services/user.service';
import { RoleService } from '../../shared/services/role.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageRoleComponent } from './manage-role/manage-role.component';
import { ManageOrganizationComponent } from './manage-organization/manage-organization.component';
import { ManageDepartmentComponent } from './manage-department/manage-department.component';
import { ManageTransactiontypeComponent } from './manage-transactiontype/manage-transactiontype.component';
import { ManageAccessrequestComponent } from './manage-accessrequest/manage-accessrequest.component';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, PaginatorModule, TabViewModule, ManageUsersComponent, 
                ManageRoleComponent, ManageOrganizationComponent, ManageDepartmentComponent, 
                ManageTransactiontypeComponent, ManageAccessrequestComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    private _userService = inject(UserService);
    private _roleService = inject(RoleService);
    private _organizationService = inject(OrganizationService);
    private _transactionService = inject(TransactionService);

     activeTab = 0;

    staffMembers = signal([
        { id: '#001', name: 'Allison Smith', role: 'Librarian', email: 'allison@library.com', status: 'Active' },
        { id: '#002', name: 'John Doe', role: 'Assistant', email: 'john@library.com', status: 'Active' },
        { id: '#003', name: 'Sarah Johnson', role: 'Assistant', email: 'sarah@library.com', status: 'Active' },
        { id: '#004', name: 'Mike Wilson', role: 'Intern', email: 'mike@library.com', status: 'In-Active' },
    ]);

    fetchUserDetails(): void {
        if (this._userService.getAllUserDetails()) {
        
        }
    }

    fetchRoleDetails(): void {
        if (this._roleService.getRoleDetails()) {
        
        }
    }

    fetchOrganizationDetails(): void {
        if (this._organizationService.getOrganizationDetails()) {
        
        }
    }

    fetchDepartmentDetails(): void {
        if (this._organizationService.getDepartmentDetails()) {
        
        }
    }

    fetchTTDetails(): void {
        if (this._transactionService.getTransactionTypeDetails()) {
        
        }
    }
}
