import { useVideoConfig, Video, AbsoluteFill } from 'remotion';

export const VideoEditor = ({ videoUrl, startTime, endTime }) => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill>
            <Video
                src={videoUrl}
                startFrom={Math.floor(startTime * fps)}
                endAt={Math.floor(endTime * fps)}
            />
        </AbsoluteFill>
    );
};
