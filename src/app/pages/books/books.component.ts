import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { BooksManageBooksComponent } from './books-manage-books/books-manage-books.component';
import { BooksManageAuthorComponent } from './books-manage-author/books-manage-author.component';
import { BooksManagePublisherComponent } from './books-manage-publisher/books-manage-publisher.component';
import { BooksManageCategoryComponent } from './books-manage-category/books-manage-category.component';
import { BooksManageLanguageComponent } from './books-manage-language/books-manage-language.component';
import { SearchComponent } from '@app/shared/components/search/search.component';

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
        SearchComponent
    ],
    templateUrl: './books.component.html',
    styleUrl: './books.component.scss'
})
export class BooksComponent {
    public activeTab: number = 0;
}
