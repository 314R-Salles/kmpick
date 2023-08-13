import {NgModule} from '@angular/core'
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';



@NgModule({
  imports: [
    ClipboardModule,
    MatSnackBarModule,
  ],
  exports: [
    ClipboardModule,
    MatSnackBarModule,
  ],
  declarations: []
})
export class AngularMaterialModule {
}
