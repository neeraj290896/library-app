import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { BooksManageBooksComponent } from './books-manage-books/books-manage-books.component';
import { BooksManageAuthorComponent } from './books-manage-author/books-manage-author.component';
import { BooksManagePublisherComponent } from './books-manage-publisher/books-manage-publisher.component';
import { BooksManageCategoryComponent } from './books-manage-category/books-manage-category.component';
import { BooksManageLanguageComponent } from './books-manage-language/books-manage-language.component';
import { SearchComponent } from '@app/shared/components/search/search.component';
import { AuthService } from '@app/shared/services/auth.service';
import { UserDetails } from '@app/shared/models/api.models';
import { ManageBuildingComponent } from './manage-building/manage-building.component';
import { ManageFloorComponent } from './manage-floor/manage-floor.component';
import { ManageRackComponent } from './manage-rack/manage-rack.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-books',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TabViewModule,
        BooksManageBooksComponent,
        BooksManageAuthorComponent,
        BooksManagePublisherComponent,
        BooksManageCategoryComponent,
        BooksManageLanguageComponent,
        SearchComponent,
        ManageBuildingComponent,
        ManageFloorComponent,
        ManageRackComponent
    ],
    templateUrl: './books.component.html',
    styleUrl: './books.component.scss'
})
export class BooksComponent {
    public _authService = inject(AuthService);
    public activeTab: number = 0;
    public loggedInUserDetails: UserDetails | null = null;
    public librarianRoleId : number = 3;

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.librarianRoleId = (environment.departmentEligibleForRoleIdAbove + 1);
    }  

    get canAccessBuilding_Floor_Rack(): boolean {
        const roleId = this.loggedInUserDetails?.RoleId;
        if (roleId == null || this.librarianRoleId == null) {
            return false;
        }
        return roleId <= this.librarianRoleId;
    }
    
}
