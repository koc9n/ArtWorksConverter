import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-conversion-progress',
  template: `
    <div class="progress-container">
      <h3>Converting video...</h3>
      
      <mat-progress-bar
        mode="determinate"
        [value]="progress"
        class="progress-bar">
      </mat-progress-bar>
      
      <div class="progress-text">
        {{ progress | number:'1.0-0' }}%
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      text-align: center;
      padding: 20px;
    }

    .progress-bar {
      margin: 20px 0;
    }

    .progress-text {
      font-size: 1.1rem;
      color: #666;
    }

    h3 {
      color: #333;
      margin-bottom: 16px;
    }
  `]
})
export class ConversionProgressComponent {
  @Input() progress: number = 0;
} 