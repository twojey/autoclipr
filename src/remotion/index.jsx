import { registerRoot, Composition } from 'remotion';
import { VideoEditor } from '../components/VideoEditor/VideoEditor';

export const RemotionVideo = ({ videoUrl, startTime, endTime, duration }) => {
    return (
        <>
            <Composition
                id="VideoEditor"
                component={VideoEditor}
                durationInFrames={Math.floor(duration * 30)}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    videoUrl,
                    startTime,
                    endTime,
                }}
            />
        </>
    );
};

registerRoot(RemotionVideo);
