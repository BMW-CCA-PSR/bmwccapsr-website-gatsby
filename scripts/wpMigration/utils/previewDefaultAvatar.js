#!/usr/bin/env node

/**
 * Utility script to preview the default author avatar.
 * Run with: node scripts/wpMigration/utils/previewDefaultAvatar.js
 * 
 * This will generate an HTML file you can open in your browser to see
 * what the default avatar looks like.
 */

const fs = require('fs');
const path = require('path');
const {generateDefaultAvatarSvg} = require('./defaultAvatar');

const svg = generateDefaultAvatarSvg();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Default Author Avatar Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    
    h1 {
      margin: 0 0 10px 0;
      color: #1a202c;
      text-align: center;
    }
    
    p {
      color: #718096;
      text-align: center;
      margin: 0 0 30px 0;
    }
    
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .preview-item {
      text-align: center;
    }
    
    .preview-item small {
      display: block;
      color: #718096;
      margin-top: 10px;
      font-size: 12px;
    }
    
    svg {
      border-radius: 8px;
      background: #f7fafc;
    }
    
    .preview-circle {
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
    }
    
    .preview-circle-small {
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
    }
    
    .code-section {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin-top: 30px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #2d3748;
      overflow-x: auto;
    }
    
    .code-section pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Default Author Avatar</h1>
    <p>Preview of the grey silhouette user icon used for imported authors without custom images</p>
    
    <div class="preview-grid">
      <div class="preview-item">
        <div class="preview-circle">
          <svg width="120" height="120" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="#c5c8ce"/>
            <g fill="#707984">
              <circle cx="128" cy="79.36" r="40.96"/>
              <circle cx="128" cy="261.12" r="110.08"/>
            </g>
          </svg>
        </div>
        <small>With border-radius (circular mask)</small>
      </div>
      
      <div class="preview-item">
        <svg width="120" height="120" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="#c5c8ce"/>
          <g fill="#707984">
            <circle cx="128" cy="79.36" r="40.96"/>
            <circle cx="128" cy="261.12" r="110.08"/>
          </g>
        </svg>
        <small>Square (as generated)</small>
      </div>
      
      <div class="preview-item">
        <div class="preview-circle-small">
          <svg width="80" height="80" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="#c5c8ce"/>
            <g fill="#707984">
              <circle cx="128" cy="79.36" r="40.96"/>
              <circle cx="128" cy="261.12" r="110.08"/>
            </g>
          </svg>
        </div>
        <small>80×80px (circular)</small>
      </div>
    </div>
    
    <div class="code-section">
      <strong>SVG Source:</strong>
      <pre>${svg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    
    <div class="code-section" style="margin-top: 20px; border-left-color: #48bb78;">
      <strong>Color Palette:</strong>
      <pre>Background: #c5c8ce
    Silhouette: #707984
    Head diameter: 32% of avatar size (40.96px radius at 256×256)
    Shoulders: clipped circle centered below frame</pre>
    </div>
  </div>
</body>
</html>`;

const outputPath = path.join(__dirname, 'default-avatar-preview.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log(`✓ Default avatar preview generated: ${outputPath}`);
console.log(`  Open this file in your browser to see the avatar design.`);
