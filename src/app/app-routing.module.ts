import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePageComponent} from "./home-page/home-page.component";
import {PickPageComponent} from "./pick-page/pick-page.component";
import {OverlayComponent} from "./overlay/overlay.component";
import {RedirectComponent} from "./redirect/redirect.component";

const appRoutes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomePageComponent},
  {path: 'room', component: PickPageComponent},
  {path: 'overlay', component: OverlayComponent},
  {path: '**', component: RedirectComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
