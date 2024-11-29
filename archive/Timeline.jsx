import React, { useRef, useEffect } from 'react';

const Timeline = ({
  currentTime = 0,
  duration = 0,
  startTime = 0,
  endTime = 0,
  onCurrentTimeChange = () => {},
  onStartTimeChange = () => {},
  onEndTimeChange = () => {}
}) => {
  const timelineRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef(null); // 'current', 'start', or 'end'

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateTimeFromPosition = (position) => {
    if (!timelineRef.current) return 0;
    const width = timelineRef.current.offsetWidth;
    const time = (position / width) * duration;
    return Math.max(0, Math.min(duration, time));
  };

  const handleMouseDown = (e, target) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragTargetRef.current = target;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newTime = calculateTimeFromPosition(position);

    switch (dragTargetRef.current) {
      case 'current':
        onCurrentTimeChange(Math.max(startTime, Math.min(endTime, newTime)));
        break;
      case 'start':
        if (newTime < endTime - 1) {
          onStartTimeChange(Math.max(0, newTime));
        }
        break;
      case 'end':
        if (newTime > startTime + 1) {
          onEndTimeChange(Math.min(duration, newTime));
        }
        break;
      default:
        break;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragTargetRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newTime = calculateTimeFromPosition(position);
    onCurrentTimeChange(Math.max(startTime, Math.min(endTime, newTime)));
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const timelineStyles = {
    container: "space-y-2",
    timeIndicators: "flex justify-between text-sm text-gray-500 dark:text-gray-400",
    timeline: "relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer",
    selectedRange: "absolute h-full bg-blue-200 dark:bg-blue-900 rounded-lg",
    handle: "absolute top-0 w-2 h-full bg-blue-500 cursor-ew-resize hover:bg-blue-600 transition-colors",
    currentTime: "absolute top-0 w-1 h-full bg-red-500"
  };

  return (
    <div className={timelineStyles.container}>
      {/* Time indicators */}
      <div className={timelineStyles.timeIndicators}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className={timelineStyles.timeline}
        onClick={handleTimelineClick}
      >
        {/* Selected range */}
        <div
          className={timelineStyles.selectedRange}
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`
          }}
        />

        {/* Start handle */}
        <div
          className={timelineStyles.handle}
          style={{ left: `${(startTime / duration) * 100}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />

        {/* End handle */}
        <div
          className={timelineStyles.handle}
          style={{ left: `${(endTime / duration) * 100}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        />

        {/* Current time indicator */}
        <div
          className={timelineStyles.currentTime}
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'current')}
        />
      </div>
    </div>
  );
};

export default Timeline;
