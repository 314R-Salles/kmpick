import {NgModule} from '@angular/core'
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  imports: [
    ClipboardModule,
    MatSnackBarModule,
    DragDropModule,
  ],
  exports: [
    ClipboardModule,
    MatSnackBarModule,
    DragDropModule,
  ],
  declarations: []
})
export class AngularMaterialModule {
}
