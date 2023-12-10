import { init, useQuery } from "@airstack/airstack-react";
import { getQuery } from "@api/query";
import { useEffect } from "react";
import { useAccount } from "wagmi";
// Replace with GraphQL Query

interface multiBlockchainData {
  ethereum: any,
  polygon: any,
  base: any
}

init(process.env.NEXT_PUBLIC_AIRSTACK_KEY as string);
const Test = () => {
  const { address, isConnected } = useAccount();
  const query  = getQuery(address as string)
  const { data, loading, error } = useQuery(query);
  
  console.log(data);



  useEffect(()=>{
   console.log(process.env.NEXT_PUBLIC_AIRSTACK_KEY);
 },[])
  if (data) {
    return <p className={`bg-reg-500`}>Data: {JSON.stringify(data)}</p>;
  }

  if (loading) {
    return <p className={`bg-reg-500`}>Loading...</p>;
  }

  if (error) {
    return <p className={`bg-reg-500`}>Error: {error.message}</p>;
  }
};
export default Test