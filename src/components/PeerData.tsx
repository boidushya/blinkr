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
  })

  const { track: mic } = useRemoteAudio({
    peerId,
  })

  if (!metadata) return null;

  return (
    <div
    key={peerId}
    className="relative flex h-[60vh] w-[40vw] flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-transparent"
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
    <div className="bg-black text-slate-100 absolute bottom-1 left-1 rounded-md py-1 px-2 font-lg flex gap-2">
      {metadata.displayName ?? "Guest"}
      {BasicIcons.ping}
    </div>
  </div>
  );
};

export default PeerData;