import { usePeerIds } from "@huddle01/react/hooks";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FC } from "react";
import NameEditor from "./NameEditor";
import VideoElem from "./Video";

const PeerData = dynamic(() => import("./PeerData"), {
  ssr: false,
});

interface ShowPeersProps {
  displayName: string | undefined;
  avatarUrl: string | undefined;
  camTrack: MediaStreamTrack | null;
  isVideoOn: boolean;
}

const ShowPeers: FC<ShowPeersProps> = ({
  displayName,
  avatarUrl,
  camTrack,
  isVideoOn,
}) => {
  const { peerIds } = usePeerIds();

  return (
    <div className="my-5 mt-12 flex h-[75vh] items-center justify-center self-stretch md:px-0 px-4">
      <div className="flex h-full grid-cols-2 md:flex-row flex-col w-full items-center justify-center gap-10 rounded-lg ">
        <div
          className={clsx(
            Object.values(peerIds).length === 0
              ? "my-5 h-full w-[60vw]"
              : "md:h-[60vh] md:w-[40vw] w-full",
            "bg-gray-900",
            "relative flex flex-shrink-0 items-center justify-center rounded-lg border border-gray-600/50 bg-gray-600/10 backdrop-blur-sm shadow-lg"
          )}
        >
          {isVideoOn ? (
            <VideoElem track={camTrack} />
          ) : (
            <div className="h-full w-full flex flex-col justify-center items-center">
              <Image
                src="/4.png"
                loader={({ src }) => src}
                unoptimized
                width={100}
                height={100}
                alt="avatar"
                className="mb-16 mt-16 h-32 w-32 rounded-full"
              />
            </div>
          )}
          <div className="flex">
            <NameEditor displayName={`${displayName ?? "Blinkr User"}`} />
          </div>
        </div>
        {Object.values(peerIds).length > 0 &&
          peerIds.map((peerId) => <PeerData key={peerId} peerId={peerId} />)}
      </div>
    </div>
  );
};

export default ShowPeers;
