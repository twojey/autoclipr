import { Composition } from 'remotion';
import { RemotionComposition, RemotionVideo } from './RemotionComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="720p"
        component={RemotionComposition}
        durationInFrames={1}
        fps={RemotionVideo['720p'].fps}
        width={RemotionVideo['720p'].width}
        height={RemotionVideo['720p'].height}
      />
      <Composition
        id="1080p"
        component={RemotionComposition}
        durationInFrames={1}
        fps={RemotionVideo['1080p'].fps}
        width={RemotionVideo['1080p'].width}
        height={RemotionVideo['1080p'].height}
      />
      <Composition
        id="2k"
        component={RemotionComposition}
        durationInFrames={1}
        fps={RemotionVideo['2k'].fps}
        width={RemotionVideo['2k'].width}
        height={RemotionVideo['2k'].height}
      />
    </>
  );
};

export default RemotionRoot;
