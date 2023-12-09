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
import { motion } from "framer-motion";
import { useMeetPersistStore } from "@/store/meet";

import { BasicIcons } from "@components/BasicIcons";
import SwitchDeviceMenu from "@components/SwitchDeviceMenu";
import VideoElem from "@components/Video";
import Image from "next/image";
import { redis2 } from "@utils/db";
import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import PeerData from "@components/PeerData";
import { InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { useEnsName, useAccount, useEnsAvatar } from "wagmi";
import { normalize } from "viem/ens";
import { publicClient } from "@utils/client";
import { access } from "fs";
import { whyte } from "@fonts";

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
      apiKey: process.env.NEXT_PUBLIC_HUDDLE01_API_KEY as string,
      roomId: roomId as string,
      role: Role.HOST,
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
    console.log(accessToken, userToken);
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
        displayName: ens || "Blinkr User",
        avatarUrl: (await getEnsAvatar()) || "/4.png",
      });
    },
    // onLeave: async () => {
    //   let getRecord = (await redis2.get(address as string)) as roomData;
    //   getRecord.partner = null;
    //   getRecord.roomId = null;
    //   await redis2.set(address as string, getRecord);
    //   window.location.href = "/";
    // },
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
            <div className="flex px-4 py-3 rounded-xl bg-white/10 flex-row items-center justify-center gap-4 backdrop-blur-sm shadow-custom">
              {!isVideoOn ? (
                <button
                  type="button"
                  onClick={() => {
                    enableVideo();
                  }}
                  className="bg-brand-500 hover:bg-white/20 shadow-custom bg-gray-500/50 flex h-10 w-10 items-center justify-center rounded-xl"
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
                    "flex h-10 w-10 items-center bg-indigo-500 hover:bg-white/20  justify-center rounded-xl"
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
                  className="bg-brand-500 hover:bg-white/20 flex h-10 w-10 shadow-custom bg-gray-500/50  items-center justify-center rounded-xl"
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
                    "flex h-10 w-10 items-center bg-indigo-500 hover:bg-white/20 justify-center rounded-xl"
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
                className="bg-red-500 hover:bg-red-500/50 shadow-custom flex h-10 w-10 items-center justify-center rounded-xl"
              >
                {BasicIcons.close}
              </button>
            </div>
          </div>{" "}
        </>
      ) : (
        <div className="h-full w-full grid place-items-center">
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-44 block bg-gray-700 animate-pulse rounded-lg p-4 pb-8 backdrop-blur-xl overflow-hidden">
              <div className="flex gap-2 w-full h-full">
                <motion.div
                  animate={{
                    y: [10, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="flex-1 h-full w-1/2 bg-gray-300/20 rounded-lg text-3xl grid place-items-center"
                >
                  😎 🫵
                </motion.div>
                <motion.div
                  animate={{
                    y: [10, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    delay: 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="flex-1 h-full w-1/2 bg-gray-300/20 rounded-lg grid place-items-center text-3xl"
                >
                  👋
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2">
                <motion.div
                  animate={{
                    y: [20, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="rounded-full h-4 w-4 bg-gray-300/20"
                />
                <motion.div
                  animate={{
                    y: [20, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    delay: 0.05,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="rounded-full h-4 w-4 bg-gray-300/20"
                />
                <motion.div
                  animate={{
                    y: [20, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    delay: 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="rounded-full h-4 w-4 bg-gray-300/20"
                />
                <motion.div
                  animate={{
                    y: [20, 0],
                    opacity: [0, 1],
                  }}
                  transition={{
                    delay: 0.15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                  className="rounded-full h-4 w-4 bg-red-300/20"
                />
              </div>
            </div>
            <h1 className="text-xl animate-pulse mt-2 text-center">
              Waiting for your{" "}
              <span className={`${whyte.className} font-semibold`}>
                supermatch{" "}
              </span>
              to join. Hang tight!
            </h1>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
