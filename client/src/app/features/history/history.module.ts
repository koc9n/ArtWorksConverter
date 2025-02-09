import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from '@shared/material.module';
import { HistoryComponent } from './history.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    HistoryComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule.forChild([
      { path: '', component: HistoryComponent }
    ]),
    MaterialModule,
    HttpClientModule
  ],
  exports: [HistoryComponent]
})
export class HistoryModule { } 