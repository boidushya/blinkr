import { useRemotePeer } from "@huddle01/react/hooks";
import { useRemoteVideo } from "@huddle01/react/hooks";
import { useRemoteAudio } from "@huddle01/react/hooks";
import VideoElem from "./Video";
import AudioElem from "./Audio";
import Image from "next/image";
import { BasicIcons } from "./BasicIcons";

interface Props {
  peerId: string;
}

const PeerData: React.FC<Props> = ({ peerId }) => {
  const { metadata } = useRemotePeer<{
    displayName: string;
    avatarUrl: string;
  }>({
    peerId,
  });

  const { track: cam, isVideoOn } = useRemoteVideo({
    peerId,
  });

  const { track: mic } = useRemoteAudio({
    peerId,
  });

  if (!metadata) return null;

  return (
    <div
      key={peerId}
      className="relative flex md:h-[60vh] md:w-[40vw] w-full flex-shrink-0 items-center justify-center rounded-lg border border-gray-600/50 bg-gray-600/10 backdrop-blur-sm shadow-lg"
    >
      {isVideoOn ? (
        <VideoElem track={cam} key={peerId} />
      ) : (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <Image
            key={peerId}
            src={metadata.avatarUrl}
            loader={({ src }) => src}
            width={100}
            height={100}
            alt="avatar"
            className="mb-16 mt-16 h-32 w-32 rounded-full"
          />
        </div>
      )}
      {mic && <AudioElem track={mic} key={peerId} />}
      <div className="bg-gray-500/50 shadow-custom text-gray-200 absolute bottom-4 left-4 rounded-md py-1 px-2 font-lg flex gap-2">
        {metadata.displayName ?? "Guest"}
        {BasicIcons.ping}
      </div>
    </div>
  );
};

export default PeerData;
