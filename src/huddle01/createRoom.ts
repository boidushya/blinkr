const createRoom = async () => {
    const url = "https://api.huddle01.com/api/v1/create-room";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_HUDDLE01_API_KEY || "",
        },
        body: JSON.stringify({
            title: "NFT Omegle"
        }),
    });
    const data = await response.json();
    return data.data.roomId;
}

export default createRoom;