import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path from static binary
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

interface CalloutConfig {
  x: number;
  y: number;
  radius: number;
  color: string;
  label?: string;
}

interface FrameConfig {
  filename: string;
  duration: number; // ms
  callout?: CalloutConfig;
  description: string;
}

// Demo frame sequence with callout positions (approximate)
const FRAME_SEQUENCE: FrameConfig[] = [
  { filename: '01-home-page.png', duration: 2000, description: 'Home page - Path Portals', callout: { x: 400, y: 300, radius: 60, color: '#FF5500', label: 'Click BAR' } },
  { filename: '02-bar-page-loaded.png', duration: 2000, description: 'BAR page loaded' },
  { filename: '03-company-name-filled.png', duration: 1500, description: 'Enter company name', callout: { x: 300, y: 200, radius: 40, color: '#FF5500', label: 'Company' } },
  { filename: '04-attendees-filled.png', duration: 1500, description: 'Enter attendees' },
  { filename: '05-password-safe-selected.png', duration: 1500, description: 'Select Password Safe', callout: { x: 200, y: 300, radius: 50, color: '#FF5500', label: 'Select' } },
  { filename: '06-password-safe-configured.png', duration: 1500, description: 'Configure version & deployment' },
  { filename: '07-pm-winmac-selected.png', duration: 1500, description: 'Select PM Windows/Mac' },
  { filename: '08-solutions-configured.png', duration: 2000, description: 'Solutions configured' },
  { filename: '09-initiative-selected-questions.png', duration: 2000, description: 'Select future initiatives', callout: { x: 400, y: 400, radius: 50, color: '#FF5500', label: 'Select' } },
  { filename: '10-discovery-question-answered.png', duration: 1500, description: 'Answer discovery questions' },
  { filename: '11-platforms-selected.png', duration: 1500, description: 'Select platforms' },
  { filename: '12-export-button-hover.png', duration: 2500, description: 'Export to PDF', callout: { x: 300, y: 500, radius: 50, color: '#FF5500', label: 'Export PDF' } },
];

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'output', 'screenshots');
const FRAMES_DIR = path.join(__dirname, '..', 'output', 'frames');
const VIDEOS_DIR = path.join(__dirname, '..', 'output', 'videos');

async function ensureDirectories() {
  for (const dir of [FRAMES_DIR, VIDEOS_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function createCalloutOverlay(width: number, height: number, callout: CalloutConfig): Promise<Buffer> {
  // Create SVG overlay with callout circle and label
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="${callout.x}"
        cy="${callout.y}"
        r="${callout.radius}"
        fill="none"
        stroke="${callout.color}"
        stroke-width="4"
        filter="url(#glow)"
      />
      <circle
        cx="${callout.x}"
        cy="${callout.y}"
        r="${callout.radius + 8}"
        fill="none"
        stroke="${callout.color}"
        stroke-width="2"
        opacity="0.5"
      />
      ${callout.label ? `
        <rect
          x="${callout.x + callout.radius + 10}"
          y="${callout.y - 15}"
          width="${callout.label.length * 10 + 20}"
          height="30"
          rx="5"
          fill="rgba(0,0,0,0.8)"
        />
        <text
          x="${callout.x + callout.radius + 20}"
          y="${callout.y + 5}"
          fill="white"
          font-family="Arial, sans-serif"
          font-size="14"
          font-weight="bold"
        >${callout.label}</text>
      ` : ''}
    </svg>
  `;
  return Buffer.from(svg);
}

async function processFrame(frame: FrameConfig, index: number): Promise<string> {
  const inputPath = path.join(SCREENSHOTS_DIR, frame.filename);
  const outputPath = path.join(FRAMES_DIR, `frame-${String(index).padStart(3, '0')}.png`);

  if (!fs.existsSync(inputPath)) {
    console.error(`Screenshot not found: ${inputPath}`);
    return '';
  }

  let image = sharp(inputPath);
  const metadata = await image.metadata();

  if (frame.callout && metadata.width && metadata.height) {
    const overlay = await createCalloutOverlay(metadata.width, metadata.height, frame.callout);
    image = image.composite([{ input: overlay, top: 0, left: 0 }]);
  }

  await image.toFile(outputPath);
  console.log(`Processed: ${frame.filename} -> frame-${String(index).padStart(3, '0')}.png`);
  return outputPath;
}

async function generateHTMLSlideshow() {
  const slideshowPath = path.join(VIDEOS_DIR, 'bar-demo.html');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAR Demo - Path Portals</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a1a2e;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      width: 100%;
    }
    h1 {
      color: #FF5500;
      text-align: center;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #888;
      text-align: center;
      margin-bottom: 20px;
    }
    .slideshow {
      position: relative;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .slide {
      display: none;
      animation: fadeIn 0.5s ease-in-out;
    }
    .slide.active {
      display: block;
    }
    .slide img {
      width: 100%;
      height: auto;
      display: block;
    }
    .caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.9));
      color: white;
      padding: 40px 20px 20px;
      font-size: 18px;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      background: #FF5500;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s;
    }
    button:hover {
      background: #cc4400;
    }
    button:disabled {
      background: #666;
      cursor: not-allowed;
    }
    .progress {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin-top: 15px;
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #444;
      border-radius: 50%;
      transition: background 0.3s;
    }
    .dot.active {
      background: #FF5500;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>BAR Demo - Acme Corporation</h1>
    <p class="subtitle">Business Account Review Walkthrough</p>

    <div class="slideshow">
      ${FRAME_SEQUENCE.map((frame, i) => `
        <div class="slide${i === 0 ? ' active' : ''}" data-duration="${frame.duration}">
          <img src="../frames/frame-${String(i).padStart(3, '0')}.png" alt="${frame.description}">
          <div class="caption">${frame.description}</div>
        </div>
      `).join('')}
    </div>

    <div class="controls">
      <button id="prev">Previous</button>
      <button id="playPause">Play</button>
      <button id="next">Next</button>
    </div>

    <div class="progress">
      ${FRAME_SEQUENCE.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}"></div>`).join('')}
    </div>
  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const playPauseBtn = document.getElementById('playPause');
    let currentSlide = 0;
    let isPlaying = false;
    let timer = null;

    function showSlide(index) {
      slides.forEach((s, i) => {
        s.classList.toggle('active', i === index);
        dots[i].classList.toggle('active', i === index);
      });
      currentSlide = index;
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % slides.length);
    }

    function prevSlide() {
      showSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    function play() {
      if (isPlaying) return;
      isPlaying = true;
      playPauseBtn.textContent = 'Pause';
      scheduleNext();
    }

    function pause() {
      isPlaying = false;
      playPauseBtn.textContent = 'Play';
      if (timer) clearTimeout(timer);
    }

    function scheduleNext() {
      if (!isPlaying) return;
      const duration = parseInt(slides[currentSlide].dataset.duration) || 2000;
      timer = setTimeout(() => {
        nextSlide();
        scheduleNext();
      }, duration);
    }

    document.getElementById('prev').onclick = () => { pause(); prevSlide(); };
    document.getElementById('next').onclick = () => { pause(); nextSlide(); };
    playPauseBtn.onclick = () => isPlaying ? pause() : play();

    // Auto-play on load
    setTimeout(play, 1000);
  </script>
</body>
</html>`;

  fs.writeFileSync(slideshowPath, html);
  console.log(`\nGenerated HTML slideshow: ${slideshowPath}`);
}

async function generateFFmpegScript() {
  const concatPath = path.join(FRAMES_DIR, 'concat.txt');

  // Create concat file for ffmpeg
  // Note: FFmpeg concat demuxer requires last frame to be duplicated for proper duration
  const concatContent = FRAME_SEQUENCE.map((frame, i) => {
    const framePath = `frame-${String(i).padStart(3, '0')}.png`;
    const duration = frame.duration / 1000;
    return `file '${framePath}'\nduration ${duration}`;
  }).join('\n');

  // Add duplicate of last frame (required by concat demuxer for last frame duration)
  const lastFramePath = `frame-${String(FRAME_SEQUENCE.length - 1).padStart(3, '0')}.png`;
  const fullContent = concatContent + `\nfile '${lastFramePath}'`;

  fs.writeFileSync(concatPath, fullContent);
  console.log(`\nCreated concat file: ${concatPath}`);
}

async function generateMP4(): Promise<void> {
  const concatPath = path.join(FRAMES_DIR, 'concat.txt');
  const outputPath = path.join(VIDEOS_DIR, 'bar-demo.mp4');

  return new Promise((resolve, reject) => {
    console.log('\nGenerating MP4 video...');

    ffmpeg()
      .input(concatPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .videoFilters([
        'scale=1920:1080:force_original_aspect_ratio=decrease',
        'pad=1920:1080:(ow-iw)/2:(oh-ih)/2'
      ])
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-pix_fmt', 'yuv420p'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('FFmpeg command:', cmd))
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\rProgress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`\nMP4 generated: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('\nMP4 generation failed:', err.message);
        reject(err);
      })
      .run();
  });
}

async function generateGIF(): Promise<void> {
  const mp4Path = path.join(VIDEOS_DIR, 'bar-demo.mp4');
  const palettePath = path.join(VIDEOS_DIR, 'palette.png');
  const outputPath = path.join(VIDEOS_DIR, 'bar-demo.gif');

  // Two-pass GIF generation from MP4 for better quality
  // Pass 1: Generate palette from MP4
  await new Promise<void>((resolve, reject) => {
    console.log('\nGenerating GIF palette (pass 1)...');

    ffmpeg()
      .input(mp4Path)
      .videoFilters([
        'fps=10',
        'scale=800:-1:flags=lanczos',
        'palettegen=stats_mode=diff'
      ])
      .output(palettePath)
      .on('start', (cmd) => console.log('FFmpeg command:', cmd))
      .on('end', () => {
        console.log('Palette generated');
        resolve();
      })
      .on('error', (err) => {
        console.error('\nPalette generation failed:', err.message);
        reject(err);
      })
      .run();
  });

  // Pass 2: Generate GIF using palette
  return new Promise((resolve, reject) => {
    console.log('\nGenerating GIF (pass 2)...');

    ffmpeg()
      .input(mp4Path)
      .input(palettePath)
      .complexFilter([
        '[0:v]fps=10,scale=800:-1:flags=lanczos[v]',
        '[v][1:v]paletteuse=dither=bayer:bayer_scale=5'
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log('FFmpeg command:', cmd))
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\rProgress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`\nGIF generated: ${outputPath}`);
        // Clean up palette file
        if (fs.existsSync(palettePath)) {
          fs.unlinkSync(palettePath);
        }
        resolve();
      })
      .on('error', (err) => {
        console.error('\nGIF generation failed:', err.message);
        reject(err);
      })
      .run();
  });
}

async function main() {
  console.log('BAR Demo Video Generator\n');
  console.log('========================\n');

  await ensureDirectories();

  // Process each frame with callouts
  console.log('Processing frames with callouts...\n');
  for (let i = 0; i < FRAME_SEQUENCE.length; i++) {
    await processFrame(FRAME_SEQUENCE[i], i);
  }

  // Generate HTML slideshow (works without FFmpeg)
  await generateHTMLSlideshow();

  // Create concat file for ffmpeg
  await generateFFmpegScript();

  // Generate MP4 and GIF videos
  try {
    await generateMP4();
    await generateGIF();
  } catch (err) {
    console.error('\nVideo generation failed. FFmpeg may not be properly configured.');
    console.error('HTML slideshow is still available.');
  }

  console.log('\n========================');
  console.log('Processing complete!');
  console.log('\nOutputs:');
  console.log(`  - Frames with callouts: ${FRAMES_DIR}`);
  console.log(`  - HTML Slideshow: ${path.join(VIDEOS_DIR, 'bar-demo.html')}`);
  console.log(`  - MP4 Video: ${path.join(VIDEOS_DIR, 'bar-demo.mp4')}`);
  console.log(`  - GIF Animation: ${path.join(VIDEOS_DIR, 'bar-demo.gif')}`);
}

main().catch(console.error);
