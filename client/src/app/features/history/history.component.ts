import { Component, OnInit } from '@angular/core';
import { HistoryService } from '@services/history.service';
import { NotificationService } from '@core/services/notification.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-history',
  template: `
    <div class="history-container">
      <h2>Conversion History</h2>
      
      <div class="empty-state" *ngIf="conversionHistory.length === 0">
        No conversions found in history
      </div>

      <mat-card *ngFor="let job of conversionHistory" class="history-item">
        <mat-card-content>
          <div class="job-info">
            <div class="status-section">
              <span class="status" [ngClass]="job.state">
                {{ job.state }}
              </span>
              <span class="time">
                {{ job.timestamp | date:'medium' }}
              </span>
            </div>

            <div class="preview-section" *ngIf="job.state === 'completed' && job.result?.outputFilename">
              <img 
                [src]="getGifUrl(job.result.outputFilename)" 
                [alt]="job.result.outputFilename"
                class="preview-gif"
              >
              <div class="actions">
                <a 
                  [href]="getGifUrl(job.result.outputFilename)"
                  [download]="job.result.outputFilename"
                  mat-raised-button 
                  color="primary"
                >
                  Download
                </a>
                <button 
                  mat-icon-button 
                  color="warn" 
                  (click)="deleteJob(job.id)"
                  matTooltip="Delete from history"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="error-section" *ngIf="job.state === 'failed'">
              <p class="error-message">{{ job.error }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .history-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .history-item {
      margin-bottom: 16px;
    }

    .job-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: 500;
    }

    .status.completed { 
      background: #e6ffe6;
      color: #008000;
    }

    .status.failed { 
      background: #ffe6e6;
      color: #cc0000;
    }

    .time {
      color: #666;
      font-size: 0.9em;
    }

    .preview-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }

    .preview-gif {
      max-width: 150px;
      max-height: 150px;
      object-fit: contain;
      border-radius: 4px;
      background: #f5f5f5;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .error-message {
      color: #cc0000;
      margin: 0;
      font-size: 0.9em;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class HistoryComponent implements OnInit {
  conversionHistory: any[] = [];

  constructor(
    private historyService: HistoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.historyService.getHistory().subscribe({
      next: (history) => {
        this.conversionHistory = history;
      },
      error: () => {
        this.notificationService.error('Failed to load conversion history');
      }
    });
  }

  deleteJob(jobId: string) {
    this.historyService.deleteJob(jobId).subscribe({
      next: () => {
        this.loadHistory();
        this.notificationService.success('Job removed from history');
      },
      error: () => {
        this.notificationService.error('Failed to delete job');
      }
    });
  }

  getGifUrl(filename: string): string {
    return `${environment.apiUrl}/shared/converted/${encodeURIComponent(filename)}`;
  }
} 