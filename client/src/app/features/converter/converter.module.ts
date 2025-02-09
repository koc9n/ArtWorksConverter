import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConverterComponent } from './converter.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ConversionProgressComponent } from './components/conversion-progress/conversion-progress.component';
import { ResultDisplayComponent } from './components/result-display/result-display.component';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: ConverterComponent
  }
];

@NgModule({
  declarations: [
    ConverterComponent,
    FileUploadComponent,
    ConversionProgressComponent,
    ResultDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    HttpClientModule
  ],
  exports: [ConverterComponent]
})
export class ConverterModule { } 