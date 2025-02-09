import { Component, Input, OnChanges } from '@angular/core';
import { ConversionJob } from '@core/models/conversion.model';
import { ConversionService } from '@services/conversion.service';

@Component({
  selector: 'app-result-display',
  template: `
    <mat-card *ngIf="job?.state === 'completed' && job?.result">
      <mat-card-content>
        <div class="preview-container">
          <img 
            [src]="gifUrl" 
            alt="Converted GIF" 
            class="preview-gif"
          >
        </div>
        <div class="actions">
          <a 
            [href]="gifUrl"
            [download]="job?.result?.outputFilename"
            mat-raised-button 
            color="primary"
          >
            Download GIF
          </a>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .preview-container {
      max-width: 100%;
      overflow: hidden;
      margin-bottom: 1rem;
      border-radius: 4px;
      background: #f5f5f5;
    }
    .preview-gif {
      width: 100%;
      height: auto;
      display: block;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class ResultDisplayComponent implements OnChanges {
  @Input() job?: ConversionJob;
  gifUrl: string = '';

  constructor(private conversionService: ConversionService) {}

  ngOnChanges(): void {
    if (this.job?.result?.outputFilename) {
      this.gifUrl = this.conversionService.getGifUrl(this.job.result.outputFilename);
    }
  }
} 