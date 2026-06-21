import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Lara from '@primeng/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './shared/interceptors/loading.interceptor';
import { OrganizationService } from './shared/services/organization.service';
import { AuthService } from './shared/services/auth.service';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([loadingInterceptor])
        ),
        MessageService,
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Lara,
                options: {
                    darkModeSelector: false
                }
            },
        }),
        provideAppInitializer(async () => {
            const orgService = inject(OrganizationService);
            const authService = inject(AuthService);

            const org = environment.OrganizationDetails;
            authService.setOrganizationDetails(org);

            try {
                const data = await firstValueFrom(orgService.getOrganizationDetails());
                if (data && data.length > 0) {
                    const activeOrg = data.find((x: any) => x.IsActive == true) ?? environment.OrganizationDetails;
                    authService.setOrganizationDetails(activeOrg);
                }
            } catch (err) {
                console.error('Error loading OrganizationDetails:', err);
            }
        })
    ]
};