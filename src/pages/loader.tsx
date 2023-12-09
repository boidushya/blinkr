import { redis1, redis2 } from "@utils/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMachingStore } from "@store/matching";
import { useMeetPersistStore } from "@store/meet";
import Image from "next/image";
import { useAccount } from "wagmi";
import { whyte } from "@fonts";
import { motion } from "framer-motion";

interface PreferenceNFT {
  imageUri: string;
  address: string;
}

interface RoomsInterface {
  roomId: string;
  partner: string | null;
}

const Loader = () => {
  const {
    matchedAddress,
    setMatchedAddress,
    preferences: selectedPreferences,
    setMatchedRoomId,
    setMatchedPFP,
    matchedPFP,
  } = useMachingStore();
  const { address } = useAccount();
  const { push } = useRouter();
  const setAvatarUrl = useMeetPersistStore((state) => state.setAvatarUrl);

  const getPreferredMatchNFT = async (preferences: string[]) => {
    let maxPreference: string | null = null;
    let maxLength = 0;
    for (const preference of preferences) {
      const value = (await redis1.get(preference)) as string[] | null;
      if (value && value.length > maxLength) {
        maxPreference = preference;
        maxLength = value.length;
      }
    }
    return maxPreference;
  };

  const getMatchedAddress = async (preferences: string[]) => {
    const preferredMatchNFT = await getPreferredMatchNFT(preferences);
    // find imageUrl of the preferredMatchNFT from preferences
    const imageUrl = selectedPreferences.find(
      (item) => item.address === preferredMatchNFT
    )?.imageUri;
    if (imageUrl) {
      setAvatarUrl(imageUrl);
    }
    console.log("Preferred Match NFT Collection is", preferredMatchNFT);
    if (preferredMatchNFT) {
      let isMatch = false;
      let counter = 0;
      const startMatching = async () => {
        const checkIfRoomExists = (await redis2.get(
          address as string
        )) as RoomsInterface | null;

        if (
          checkIfRoomExists?.partner !== null &&
          checkIfRoomExists?.roomId !== null
        ) {
          setMatchedRoomId(checkIfRoomExists?.roomId as string);
          setMatchedAddress(checkIfRoomExists?.partner as string);
          push(`itsamatch`);
          isMatch = true;
          return;
        }

        let value = (await redis1.get(preferredMatchNFT)) as string[] | null;

        console.log("The addresses in the pool", value);

        const availablePartners = value?.filter((item) => item !== address);

        if (availablePartners) {
          const roomPartner = availablePartners[0];

          if (roomPartner) {
            isMatch = true;

            setMatchedAddress(roomPartner);

            console.log("we are matching with", roomPartner);

            // put all the other addresses back in the pool

            const restAddresses = availablePartners.slice(1);

            await redis1.set(preferredMatchNFT, restAddresses);

            const roomId = await redis2.get(address as string);

            setMatchedRoomId((roomId as RoomsInterface).roomId);

            await redis2.set(roomPartner, {
              roomId: (roomId as RoomsInterface).roomId,
              partner: address,
              pfp: imageUrl,
            });

            await redis2.set(address as string, {
              roomId: (roomId as RoomsInterface).roomId,
              partner: roomPartner,
              pfp: matchedPFP,
            });

            console.log("We are still here");

            if ((roomId as RoomsInterface).roomId !== null) {
              push(`itsamatch`);
              return;
            }
          }
        } else {
          console.log("No available partners");
        }
      };

      if (counter < 5) {
        setInterval(() => {
          if (!isMatch) {
            startMatching();
            counter++;
            console.log(`Testing for ${counter} times`);
          }
        }, 5000);
      } else {
        alert("No available partners");
        push("/");
      }

      return matchedAddress;
    }
  };

  useEffect(() => {
    const preferences = localStorage.getItem("preferences");
    if (preferences) {
      const parsedPreferences = JSON.parse(preferences);
      console.log("Parsed Preferences", parsedPreferences);
      console.log("Matched Address", matchedAddress);
      if (matchedAddress === "") {
        getMatchedAddress(parsedPreferences);
      }
    }
  }, []);

  return (
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
              className="flex-1 h-full w-1/2 bg-gray-300/20 rounded-lg"
            />
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
              className="flex-1 h-full w-1/2 bg-gray-300/20 rounded-lg"
            />
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
        <h1 className="text-xl animate-pulse mt-2">
          Looking for your{" "}
          <span className={`${whyte.className} font-semibold`}>supermatch</span>
        </h1>
      </div>
    </div>
  );
};

export default Loader;
