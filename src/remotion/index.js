import { registerRoot } from 'remotion';
import { VideoEditor } from '../components/VideoEditor/VideoEditor';

registerRoot({
  component: VideoEditor,
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 10, // 10 seconds default
});
