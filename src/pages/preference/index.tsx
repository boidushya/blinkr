import { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { redis1, redis2 } from "@/utils/db";
import createRoom from "@/huddle01/createRoom";
import { useRouter } from "next/router";
import { useMachingStore } from "@store/matching";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { whyte } from "@fonts";
import { motion } from "framer-motion";

// interface NFTData {
//   name: string;
//   cached_image_uri: string;
//   collection: {
//     address: string;
//   };
// }

interface NFTData {
  name: string;
  image_uri: string;
  contract_address: string;
}

const About: NextPage = () => {
  const [selectedCardsList, setSelectedCardsList] = useState<string[]>([]);
  useEffect(() => {
    console.log(selectedCardsList);
  }, [selectedCardsList]);
  const { push } = useRouter();
  const { address } = useAccount();
  const addPreference = useMachingStore((state) => state.addPreference);
  const preferences = useMachingStore((state) => state.preferences);

  const [supportedTokenAddressesMetadata, setSupportedTokenAddressesMetadata] =
    useState<NFTData[]>();

  const handleCardSelect = (address: string) => {
    if (selectedCardsList.includes(address)) {
      setSelectedCardsList(
        selectedCardsList.filter((item) => item !== address)
      );
    } else {
      setSelectedCardsList([...selectedCardsList, address]);
    }
  };

  useEffect(() => {
    if (address) {
      console.log(address);
    }
  }, [address]);

  const handleSubmit = async () => {
    await mapRoomWithWallet();
    localStorage.setItem("preferences", JSON.stringify(selectedCardsList));
    for (const nftAddress of selectedCardsList) {
      const value = (await redis1.get(nftAddress)) as string[] | null;
      if (value && address) {
        if (!value.includes(address)) {
          await redis1.set(nftAddress, [...value, address]);
        }
      } else {
        await redis1.set(nftAddress, [address]);
      }
    }
    push("/loader");
  };

  const mapRoomWithWallet = async () => {
    const roomId = await createRoom();
    await redis1.set("foo", "bar");
    if (roomId && address) {
      await redis2.set(address, {
        roomId: roomId,
        partner: null,
      });
    }
  };

  useEffect(() => {
    console.log(preferences);
  }, [selectedCardsList, preferences]);

  useEffect(() => {
    const getNFT = async () => {
      console.log(address);
      const nfts = await fetch("/api/getMatchNFTs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      }).then((res) => res.json());
      setSupportedTokenAddressesMetadata(nfts.nfts);
    };
    getNFT();
  }, [address]);

  useEffect(() => {
    console.log(supportedTokenAddressesMetadata);
  }, [supportedTokenAddressesMetadata]);

  return (
    <div className="w-full h-full flex flex-col justify-evenly items-center">
      <div className="flex items-center flex-col gap-y-8">
        <div>
          <h1
            className={`font-medium text-gray-300 text-2xl ${whyte.className}`}
          >
            Discovered Collections
          </h1>
          <p className="text-gray-500">
            Curated list of NFTs from your address
          </p>
        </div>
        <div className="w-full h-full p-5 lg:px-40 flex flex-col md:flex-row gap-4 justify-center sm:gap-8 items-center">
          {supportedTokenAddressesMetadata?.map((item: NFTData) => {
            return (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={item.contract_address}
                className={`w-48 aspect-square flex flex-col justify-center items-center relative rounded-2xl border transition-colors ${
                  selectedCardsList.includes(item.contract_address)
                    ? "border-blue-500 shadow-3xl shadow-blue-700"
                    : "border-cardGray-700 hover:border-gray-700"
                } group bg-gray-500/20 backdrop-blur-md p-2 md:p-3 shadow-custom`}
                onClick={() => {
                  handleCardSelect(item.contract_address);
                  addPreference({
                    address: item.contract_address,
                    imageUri: item.image_uri,
                  });
                }}
              >
                <div className="relative w-full h-full overflow-clip rounded-xl">
                  <Image
                    src={item.image_uri}
                    alt="Logo"
                    loader={({ src }) => src}
                    fill
                    loading="lazy"
                    className="group-hover:scale-110 rounded-xl transition-transform duration-75 object-cover"
                  />
                </div>
                <span className="text-white text-sm md:text-xl font-bold pt-1 md:pt-2">
                  {item.name || "Unnamed NFT"}
                </span>
              </motion.div>
            );
          })}
          <div
            key={1}
            className={`w-48 aspect-square flex flex-col justify-center items-center relative rounded-2xl border transition-all ${
              selectedCardsList.includes(
                "0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11"
              )
                ? "border-blue-500 shadow-3xl shadow-blue-700"
                : "border-cardGray-700 hover:border-gray-700"
            } group bg-gray-500/20 backdrop-blur-md p-2 md:p-3 shadow-custom`}
            onClick={() => {
              handleCardSelect("0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11");
              addPreference({
                address: "0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11",
                imageUri:
                  "https://yt3.googleusercontent.com/Bh5YI5IVd53atK2LaTUudu3hqyrJNL8SSUa3DTWOlmtW69qcE9V5wZmAoNLrHKhNvltKB4rZDQ=s900-c-k-c0x00ffffff-no-rj",
              });
            }}
          >
            <div className="relative w-full h-full overflow-clip rounded-xl">
              <Image
                src={
                  "https://yt3.googleusercontent.com/Bh5YI5IVd53atK2LaTUudu3hqyrJNL8SSUa3DTWOlmtW69qcE9V5wZmAoNLrHKhNvltKB4rZDQ=s900-c-k-c0x00ffffff-no-rj"
                }
                alt="Logo"
                loader={({ src }) => src}
                fill
                loading="lazy"
                className="group-hover:scale-110 rounded-xl transition-transform duration-75 object-cover"
              />
            </div>
            <span className="text-white text-sm md:text-xl font-bold pt-1 md:pt-2">
              Dev DAO
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn group btn-indigo"
          disabled={selectedCardsList.length === 0}
          onClick={handleSubmit}
        >
          Start Searching
          <ArrowRightIcon
            strokeWidth={2.5}
            className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default About;
