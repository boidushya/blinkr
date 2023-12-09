import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import styles from "./itsamatch.module.css";
import Realistic from "@components/Confetti";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { redis2 } from "@utils/db";
import { useMeetPersistStore } from "@store/meet";
import { useMachingStore } from "@store/matching";
import { useEnsName, useEnsAvatar, useAccount } from "wagmi";
import { publicClient } from "@utils/client";
import { normalize } from "viem/ens";

interface RoomsDataInterface {
  roomId: string;
  partner: string | null;
  pfp?: string;
}

const ItsAMatch = () => {
  const { push } = useRouter();
  const avatarUrl = useMeetPersistStore((state) => state.avatarUrl);
  const matchedAddress = useMachingStore((state) => state.matchedAddress);
  const roomId = useMachingStore((state) => state.matchedRoomId);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);

  const { address } = useAccount();

  const { data: myEns } = useEnsName({
    address: address as `0x${string}`,
  });

  const { data: partnerEns } = useEnsName({
    address: matchedAddress as `0x${string}`,
  });

  const getMyEnsAvatar = async () => {
    if (!myEns) return null;
    const ensText = await publicClient.getEnsAvatar({
      name: normalize(myEns as string),
    });
    setMyAvatar(ensText);
  };

  const getPartnerEnsAvatar = async () => {
    if (!partnerEns) return null;
    const ensText = await publicClient.getEnsAvatar({
      name: normalize(partnerEns as string),
    });
    setPartnerAvatar(ensText);
  };

  useEffect(() => {
    if (roomId) {
      if (myEns) {
        getMyEnsAvatar();
      }
      if (partnerEns) {
        getPartnerEnsAvatar();
      }
      setTimeout(() => {
        push(`/room/${roomId}`);
      }, 5000);
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col sm:flex-row justify-evenly items-center mt-32">
      <div className="w-[50vw] h-[70vh] rounded-lg">
        <div className="w-full h-full rounded-md flex flex-col items-center justify-evenly">
          <Realistic />
          <h1 className="text-white text-3xl font-bold">It&apos;s a Match!</h1>
          <div className="flex justify-evenly items-center w-full h-full relative">
            <div
              className={`w-1/3 aspect-square relative ${styles.animate_left_to_center}`}
            >
              <Image
                src={myAvatar ?? "/4.png"}
                loader={({ src }) => src}
                alt="itsamatch"
                fill
                className={`rounded-full bg-cover`}
              />
              <span className="w-full flex justify-center items-center absolute -bottom-8 text-xl font-semibold">
                {myEns ?? "Blinkr (You)"}
              </span>
            </div>
            <h1 className={`text-8xl font-thin ${styles.stamp}`}>X</h1>
            <div
              className={`w-1/3 aspect-square relative ${styles.animate_right_to_center}`}
            >
              <Image
                src={partnerAvatar ?? "/4.png"}
                loader={({ src }) => src}
                alt="itsamatch"
                fill
                className={`rounded-full bg-cover`}
              />
              <span className="w-full flex justify-center items-center absolute -bottom-8 text-xl font-semibold">
                {partnerEns ?? "Blinkr"}
              </span>
            </div>
          </div>
          {/* <button
            type="button"
            className="flex w-40 items-center justify-center rounded-md py-3 text-slate-100 bg-blue-600 group hover:bg-blue-900"
          >
            Start Meeting
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ItsAMatch;
