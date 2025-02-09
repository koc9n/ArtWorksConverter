import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  exports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule
  ]
})
export class MaterialModule { } 