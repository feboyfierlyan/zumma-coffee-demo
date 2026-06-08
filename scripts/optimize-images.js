import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

async function optimizeImages() {
  try {
    const files = fs.readdirSync(publicDir);
    const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
    
    console.log(`Found ${pngFiles.length} PNG files to optimize...`);
    
    let totalSaved = 0;
    
    for (const file of pngFiles) {
      const inputPath = path.join(publicDir, file);
      const filenameWithoutExt = path.parse(file).name;
      const outputPath = path.join(publicDir, `${filenameWithoutExt}.webp`);
      
      const stats = fs.statSync(inputPath);
      const originalSize = stats.size;
      
      console.log(`Processing: ${file} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
      
      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true }) // Max 800px width
        .webp({ quality: 80 })
        .toFile(outputPath);
        
      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const saved = originalSize - newSize;
      totalSaved += saved;
      
      console.log(`  -> Saved as ${filenameWithoutExt}.webp (${(newSize / 1024).toFixed(2)} KB) - Reduced by ${((saved / originalSize) * 100).toFixed(1)}%`);
      
      // Delete original PNG
      fs.unlinkSync(inputPath);
    }
    
    console.log(`\nOptimization Complete!`);
    console.log(`Total Space Saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages();
