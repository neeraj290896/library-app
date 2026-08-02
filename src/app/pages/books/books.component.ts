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
import { ManageBuildingComponent } from '../organization/manage-building/manage-building.component';
import { ManageFloorComponent } from '../organization/manage-floor/manage-floor.component';
import { ManageRackComponent } from '../organization/manage-rack/manage-rack.component';
import { environment } from '../../../environments/environment';
import { BooksManageSubjectComponent } from './books-manage-subject/books-manage-subject.component';
import { BooksManageSourceComponent } from './books-manage-source/books-manage-source.component';

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
        ManageRackComponent,
        BooksManageSubjectComponent,
        BooksManageSourceComponent
    ],
    templateUrl: './books.component.html',
    styleUrl: './books.component.scss'
})
export class BooksComponent {
    public _authService = inject(AuthService);
    public activeTab: number = 0;
    public loggedInUserDetails: UserDetails | null = null;
    

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        
    }  
    
}
