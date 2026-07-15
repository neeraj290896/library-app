import { Component, inject } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthService } from '@app/shared/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-layout',
  imports: [RouterModule],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss'
})
export class LoginLayoutComponent {

  public organizationImagePath: string = '';
  public authService = inject(AuthService);
  
  ngOnInit(): void {
    if(this.authService.organizationDetails()?.ImagePath) {
        this.organizationImagePath = environment.apiUrl + environment.uploadedFilesPath + this.authService.organizationDetails()?.ImagePath;
    }
    else{
        this.organizationImagePath = 'assets/images/VCN_Image.png';
    }
  }
}
