// src/main/services/iconExporter.ts
import { app, dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import iconStore, { Icon } from '../store/iconStore';

interface ExportOptions {
  iconId: string;
  platforms: string[];
  sizes: string[];
  format: 'zip' | 'folder';
}

interface PlatformConfig {
  name: string;
  sizes: string[];
  formats: string[];
  additionalFiles?: {
    name: string;
    content: string;
  }[];
}

class IconExporter {
  private platformConfigs: Record<string, PlatformConfig> = {
    web: {
      name: 'Web',
      sizes: ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256', '512x512'],
      formats: ['svg', 'png'],
      additionalFiles: [
        {
          name: 'favicon.ico',
          content: 'ico'
        },
        {
          name: 'manifest.json',
          content: JSON.stringify({
            icons: [
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
          }, null, 2)
        }
      ]
    },
    ios: {
      name: 'iOS',
      sizes: ['20x20', '29x29', '40x40', '58x58', '60x60', '76x76', '80x80', '87x87', '120x120', '152x152', '167x167', '180x180', '1024x1024'],
      formats: ['png'],
      additionalFiles: [
        {
          name: 'Contents.json',
          content: JSON.stringify({
            images: [
              { size: '20x20', scale: '2x', filename: 'icon-40x40.png' },
              { size: '20x20', scale: '3x', filename: 'icon-60x60.png' },
              { size: '29x29', scale: '2x', filename: 'icon-58x58.png' },
              { size: '29x29', scale: '3x', filename: 'icon-87x87.png' },
              { size: '40x40', scale: '2x', filename: 'icon-80x80.png' },
              { size: '40x40', scale: '3x', filename: 'icon-120x120.png' },
              { size: '60x60', scale: '2x', filename: 'icon-120x120.png' },
              { size: '60x60', scale: '3x', filename: 'icon-180x180.png' },
              { size: '76x76', scale: '1x', filename: 'icon-76x76.png' },
              { size: '76x76', scale: '2x', filename: 'icon-152x152.png' },
              { size: '83.5x83.5', scale: '2x', filename: 'icon-167x167.png' },
              { size: '1024x1024', scale: '1x', filename: 'icon-1024x1024.png' }
            ]
          }, null, 2)
        }
      ]
    },
    android: {
      name: 'Android',
      sizes: ['36x36', '48x48', '72x72', '96x96', '144x144', '192x192', '512x512'],
      formats: ['png'],
      additionalFiles: []
    },
    mac: {
      name: 'macOS',
      sizes: ['16x16', '32x32', '128x128', '256x256', '512x512', '1024x1024'],
      formats: ['png', 'icns'],
      additionalFiles: []
    }
  };

  async exportIcon(options: ExportOptions): Promise<string | null> {
    const icon = iconStore.getIcon(options.iconId);
    if (!icon) {
      throw new Error(`Icon with ID ${options.iconId} not found`);
    }

    // Show save dialog
    const defaultPath = path.join(app.getPath('downloads'), `${icon.name}.zip`);
    const { filePath } = await dialog.showSaveDialog({
      defaultPath,
      filters: options.format === 'zip' 
        ? [{ name: 'ZIP Archive', extensions: ['zip'] }]
        : []
    });

    if (!filePath) return null;

    try {
      if (options.format === 'zip') {
        await this.exportAsZip(icon, options, filePath);
      } else {
        await this.exportAsFolder(icon, options, filePath);
      }
      return filePath;
    } catch (error: any) {
      console.error('Failed to export icon:', error);
      throw new Error(`Failed to export icon: ${error.message}`);
    }
  }

  async exportAsZip(icon: Icon, options: ExportOptions, outputPath: string): Promise<void> {
    const zip = new JSZip();

    // Add icon files for each platform
    for (const platform of options.platforms) {
      const config = this.platformConfigs[platform];
      if (!config) continue;

      const platformFolder = zip.folder(platform);
      if (!platformFolder) continue;

      // Add icon files
      for (const size of options.sizes) {
        if (icon.formats.png && icon.formats.png[size]) {
          const buffer = Buffer.from(icon.formats.png[size], 'base64');
          platformFolder.file(`icon-${size}.png`, buffer);
        }
      }

      // Add SVG if supported
      if (config.formats.includes('svg') && icon.formats.svg) {
        platformFolder.file('icon.svg', icon.formats.svg);
      }

      // Add ICO for web
      if (platform === 'web' && icon.formats.ico) {
        const buffer = Buffer.from(icon.formats.ico, 'base64');
        platformFolder.file('favicon.ico', buffer);
      }

      // Add additional platform-specific files
      if (config.additionalFiles) {
        for (const file of config.additionalFiles) {
          if (file.content === 'ico' && icon.formats.ico) {
            const buffer = Buffer.from(icon.formats.ico, 'base64');
            platformFolder.file(file.name, buffer);
          } else {
            platformFolder.file(file.name, file.content);
          }
        }
      }
    }

    // Add README
    zip.file('README.md', this.generateReadme(icon, options));

    // Generate ZIP file
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(outputPath, content);
  }

  async exportAsFolder(icon: Icon, options: ExportOptions, outputPath: string): Promise<void> {
    // Create main folder
    await fs.mkdir(outputPath, { recursive: true });

    // Create platform folders
    for (const platform of options.platforms) {
      const config = this.platformConfigs[platform];
      if (!config) continue;

      const platformPath = path.join(outputPath, platform);
      await fs.mkdir(platformPath, { recursive: true });

      // Save icon files
      for (const size of options.sizes) {
        if (icon.formats.png && icon.formats.png[size]) {
          const buffer = Buffer.from(icon.formats.png[size], 'base64');
          await fs.writeFile(
            path.join(platformPath, `icon-${size}.png`),
            buffer
          );
        }
      }

      // Save SVG if supported
      if (config.formats.includes('svg') && icon.formats.svg) {
        await fs.writeFile(
          path.join(platformPath, 'icon.svg'),
          icon.formats.svg
        );
      }

      // Save ICO for web
      if (platform === 'web' && icon.formats.ico) {
        const buffer = Buffer.from(icon.formats.ico, 'base64');
        await fs.writeFile(
          path.join(platformPath, 'favicon.ico'),
          buffer
        );
      }

      // Save additional platform-specific files
      if (config.additionalFiles) {
        for (const file of config.additionalFiles) {
          if (file.content === 'ico' && icon.formats.ico) {
            const buffer = Buffer.from(icon.formats.ico, 'base64');
            await fs.writeFile(
              path.join(platformPath, file.name),
              buffer
            );
          } else {
            await fs.writeFile(
              path.join(platformPath, file.name),
              file.content
            );
          }
        }
      }
    }

    // Save README
    await fs.writeFile(
      path.join(outputPath, 'README.md'),
      this.generateReadme(icon, options)
    );
  }

  async exportSingleIcon(iconId: string, format: string, size?: string): Promise<string | null> {
    const icon = iconStore.getIcon(iconId);
    if (!icon) {
      throw new Error(`Icon with ID ${iconId} not found`);
    }

    let defaultName = icon.name.replace(/\s+/g, '-').toLowerCase();
    let extension = format;
    let filters: Electron.FileFilter[] = [];

    switch (format) {
      case 'svg':
        if (!icon.formats.svg) {
          throw new Error('SVG format not available for this icon');
        }
        extension = 'svg';
        filters = [{ name: 'SVG', extensions: ['svg'] }];
        break;
      case 'png':
        if (!size) {
          throw new Error('Size is required for PNG export');
        }
        if (!icon.formats.png || !icon.formats.png[size]) {
          throw new Error(`PNG format with size ${size} not available for this icon`);
        }
        defaultName = `${defaultName}-${size}`;
        extension = 'png';
        filters = [{ name: 'PNG', extensions: ['png'] }];
        break;
      case 'ico':
        if (!icon.formats.ico) {
          throw new Error('ICO format not available for this icon');
        }
        extension = 'ico';
        filters = [{ name: 'ICO', extensions: ['ico'] }];
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const { filePath } = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('downloads'), `${defaultName}.${extension}`),
      filters
    });

    if (!filePath) return null;

    try {
      // Save the file
      if (format === 'svg' && icon.formats.svg) {
        await fs.writeFile(filePath, icon.formats.svg);
      } else if (format === 'png' && size && icon.formats.png && icon.formats.png[size]) {
        const buffer = Buffer.from(icon.formats.png[size], 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (format === 'ico' && icon.formats.ico) {
        const buffer = Buffer.from(icon.formats.ico, 'base64');
        await fs.writeFile(filePath, buffer);
      }
      return filePath;
    } catch (error: any) {
      console.error('Failed to save icon file:', error);
      throw new Error(`Failed to save icon file: ${error.message}`);
    }
  }

  private generateReadme(icon: Icon, options: ExportOptions): string {
    const date = new Date().toLocaleString();
    
    return `# ${icon.name}

Generated with Icon Maker Pro

## Details
- **Prompt**: ${icon.prompt}
- **Style**: ${icon.style}
- **Primary Color**: ${icon.primaryColor}
- **Secondary Color**: ${icon.secondaryColor}
- **Generated**: ${date}

## Included Platforms
${options.platforms.map(p => `- ${this.platformConfigs[p]?.name || p}`).join('\n')}

## Sizes
${options.sizes.join(', ')}

## Usage

### Web
Place the icons in your web project and reference them in your HTML:
\`\`\`html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png">
\`\`\`

### iOS
Add the icons to your Xcode project's Assets.xcassets folder.

### Android
Place the icons in the appropriate drawable folders:
- \`drawable-ldpi/\` - 36x36
- \`drawable-mdpi/\` - 48x48
- \`drawable-hdpi/\` - 72x72
- \`drawable-xhdpi/\` - 96x96
- \`drawable-xxhdpi/\` - 144x144
- \`drawable-xxxhdpi/\` - 192x192

### macOS
Use the .icns file for your macOS application icon.

---
Generated with Icon Maker Pro - https://github.com/yourusername/icon-maker
`;
  }
}

export default new IconExporter();