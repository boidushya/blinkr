import type { NextApiRequest, NextApiResponse } from "next";
import { init, fetchQuery } from "@airstack/airstack-react";
import { useAccount } from "wagmi";
import { getQuery } from "./query";


init('14e63c5e8aa0648b2856bfcd50b7771a7');

interface APIData {
  success: boolean;
  message: string;
  data: any;
}

interface tokenAPIData {
  code: number;
  message: string;
  data: any;
  count: number;
}

interface NFTData {
  name: string;
  image_uri: string;
  contract_address: string;
}

const testingAddresses = [
  "0x8b0ba677CD4A9833128796fe3AD90Db2076596d1",
  "0x4aB65FEb7Dc1644Cabe45e00e918815D3acbFa0a",
];

const collections = [
  {
    collection_name: "Devs For Revolution",
    collection_address: "0x25ed58c027921E14D86380eA2646E3a1B5C55A8b",
    collection_chain_id: 1,
  },
  {
    collection_name: "DeGods",
    collection_address: "0x8821bee2ba0df28761afff119d66390d594cd280",
    collection_chain_id: 1,
  },
  {
    collection_name: "Beanz",
    collection_address: "0x306b1ea3ecdf94aB739F1910bbda052Ed4A9f949",
    collection_chain_id: 1,
  },
  {
    collection_name: "Azuki",
    collection_address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    collection_chain_id: 1,
  },
  {
    collection_name: "Milady Maker",
    collection_address: "0x5af0d9827e0c53e4799bb226655a1de152a425a5",
    collection_chain_id: 1,
  },
  {
    collection_name: "Pudgy Penguins",
    collection_address: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
    collection_chain_id: 1,
  },
  {
    collection_name: "Doodles",
    collection_address: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
    collection_chain_id: 1,
  },
  {
    collection_name: "Ethereum Name Service",
    collection_address: "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
    collection_chain_id: 1,
  },
  {
    collection_name: "Blinkr",
    collection_address: "0x676E56b7Ee7dd94E0AccfB78Ec569B9180844F94",
    collection_chain_id: 137,
  },
] as collectionData[];

interface collectionData {
  collection_name: string;
  collection_address: string;
  collection_chain_id: number;
}

const getNFTs = async(req: NextApiRequest, res: NextApiResponse)=>{
  const { walletAddress } = req.body;
   console.log(walletAddress);
  const query  = getQuery(walletAddress)

  const { data : nftData, error } = await fetchQuery(query);
  console.log("should get the nfts");
  console.log(nftData , error); 
  const allNfts: any[] = [];
//  console.log(nftData.Polygon.TokenBalance[0]);
  const nfts = nftData.Polygon.TokenBalance.map((val: any)  => allNfts.push(val.tokenAddress))
  // find nfts with collection address in collections array
  console.log(nfts);
  let filteredNFTs = allNfts?.filter((nft: NFTData) =>
    collections.find(
      (collection) => collection.collection_address === nft.contract_address
    )
  );

}

const matchNFTs = async (req: NextApiRequest, res: NextApiResponse) => {
  // const address = "2pgp7NaXWqycNJ7kaFF9uvs2MQ1hd3dG2Gh27VUUzxcA";
  const { walletAddress } = req.body;

  const chain_id = 1;
  // const url = "https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=" + walletAddress;
  const url = `https://api.chainbase.online/v1/account/nfts?chain_id=${chain_id}&address=${walletAddress}&page=1&limit=100`;

  const polygonurl = `https://api.chainbase.online/v1/account/nfts?chain_id=137&address=${walletAddress}&page=1&limit=100`;

  const response = await fetch(url, {
    headers: {
      "X-API-KEY": process.env.CHAINBASE_API_KEY ?? "",
    },
  });

  const polygonResponse = await fetch(polygonurl, {
    headers: {
      "X-API-KEY": process.env.CHAINBASE2_API_KEY ?? "",
    },
  });

  const polygonData = (await polygonResponse.json()) as APIData;

  const data = (await response.json()) as APIData;

  const nfts = data.data.concat(polygonData.data);

  // find nfts with collection address in collections array
  let filteredNFTs = nfts?.filter((nft: NFTData) =>
    collections.find(
      (collection) => collection.collection_address === nft.contract_address
    )
  );


  // check if user has 400 dev dao tokens
  const tokenURL = `https://api.chainbase.online/v1/account/tokens?chain_id=1&address=${walletAddress}&contract_address=0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11&limit=20&page=1`;

  const tokenResponse = await fetch(tokenURL, {
    headers: {
      "X-API-KEY": process.env.CHAINBASE_API_KEY ?? "",
    },
  });

  const tokenData = (await tokenResponse.json()) as tokenAPIData;
  // console.log("tokenData", tokenData);
  const tokenBalanceInHex = tokenData.data[0].balance;
  const tokenBalance = parseInt(tokenBalanceInHex, 16) / 10 ** 18;

  // //remove nfts with same collection address
  filteredNFTs = filteredNFTs?.filter(
    (nft: NFTData, index: number, self: NFTData[]) =>
      index ===
      self.findIndex((t) => t.contract_address === nft.contract_address)
  );

  if (!filteredNFTs) {
    return res.status(404).json({ message: "No NFTs found" });
  }
  return res
    .status(200)
    .json({ nfts: filteredNFTs, devdao: tokenBalance >= 400 ? true : false });
};

export default matchNFTs;
