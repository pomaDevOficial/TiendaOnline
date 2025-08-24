import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter , withComponentInputBinding} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
     provideAnimationsAsync(),
     providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
    provideRouter(routes, withComponentInputBinding()), 
    provideHttpClient(withFetch()), // ✅ Ahora usa fetch
    provideToastr({
      timeOut: 5000, // 🔹 Reducido a 5s para mejor UX
      positionClass: 'toast-bottom-right',
      preventDuplicates: true // 🔹 Evita toasts repetidos
    }),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
