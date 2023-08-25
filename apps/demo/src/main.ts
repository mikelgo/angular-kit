import {importProvidersFrom} from '@angular/core';
import {AppComponent} from './app/app.component';
import {NgxDirtyCheckerModule} from '@code-workers.io/ngx-dirty-checker';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';
import {routes} from './app/app.routes';
import {provideRouter, RouterOutlet} from '@angular/router';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, NgxDirtyCheckerModule, RouterOutlet),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
  .catch((err) => console.error(err));
