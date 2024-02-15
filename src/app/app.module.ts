import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomePageComponent} from './home-page/home-page.component';
import {AppInitializerService} from "./app-initializer.service";
import {CookieService} from "ngx-cookie-service";
import {PickPageComponent} from './pick-page/pick-page.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AngularMaterialModule} from "./angular.material.module";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from "@angular/forms";
import {HttpInterceptorService} from "./http-interceptor.service";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {OverlayComponent} from "./overlay/overlay.component";
import { RedirectComponent } from './redirect/redirect.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    PickPageComponent,
    OverlayComponent,
    RedirectComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'serverApp'}),
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularMaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
    Location, {
      provide: LocationStrategy, useClass: PathLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [AppInitializerService]
    },
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}


export function initApp(appLoadService: AppInitializerService) {
  return () => appLoadService.initApp();
}
