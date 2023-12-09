import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  useLocalVideo,
  useLocalAudio,
  useLocalPeer,
  useRoom,
  usePeerIds,
  useLocalMedia,
  useDevices,
  useHuddle01,
} from "@huddle01/react/hooks";
import clsx from "clsx";
import { useMeetPersistStore } from "@/store/meet";

import { BasicIcons } from "@components/BasicIcons";
import SwitchDeviceMenu from "@components/SwitchDeviceMenu";
import VideoElem from "@components/Video";
import Image from "next/image";
import { redis2 } from "@utils/db";
import { AccessToken } from "@huddle01/server-sdk/auth";
import PeerData from "@components/PeerData";
import { InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useEnsName, useAccount, useEnsAvatar } from "wagmi";
import { normalize } from "viem/ens";
import { publicClient } from "@utils/client";

type IRoleEnum =
  | "host"
  | "coHost"
  | "moderator"
  | "speaker"
  | "listener"
  | "peer";

interface IPeer {
  peerId: string;
  role: IRoleEnum;
  mic: MediaStreamTrack | null;
  cam: MediaStreamTrack | null;
  displayName: string;
  avatarUrl: string;
}

interface roomData {
  roomId: string | null;
  partner: string | null;
}

const ShowPeers = dynamic(() => import("@components/ShowPeers"), {
  ssr: false,
});

export const getServerSideProps = async (context: any) => {
  const { roomId } = context.query;
  let userToken = null;

  if (roomId) {
    const accessToken = new AccessToken({
      apiKey: "a6a3e422a20a51efe49bdd8e4fd7b56b397a80a085715c8fca00898e1753",
      roomId: roomId as string,
      permissions: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: { cam: true, mic: true, screen: true },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
    });
    userToken = await accessToken.toJwt();
  }

  if (!userToken) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userToken,
      roomId,
    },
  };
};

const Home = ({
  userToken,
  roomId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { push, query } = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { leaveRoom } = useRoom();
  const { address } = useAccount();

  const { huddleClient } = useHuddle01();

  const { data: ens, isError } = useEnsName({
    address: address,
  });

  const getEnsAvatar = async () => {
    if (!ens) return null;
    const ensText = await publicClient.getEnsAvatar({
      name: normalize(ens as string),
    });
    return ensText;
  };

  const { peerIds } = usePeerIds();

  const { metadata, peerId, updateMetadata } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
  }>();

  const { track: cam, isVideoOn, enableVideo, disableVideo } = useLocalVideo();

  const { track: mic, isAudioOn, enableAudio, disableAudio } = useLocalAudio();

  const { setPreferredDevice: setCamPrefferedDevice } = useDevices({
    type: "cam",
  });

  const { setPreferredDevice: setAudioPrefferedDevice } = useDevices({
    type: "mic",
  });

  const { fetchStream } = useLocalMedia();

  const {
    isMicMuted,
    isCamOff,
    toggleMicMuted,
    toggleCamOff,
    videoDevice,
    audioInputDevice,
  } = useMeetPersistStore();

  const { joinRoom, state } = useRoom({
    onJoin: async () => {
      updateMetadata({
        displayName: ens || "Blinkr",
        avatarUrl: (await getEnsAvatar()) || "/4.png",
      });
    },
    onLeave: async () => {
      let getRecord = (await redis2.get(address as string)) as roomData;
      getRecord.partner = null;
      getRecord.roomId = null;
      await redis2.set(address as string, getRecord);
      window.location.href = "/";
    },
  });

  // useEffect(() => {
  //   huddleClient.room.on("peer-left", () => {
  //     window.location.href = "/";
  //   });
  // }, [huddleClient.room]);

  useEffect(() => {
    if (userToken) {
      joinRoom({
        roomId: roomId,
        token: userToken,
      });
    }
  }, [userToken]);

  useEffect(() => {
    setCamPrefferedDevice(videoDevice.deviceId);
    if (isVideoOn) {
      disableVideo();
      const changeVideo = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "cam",
        });
        if (stream) {
          enableVideo(stream);
        }
      };
      changeVideo();
    }
  }, [videoDevice]);

  useEffect(() => {
    setAudioPrefferedDevice(audioInputDevice.deviceId);
    if (isAudioOn) {
      disableAudio();
      const changeAudio = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "mic",
        });
        if (stream) {
          enableAudio(stream);
        }
      };
      changeAudio();
    }
  }, [audioInputDevice]);

  useEffect(() => {
    setAudioPrefferedDevice(audioInputDevice.deviceId);
  }, [audioInputDevice]);

  // useEventListener("room:me-left", async () => {
  //   let getRecord = (await redis2.get(
  //     publicKey?.toBase58() as string
  //   )) as roomData;
  //   getRecord.partner = null;
  //   getRecord.roomId = null;
  //   await redis2.set(publicKey?.toBase58() as string, getRecord);
  //   window.location.href = "/";
  // });

  // useEventListener("room:peer-left", () => {
  //   window.location.href = "/";
  // });

  return (
    <>
      {peerIds.length > 0 ? (
        <>
          {" "}
          <ShowPeers
            displayName={metadata?.displayName}
            avatarUrl={metadata?.avatarUrl}
            camTrack={cam}
            isVideoOn={isVideoOn}
          />
          <div className="flex items-center justify-center self-stretch">
            <div className="flex w-full flex-row items-center justify-center gap-8">
              {!isVideoOn ? (
                <button
                  type="button"
                  onClick={() => {
                    enableVideo();
                  }}
                  className="bg-brand-500 hover:bg-white/20 flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.inactive["cam"]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    disableVideo();
                  }}
                  className={clsx(
                    "flex h-10 w-10 items-center bg-gray-800 hover:bg-white/20 justify-center rounded-xl"
                  )}
                >
                  {BasicIcons.active["cam"]}
                </button>
              )}
              {!isAudioOn ? (
                <button
                  type="button"
                  onClick={() => {
                    enableAudio();
                  }}
                  className="bg-brand-500 hover:bg-white/20 flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  {BasicIcons.inactive["mic"]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    disableAudio();
                  }}
                  className={clsx(
                    "flex h-10 w-10 items-center bg-gray-800 hover:bg-white/20 justify-center rounded-xl"
                  )}
                >
                  {BasicIcons.active["mic"]}
                </button>
              )}
              <SwitchDeviceMenu />
              <button
                type="button"
                onClick={() => {
                  leaveRoom();
                  window.close();
                }}
                className="bg-red-500 hover:bg-red-500/50 flex h-10 w-10 items-center justify-center rounded-xl"
              >
                {BasicIcons.close}
              </button>
            </div>
          </div>{" "}
        </>
      ) : (
        <div className="flex flex-col h-screen w-screen justify-center items-center">
          <Image
            width={100}
            height={90}
            src={"/loader.gif"}
            className="w-1/2 aspect-auto"
            alt="loading"
          />
          <span className="text-2xl">
            Wait until your room partner joins ...
          </span>
        </div>
      )}
    </>
  );
};

export default Home;
