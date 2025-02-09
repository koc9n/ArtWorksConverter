import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config/config';
import path from 'path';
import { promises as fs } from 'fs';

export class ConverterService {
  async convertToGif(inputPath: string, outputPath: string, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf', 'fps=10,scale=-1:400:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
          '-loop', '0'
        ])
        .toFormat('gif')
        .on('progress', (progress) => {
          if (onProgress) {
            onProgress(Math.round(progress.percent || 0));
          }
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }
} 