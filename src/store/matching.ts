import { create } from "zustand";

interface PreferenceNFT {
  imageUri: string;
  address: string;
}

interface MatchingState {
  preferences: PreferenceNFT[];
  setPreferences: (preferences: PreferenceNFT[]) => void;
  addPreference: (preference: PreferenceNFT) => void;
  getPreference: (address: string) => PreferenceNFT | undefined;
  matchedAddress: string;
  setMatchedAddress: (matchedAddress: string) => void;
  matchedRoomId: string;
  setMatchedRoomId: (matchedRoomId: string) => void;
  matchedPFP: string;
  setMatchedPFP: (matchedPFP: string) => void;
  matchedCollection: string;
  setMatchedCollection: (matchedCollection: string) => void;
}

export const useMachingStore = create<MatchingState>((set, get) => ({
  preferences: [],
  setPreferences: (preferences: PreferenceNFT[]) =>
    set(() => ({ preferences })),
  // add prefernce without duplicates
  addPreference: (preference: PreferenceNFT) =>
    set((state) => {
      if (state.preferences.find((p) => p.address === preference.address)) {
        return state;
      }
      return { ...state, preferences: [...state.preferences, preference] };
    }),
  // get preference by address or undefined
  getPreference: (address: string) =>
    get().preferences.find((p) => p.address === address),
  matchedAddress: "",
  setMatchedAddress: (matchedAddress: string) =>
    set(() => ({ matchedAddress })),
  matchedRoomId: "",
  setMatchedRoomId: (matchedRoomId: string) => set(() => ({ matchedRoomId })),
  matchedPFP: "",
  setMatchedPFP: (matchedPFP: string) => set(() => ({ matchedPFP })),
  matchedCollection: "",
  setMatchedCollection: (matchedCollection: string) =>
    set(() => ({ matchedCollection })),
}));
