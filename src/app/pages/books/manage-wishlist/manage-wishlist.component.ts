import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDetails, WishlistDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { WishlistService } from '@app/shared/services/wishlist.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { AddWishlistComponent } from '../add-wishlist/add-wishlist.component';

@Component({
  selector: 'app-manage-wishlist',
  imports: [CommonModule, TagModule, TableModule, ButtonModule, FormsModule, PaginatorModule,
        MultiSelectModule, DialogModule, InputTextModule, SelectModule, TooltipModule, AddWishlistComponent],
  templateUrl: './manage-wishlist.component.html',
  styleUrl: './manage-wishlist.component.scss'
})
export class ManageWishlistComponent {
  @Input() selectedBookId: number = 0;
  @Input() selectedBookStatus: string = '';
  @Input() selectedUserId: number = 0;
  private messageService = inject(MessageService);
  private _authService = inject(AuthService);
  private _wishlistService = inject(WishlistService);
  @ViewChild('dt') dataTable: Table | undefined;
  public showFt: boolean = false;
  public bookNameList: { label: string, value: string }[] = [];
  public borrowerNameList: { label: string, value: string }[] = [];    
  public statusList: { label: string, value: string }[] = [];
  public selectedBookNameList: string[] = [];
  public selectedBorrowerNameList: string[] = [];    
  public selectedStatusList: string[] = [];
  public wlDetails: WishlistDetails[] = [];
  public filteredWlDetails: WishlistDetails[] = [];
  public loggedInUserDetails: UserDetails | null = null;
  public searchBookTerm = '';
  public searchUserTerm = '';
  public addWishlistDialogVisible : boolean = false;

  ngOnInit(): void {

    this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
    this.getWishlistDetails();
  }

  getWishlistDetails(): void {

    if(this.selectedBookId > 0)
    {
      this._wishlistService.getWishlistDetailsByBookId(this.selectedBookId).subscribe({
          next: (data: WishlistDetails[]) => {
              this.wlDetails = data;
              this.filteredWlDetails = data;              

              this.initializeFilterLists();
          },
          error: (err) => {
              console.error('Error loading Wishlist details By BookId:', err);
          }
      });
    }
    else if(this.selectedUserId > 0)
    {
      this._wishlistService.getWishlistDetailsByUserId(this.selectedUserId).subscribe({
          next: (data: WishlistDetails[]) => {
              this.wlDetails = data;
              this.filteredWlDetails = data;              

              this.initializeFilterLists();
          },
          error: (err) => {
              console.error('Error loading Wishlist details by UserId:', err);
          }
      });
    }
    else 
    {
      this._wishlistService.getWishlistDetails().subscribe({
          next: (data: WishlistDetails[]) => {
              this.wlDetails = data;
              this.filteredWlDetails = data;              

              this.initializeFilterLists();
          },
          error: (err) => {
              console.error('Error loading Wishlist details:', err);
          }
      });
    }      
  }

  onBookSearch(term: string) {
        this.searchBookTerm = term;
        this.commonWishlistSearch();      
  }

  onUserSearch(term: string) {
        this.searchUserTerm = term.trim();
        this.commonWishlistSearch();               

  }

  commonWishlistSearch()
    {
        var _userBarcode : number = 0
        var _bookBarcode : number = 0


        if(this.searchUserTerm !="" && this.searchUserTerm.includes(environment.usersBarcodeSyntax))
        {
            let strSplitBarcode = this.searchUserTerm.split("_").pop() ?? '0';                 
            _userBarcode = parseInt(strSplitBarcode);
        } 

        if(this.searchBookTerm !="" && this.searchBookTerm.includes(environment.booksBarcodeSyntax))
        {
            let strSplitBarcode = this.searchBookTerm.split("_").pop() ?? '0';                 
            _bookBarcode = parseInt(strSplitBarcode);
        }

        if(this.wlDetails !=null && this.wlDetails.length >0)
        {           

            if(_userBarcode > 0 && _bookBarcode > 0)
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.UserId == _userBarcode && x.BookId == _bookBarcode);                
            }
            else if(_userBarcode == 0 && _bookBarcode > 0)
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.BookId == _bookBarcode);                
            }
            else if(_userBarcode > 0 && _bookBarcode == 0)
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.UserId == _userBarcode);                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm !="")
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()) && x.UserName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm !="" && this.searchUserTerm =="")
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.BookName?.toLowerCase().includes(this.searchBookTerm?.toLowerCase()));                
            }
            else if(this.searchBookTerm =="" && this.searchUserTerm !="")
            {
                this.filteredWlDetails = this.wlDetails.filter(x => x.UserName?.toLowerCase().includes(this.searchUserTerm?.toLowerCase()));
            }
            else
            {
                this.filteredWlDetails = this.wlDetails;
            }

        }
        else
        {
            this.filteredWlDetails = [];
        }
  }

  initializeFilterLists(): void {
        this.bookNameList = [...new Set(this.wlDetails.map(book => book.BookName))].map(e => ({ label: e ?? "", value: e ?? "" }));
        this.borrowerNameList = [...new Set(this.wlDetails.map(book => book.UserName))].map(e => ({ label: e ?? "", value: e ?? "" }));        
        this.statusList = [...new Set(this.wlDetails.map(book => book.Status))].map(e => ({ label: e ?? "", value: e ?? "" }));        
  }

  showFilter(): void {
        this.showFt = !this.showFt;
  }

  clear(): void {
        this.dataTable?.reset();
        this.selectedBookNameList = [];
        this.selectedBorrowerNameList = [];        
        this.selectedStatusList = [];
        this.searchBookTerm = '';
        this.searchUserTerm = '';
        this.onBookSearch('');
        this.showFt = false;
  }

  getStatusSeverity(status: string, createdOn: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {

        if (status === 'Issued') {
            return 'success';
        }

        if (status === 'Cancelled') {
            return 'info';
        }

        const createdDate = new Date(createdOn);
        const todaysDate = new Date();

        // 1. Calculate difference in milliseconds
        const diffInMs = todaysDate.getTime() - createdDate.getTime();

        // 2. Convert milliseconds to full days
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));


        if (status === 'Added' && diffInDays <= 7) {
            return 'info';
        }

        if (status === 'Added' && diffInDays > 7 && diffInDays <= 14) {
            return 'warn';
        }

        if (status === 'Added' && diffInDays > 14) {
            return 'danger';
        }

        return 'secondary'
  }

  cancelWishlist(_selectedWishlist : WishlistDetails ):void{

      _selectedWishlist.Status = "Cancelled";

      this._wishlistService.updateWishlistDetails(_selectedWishlist).subscribe({
          next: (res: any) => {
              if (!res || !res.Status) {
                  this.messageService.add({
                      severity: 'error',
                      summary: 'Manage Wishlist - Failed',
                      detail: res ? res.Message : 'Failed to Update Wishlist. Please try again.'
                  });
              } else {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Manage Wishlist - Success',
                      detail: 'Updated Wishlist successfully.'
                  });
                  
                  this.getWishlistDetails();
                  this.getWishlistCountDetails();
              }

          },
          error: () => {
              this.messageService.add({
                  severity: 'error',
                  summary: 'Manage Wishlist - Failed',
                  detail: 'Failed to Update Wishlist. Please try again.'
              });
          }
      });

  }

  addWishlist():void{
    this.addWishlistDialogVisible = true;
  }

   getWishlistCountDetails(): void {
          this._wishlistService.getWishlistCount().subscribe({
              next: (data: number) => {
                  this._authService.setWishlistCount(data);
              },
              error: (err) => {
                  console.error('Error loading Wishlist Count details:', err);
              }
          });             
    }
}
