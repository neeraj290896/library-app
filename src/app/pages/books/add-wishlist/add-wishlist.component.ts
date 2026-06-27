import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookDetails, UserDetails, WishlistDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { BookService } from '@app/shared/services/book.service';
import { UserService } from '@app/shared/services/user.service';
import { WishlistService } from '@app/shared/services/wishlist.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-add-wishlist',
  imports: [CommonModule, TagModule, ButtonModule, FormsModule, MultiSelectModule, DialogModule, SelectModule, TooltipModule],
  templateUrl: './add-wishlist.component.html',
  styleUrl: './add-wishlist.component.scss'
})
export class AddWishlistComponent {
  @Input() selectedBookId: number = 0;
  @Input() selectedUserId: number = 0;
  @Output() private onSuccess: EventEmitter<void> = new EventEmitter<void>();
  @Output() private onDialogClose: EventEmitter<void> = new EventEmitter<void>();
  private messageService = inject(MessageService);
  private _authService = inject(AuthService);
  private _wishlistService = inject(WishlistService);
  private bookService = inject(BookService);
  private userService = inject(UserService);
  public selectedWishlist: WishlistDetails = { WishlistId : 0, BookId :0, BookName : '', CreatedByUserId : 0, CreatedByUserName : '', CreatedOn : null, IsNotificationRead : false,
      Status: 'Added', UserId: 0, UserName: ''};

  public loggedInUserDetails: UserDetails | null = null;
  public addWishlistDialogVisible: boolean = true;
  public lstBookDetails: BookDetails[] = [];
  public lstUserDetails: UserDetails[] = [];
  public bookOptions: { label: string; value: number; }[] = [];
  public userOptions: { label: string; value: number; }[] = [];

  public errors: { BookName: string, UserName: string} = {BookName: '', UserName: ''};

  ngOnInit(): void {

    console.log('selectedBookId : ', this.selectedBookId, ' -- selectedUserId : ', this.selectedUserId);

    this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;

    this.loadBooks();
    this.loadUserDetails();
    
  }

  loadBooks(): void {
      this.bookService.getAllBookDetails().subscribe({
          next: (data: BookDetails[]) => {
              this.lstBookDetails = data;
              if (this.selectedBookId == 0) {
                  this.bookOptions = this.lstBookDetails.filter(x => x.Status == "Issued").map(book => {
                      return { label: book.BookName ?? '', value: book.BookId };
                  });                  
              }
              else {
                  this.bookOptions = data.map(book => {
                      return { label: book.BookName ?? '', value: book.BookId };
                  });

                  this.selectedWishlist.BookId = this.selectedBookId;

                  this.onBookChange();
              }
          },
          error: (err) => {
              console.error('Error loading books:', err);
          }
      });
  }
  
  loadUserDetails(): void {
      this.userService.getAllUserDetails().subscribe({
          next: (data: UserDetails[]) => {
              this.lstUserDetails = data;

              if (this.selectedUserId == 0) {
                  this.userOptions = data.filter(x => x.IsActive == true && x.FullName?.trim() != '').map(usr => {
                      return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                  });                  

              }
              else {
                  this.userOptions = data.filter(x => x.FullName?.trim() != '').map(usr => {
                      return { label: usr.FullName ?? '', value: usr.UserId ?? 0 };
                  });

                  this.selectedWishlist.UserId = this.selectedUserId;

                  this.onUserChange();
              }
          },
          error: (err) => {
              console.error('Error loading users:', err);
          }
      });
  }

  onBookChange(): void {
        const book = this.bookOptions.find(l => l.value === this.selectedWishlist.BookId);
        if (book) {
            this.selectedWishlist.BookName = book.label;
        }

        this.validateInput('BookName');
  }

  onUserChange(): void {
        const _borrower = this.lstUserDetails.find(l => l.UserId === this.selectedWishlist.UserId);
        if (_borrower) {
            this.selectedWishlist.UserName = _borrower.FullName ?? '';
            
        }

        this.validateInput('UserName');
  }

  validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BookName':
                if (!this.selectedWishlist.BookName?.trim()) {
                    this.errors.BookName = 'Book name is required.';
                    isValid = false;
                }
                else {
                    this.errors.BookName = '';
                }
                break;

            case 'UserName':
                if (!this.selectedWishlist.UserName?.trim()) {
                    this.errors.UserName = 'User Name is required.';
                    isValid = false;
                } else {
                    this.errors.UserName = '';
                }
                break;
          

            default:
                break;
        }

        return isValid;
  }

  validateWlDetails(): boolean {
        const isBookNameValid = this.validateInput('BookName');
        const isUserNameValid = this.validateInput('UserName');       

        return isBookNameValid && isUserNameValid;

  }

  addToWishlist(): void {
        if (!this.validateWlDetails()) {
            return;
        }

      this.selectedWishlist.CreatedByUserId = this.loggedInUserDetails?.UserId ?? 0;
      this.selectedWishlist.CreatedByUserName = this.loggedInUserDetails?.FullName ?? '';
      
      
      this._wishlistService.addWishlistDetails(this.selectedWishlist).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Wishlist - Failed',
                        detail: res ? res.Message : 'Failed to Add Wishlist. Please try again.'
                    });
                }
                else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Wishlist - Success',
                        detail: 'Updated Add Wishlist successfully.'
                    });

                    this.getWishlistCountDetails();
                    this.addWishlistDialogVisible = false;
                    this.onSuccess.emit();
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Wishlist - Failed',
                    detail: 'Failed to Add Wishlist. Please try again.'
                });
            }
        });
        
  }

  hideDialog(): void {
        this.onDialogClose.emit();
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
