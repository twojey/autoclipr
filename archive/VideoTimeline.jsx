import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';

const VideoTimeline = ({
  duration = 0,
  currentTime = 0,
  thumbnails = [],
  onTimeChange,
  className = '',
}) => {
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    const updateTimelineWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };

    updateTimelineWidth();
    window.addEventListener('resize', updateTimelineWidth);
    return () => window.removeEventListener('resize', updateTimelineWidth);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateTime(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateTime(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateTime = (e) => {
    if (timelineRef.current && duration > 0) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      onTimeChange?.(newTime);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimelineMarkers = () => {
    const markers = [];
    const step = duration / 10;
    for (let i = 0; i <= 10; i++) {
      const time = i * step;
      markers.push(
        <div
          key={i}
          className="absolute h-2 border-l border-light-text-tertiary dark:border-dark-text-tertiary"
          style={{ left: `${(i * 100) / 10}%` }}
        >
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            {formatTime(time)}
          </span>
        </div>
      );
    }
    return markers;
  };

  return (
    <Card
      variant="default"
      className={`p-4 ${className}`}
    >
      <div
        ref={timelineRef}
        className="relative h-16 mt-6 cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {/* Thumbnails background */}
        <div className="absolute inset-0 bg-light-background-secondary dark:bg-dark-background-secondary rounded-lg overflow-hidden">
          {thumbnails.map((thumbnail, index) => (
            <img
              key={index}
              src={thumbnail.url}
              alt={`Thumbnail ${index}`}
              className="absolute h-full object-cover"
              style={{
                left: `${(thumbnail.time / duration) * 100}%`,
                width: `${timelineWidth / thumbnails.length}px`,
              }}
            />
          ))}
        </div>

        {/* Timeline markers */}
        {getTimelineMarkers()}

        {/* Progress indicator */}
        <div
          className="absolute top-0 h-full bg-primary-500/20 pointer-events-none"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Current time indicator */}
        <div
          className="absolute top-0 h-full w-0.5 bg-primary-500 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary-500 text-white text-xs">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoTimeline;
