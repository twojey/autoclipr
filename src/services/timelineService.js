// Service for handling timeline operations
export const MAX_CLIP_DURATION = 120; // 2 minutes in seconds

export class TimelineService {
  constructor(videoDuration) {
    this.videoDuration = videoDuration;
    this.currentTime = 0;
    this.startTime = 0;
    this.endTime = Math.min(videoDuration, MAX_CLIP_DURATION);
    this.isPlaying = false;
    this.timeScale = 1;
  }

  setTimeScale(scale) {
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 10;
    this.timeScale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
  }

  movePlayhead(time) {
    this.currentTime = Math.min(Math.max(time, 0), this.videoDuration);
    return this.currentTime;
  }

  moveStartMarker(time) {
    const newStart = Math.min(Math.max(time, 0), this.endTime - 1);
    if (this.endTime - newStart <= MAX_CLIP_DURATION) {
      this.startTime = newStart;
      this.currentTime = newStart;
    }
    return this.startTime;
  }

  moveEndMarker(time) {
    const newEnd = Math.min(Math.max(time, this.startTime + 1), this.videoDuration);
    if (newEnd - this.startTime <= MAX_CLIP_DURATION) {
      this.endTime = newEnd;
      this.currentTime = newEnd;
    }
    return this.endTime;
  }

  moveClipWindow(offset) {
    const duration = this.endTime - this.startTime;
    let newStart = this.startTime + offset;
    let newEnd = this.endTime + offset;

    if (newStart < 0) {
      newStart = 0;
      newEnd = duration;
    }
    if (newEnd > this.videoDuration) {
      newEnd = this.videoDuration;
      newStart = newEnd - duration;
    }

    this.startTime = newStart;
    this.endTime = newEnd;
    this.currentTime = newStart;
    
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      currentTime: this.currentTime
    };
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  pause() {
    this.isPlaying = false;
  }

  getCurrentClipDuration() {
    return this.endTime - this.startTime;
  }

  getTimelineState() {
    return {
      currentTime: this.currentTime,
      startTime: this.startTime,
      endTime: this.endTime,
      isPlaying: this.isPlaying,
      timeScale: this.timeScale,
      clipDuration: this.getCurrentClipDuration()
    };
  }
}
