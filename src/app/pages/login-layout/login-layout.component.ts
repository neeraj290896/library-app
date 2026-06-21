import { Component, inject } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-login-layout',
  imports: [RouterModule],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss'
})
export class LoginLayoutComponent {
    public authService = inject(AuthService);
}
