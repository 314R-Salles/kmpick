import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import {AppInitializerService} from "./app-initializer.service";
import {CookieService} from "ngx-cookie-service";
import { PickPageComponent } from './pick-page/pick-page.component';
import {HttpClientModule} from "@angular/common/http";
import {AngularMaterialModule} from "./angular.material.module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    PickPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AngularMaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
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
export class AppModule { }



export function initApp(appLoadService: AppInitializerService) {
  return () => appLoadService.initApp();
}
