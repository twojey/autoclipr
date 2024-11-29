import { Composition } from 'remotion';
import { useVideoConfig, Video } from 'remotion';

const VideoComposition = ({ videoSrc, startTime, endTime }) => {
  const { fps, width, height } = useVideoConfig();
  
  // Convertir les temps en frames
  const startFrame = Math.round(startTime * fps);
  const endFrame = Math.round(endTime * fps);
  
  return (
    <Video
      src={videoSrc}
      startFrom={startFrame}
      endAt={endFrame}
      style={{
        width,
        height,
      }}
    />
  );
};

export const RemotionVideo = {
  VideoClip: VideoComposition,
};

export const RemotionComposition = ({ videoSrc, startTime, endTime }) => {
  return (
    <Composition
      id="VideoClip"
      component={VideoComposition}
      durationInFrames={Math.round((endTime - startTime) * 30)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        videoSrc,
        startTime,
        endTime,
      }}
    />
  );
};

export default RemotionComposition;
