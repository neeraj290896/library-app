import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { ManageOrganizationComponent } from './manage-organization/manage-organization.component';
import { SearchComponent } from '@app/shared/components/search/search.component';
import { AuthService } from '@app/shared/services/auth.service';
import { UserDetails } from '@app/shared/models/api.models';
import { environment } from '../../../environments/environment';
import { ManageBuildingComponent } from './manage-building/manage-building.component';
import { ManageFloorComponent } from './manage-floor/manage-floor.component';
import { ManageRackComponent } from './manage-rack/manage-rack.component';

@Component({
  selector: 'app-organization',
  imports: [CommonModule, TabViewModule, ManageOrganizationComponent, SearchComponent, ManageBuildingComponent, ManageFloorComponent, ManageRackComponent],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss'
})
export class OrganizationComponent {
public activeTab: number = 0;
    private _authService = inject(AuthService);
    public loggedInUserDetails: UserDetails | null = null;
    public librarianRoleId : number = 3;

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.librarianRoleId = (environment.departmentEligibleForRoleIdAbove + 1);
    }

    get canEditBuilding_Floor_Rack(): boolean {
        const roleId = this.loggedInUserDetails?.RoleId;
        if (roleId == null || this.librarianRoleId == null) {
            return false;
        }
        return roleId <= this.librarianRoleId;
    }
}
