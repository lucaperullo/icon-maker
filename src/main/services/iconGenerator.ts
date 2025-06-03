// src/main/services/iconGenerator.ts (Updated without sharp)
import { Icon, StyleOptions } from '../store/iconStore';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

interface GenerateIconOptions {
  prompt: string;
  styleOptions: StyleOptions;
  sizes: string[];
}

class IconGenerator {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(app.getPath('temp'), 'icon-maker');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error: any) {
      console.error('Failed to create temp directory:', error);
      throw new Error(`Failed to create temp directory: ${error.message}`);
    }
  }

  async generateIcon(options: GenerateIconOptions): Promise<Partial<Icon>> {
    // For now, generate a placeholder SVG based on the style options
    // This will be replaced with actual AI generation later
    const svgContent = this.generatePlaceholderSVG(options);
    
    // Generate different formats
    const formats: Icon['formats'] = {
      svg: svgContent,
      png: {},
      ico: ''
    };

    // Generate base64 encoded PNG data URLs for requested sizes
    // Since we can't use sharp in the main process, we'll create data URLs
    // that can be converted by the renderer process if needed
    for (const size of options.sizes) {
      // Create a simple base64 placeholder for now
      // In a real implementation, you might send this to a service or use canvas
      formats.png![size] = this.createPlaceholderPNG(size);
    }

    // Generate ICO placeholder
    if (options.sizes.some(size => ['16x16', '32x32', '48x48'].includes(size))) {
      formats.ico = this.createPlaceholderICO();
    }

    return {
      name: this.generateIconName(options.prompt),
      prompt: options.prompt,
      sizes: options.sizes,
      style: options.styleOptions.style,
      primaryColor: options.styleOptions.primaryColor,
      secondaryColor: options.styleOptions.secondaryColor,
      styleOptions: options.styleOptions,
      svgContent: svgContent,
      formats
    };
  }

  private generatePlaceholderSVG(options: GenerateIconOptions): string {
    const { primaryColor, secondaryColor, corners, effects, backgroundStyle } = options.styleOptions;
    
    // Create a simple geometric icon based on the prompt
    const shapes = this.getShapesFromPrompt(options.prompt);
    const cornerRadius = corners === 'rounded' ? 8 : corners === 'smooth' ? 12 : 0;
    
    let svg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add background if not transparent
    if (backgroundStyle !== 'transparent' && backgroundStyle !== 'none') {
      if (backgroundStyle === 'gradient') {
        svg += `
          <defs>
            <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.1" />
              <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.1" />
            </linearGradient>
          </defs>
          <rect width="256" height="256" fill="url(#bg-gradient)" rx="${cornerRadius}" />
        `;
      } else {
        svg += `<rect width="256" height="256" fill="${primaryColor}10" rx="${cornerRadius}" />`;
      }
    }
    
    // Add effects
    if (effects.includes('shadow')) {
      svg += `
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
      `;
    }
    
    // Add main shape based on prompt analysis
    const filterAttr = effects.includes('shadow') ? 'filter="url(#shadow)"' : '';
    
    if (shapes.includes('home') || shapes.includes('house')) {
      svg += `
        <g transform="translate(128, 128)" ${filterAttr}>
          <path d="M-60 20 L0 -60 L60 20 L60 60 L-60 60 Z" 
                fill="${primaryColor}" 
                stroke="${secondaryColor}" 
                stroke-width="4"/>
          <rect x="-20" y="20" width="40" height="40" fill="${secondaryColor}"/>
        </g>
      `;
    } else if (shapes.includes('cart') || shapes.includes('shopping')) {
      svg += `
        <g transform="translate(128, 128)" ${filterAttr}>
          <path d="M-60 -40 L-40 -40 L-20 40 L50 40 L60 -20 L-20 -20" 
                fill="none" 
                stroke="${primaryColor}" 
                stroke-width="8"
                stroke-linecap="round"
                stroke-linejoin="round"/>
          <circle cx="-10" cy="60" r="10" fill="${primaryColor}"/>
          <circle cx="40" cy="60" r="10" fill="${primaryColor}"/>
        </g>
      `;
    } else if (shapes.includes('star')) {
      svg += `
        <g transform="translate(128, 128)" ${filterAttr}>
          <path d="M0,-80 L20,-20 L80,-10 L30,30 L10,80 L0,30 L-10,80 L-30,30 L-80,-10 L-20,-20 Z" 
                fill="${primaryColor}" 
                stroke="${secondaryColor}" 
                stroke-width="2"/>
        </g>
      `;
    } else {
      // Default circle icon
      svg += `
        <g transform="translate(128, 128)" ${filterAttr}>
          <circle cx="0" cy="0" r="80" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="4"/>
          <circle cx="0" cy="0" r="40" fill="${secondaryColor}"/>
        </g>
      `;
    }
    
    svg += `</svg>`;
    return svg;
  }

  private getShapesFromPrompt(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    const shapes: string[] = [];
    
    const shapeKeywords = {
      home: ['home', 'house', 'building'],
      cart: ['cart', 'shopping', 'basket', 'store'],
      star: ['star', 'favorite', 'rating'],
      heart: ['heart', 'love', 'like'],
      user: ['user', 'person', 'profile', 'account'],
      settings: ['settings', 'gear', 'config', 'preferences'],
      search: ['search', 'find', 'magnify'],
      mail: ['mail', 'email', 'message', 'envelope']
    };
    
    for (const [shape, keywords] of Object.entries(shapeKeywords)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        shapes.push(shape);
      }
    }
    
    return shapes;
  }

  private createPlaceholderPNG(size: string): string {
    // Create a simple base64 encoded 1x1 transparent PNG
    // This is just a placeholder - in a real app you'd convert the SVG properly
    const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return transparentPNG;
  }

  private createPlaceholderICO(): string {
    // Create a simple base64 encoded ICO placeholder
    // This is just a placeholder - in a real app you'd create a proper ICO file
    const transparentICO = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return transparentICO;
  }

  private generateIconName(prompt: string): string {
    // Extract meaningful words from prompt
    const words = prompt.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3);
    
    return words.length > 0 
      ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Icon'
      : 'Custom Icon';
  }

  // Helper method to convert SVG to other formats (can be called from renderer if needed)
  async generateFormatsFromSVG(svgContent: string, sizes: string[]): Promise<Record<string, string>> {
    // This would be implemented in the renderer process using canvas or similar
    // For now, return placeholders
    const result: Record<string, string> = {};
    
    for (const size of sizes) {
      result[size] = this.createPlaceholderPNG(size);
    }
    
    return result;
  }
}

export default new IconGenerator();