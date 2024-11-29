// Video export service using native browser capabilities
import { ASPECT_RATIO } from './videoTransformService';

const getVideoMetadata = (videoUrl) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      resolve({
        fps: 30, // Default to 30fps since we can't get actual fps from HTML5 video
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };
    video.onerror = reject;
  });
};

const getResolution = (quality) => {
  const baseHeight = 1920;
  const width = Math.floor((baseHeight * ASPECT_RATIO.width) / ASPECT_RATIO.height);
  
  switch (quality) {
    case 'fast':
      return { 
        width: Math.floor(width * 0.375), // 720p
        height: 720,
        bitrate: 2500000 // 2.5 Mbps
      };
    case 'medium':
      return { 
        width: Math.floor(width * 0.5625), // 1080p
        height: 1080,
        bitrate: 5000000 // 5 Mbps
      };
    case 'high':
      return { 
        width: Math.floor(width * 0.75), // 1440p
        height: 1440,
        bitrate: 8000000 // 8 Mbps
      };
    default:
      return { 
        width: Math.floor(width * 0.5625), // 1080p
        height: 1080,
        bitrate: 5000000 // 5 Mbps
      };
  }
};

export const exportVideo = async ({
  videoFile,
  cutStart,
  cutEnd,
  videoScale = 1,
  videoPosition = { x: 0, y: 0 },
  quality = 'medium',
  onProgress,
  backgroundBlur = true
}) => {
  try {
    // Get video metadata
    const metadata = await getVideoMetadata(videoFile);
    const { width, height, bitrate } = getResolution(quality);
    
    console.log('Starting export with settings:', {
      metadata,
      width,
      height,
      videoFile,
      cutStart,
      cutEnd,
      videoScale,
      videoPosition,
      backgroundBlur
    });

    // Create video elements
    const mainVideo = document.createElement('video');
    const bgVideo = document.createElement('video');
    mainVideo.src = videoFile;
    bgVideo.src = videoFile;
    
    await Promise.all([
      new Promise((resolve) => {
        mainVideo.onloadeddata = resolve;
        mainVideo.load();
      }),
      new Promise((resolve) => {
        bgVideo.onloadeddata = resolve;
        bgVideo.load();
      })
    ]);

    // Create canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create MediaRecorder
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=h264',
      videoBitsPerSecond: bitrate
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    // Return promise that resolves with the exported video URL
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      // Start recording
      mediaRecorder.start();

      // Set initial time
      mainVideo.currentTime = cutStart;
      bgVideo.currentTime = cutStart;
      
      const render = () => {
        if (mainVideo.currentTime >= cutEnd) {
          mediaRecorder.stop();
          return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background video if enabled
        if (backgroundBlur) {
          ctx.filter = 'blur(10px)';
          ctx.drawImage(bgVideo, 0, 0, width, height);
          ctx.filter = 'none';
        }

        // Draw main video with transformations
        ctx.save();
        ctx.translate(videoPosition.x, videoPosition.y);
        ctx.scale(videoScale, videoScale);
        ctx.drawImage(mainVideo, 0, 0, width, height);
        ctx.restore();

        // Draw overlay grid during export (optional)
        // drawOverlayGrid(ctx, width, height);

        // Update progress
        const progress = (mainVideo.currentTime - cutStart) / (cutEnd - cutStart);
        onProgress?.(progress);

        // Advance to next frame
        mainVideo.currentTime += 1/30;
        bgVideo.currentTime = mainVideo.currentTime;
        requestAnimationFrame(render);
      };

      // Start rendering
      render();
    });
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};
