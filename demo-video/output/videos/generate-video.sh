#!/bin/bash
# FFmpeg video generation script for BAR Demo
# Run this script after installing FFmpeg

cd "C:\code\se-path-portals-aws\demo-video\output\frames"

# Generate MP4
ffmpeg -f concat -safe 0 -i concat.txt -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "C:\code\se-path-portals-aws\demo-video\output\videos\bar-demo.mp4"

# Generate GIF (smaller size for web)
ffmpeg -f concat -safe 0 -i concat.txt -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "C:\code\se-path-portals-aws\demo-video\output\videos\bar-demo.gif"

echo "Video generation complete!"
echo "MP4: C:\code\se-path-portals-aws\demo-video\output\videos\bar-demo.mp4"
echo "GIF: C:\code\se-path-portals-aws\demo-video\output\videos\bar-demo.gif"
