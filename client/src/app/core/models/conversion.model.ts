export interface ConversionJob {
  id: string;
  state: 'active' | 'completed' | 'failed';
  progress: number;
  inputFile?: File;
  createdAt: Date;
  result?: {
    outputFilename: string;
  };
  error?: string;
} 