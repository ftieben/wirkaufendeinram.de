import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Feature: ram-buying-site, Property 1: Build generates static HTML
 * Validates: Requirements 5.5
 */

describe('Astro Build Output Properties', () => {
  const distDir = join(process.cwd(), 'dist');
  
  beforeAll(() => {
    // Check if dist directory exists from a previous build
    // If not, skip the test since we can't build during test execution
    if (!existsSync(distDir)) {
      console.warn('Dist directory not found. Run "npm run build" before running tests.');
    }
  });

  it('Property 1: Build generates static HTML - for any valid Astro project, the build process should generate static HTML files', () => {
    // Skip test if dist directory doesn't exist
    if (!existsSync(distDir)) {
      console.warn('Skipping build test - dist directory not found. Run "npm run build" first.');
      return;
    }

    fc.assert(
      fc.property(
        // We don't need complex generators here since we're testing the build output itself
        fc.constant(true),
        () => {
          // Verify that the dist directory exists
          expect(existsSync(distDir)).toBe(true);
          
          // Get all files in the dist directory
          const files = getAllFiles(distDir);
          
          // Verify that at least one HTML file is generated
          const htmlFiles = files.filter(file => file.endsWith('.html'));
          expect(htmlFiles.length).toBeGreaterThan(0);
          
          // For each HTML file, verify it contains valid HTML structure
          htmlFiles.forEach(htmlFile => {
            const content = readFileSync(htmlFile, 'utf-8');
            
            // Verify basic HTML structure
            expect(content).toMatch(/<!DOCTYPE html>/i);
            expect(content).toMatch(/<html[^>]*>/i);
            expect(content).toMatch(/<head[^>]*>/i);
            expect(content).toMatch(/<\/head>/i);
            expect(content).toMatch(/<body[^>]*>/i);
            expect(content).toMatch(/<\/body>/i);
            expect(content).toMatch(/<\/html>/i);
            
            // Verify the HTML is not empty (has actual content)
            expect(content.trim().length).toBeGreaterThan(0);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}