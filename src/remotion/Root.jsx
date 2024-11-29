import {Composition} from 'remotion';
import {VideoComposition} from './compositions/VideoComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
