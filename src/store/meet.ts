import { create } from 'zustand';

interface MeetPersistState {
  audioInputDevice: MediaDeviceInfo;
  setAudioInputDevice: (audioInputDevice: MediaDeviceInfo) => void;
  videoDevice: MediaDeviceInfo;
  setVideoDevice: (videoDevice: MediaDeviceInfo) => void;
  audioOutputDevice: MediaDeviceInfo;
  setAudioOutputDevice: (audioOutputDevice: MediaDeviceInfo) => void;
  isMicMuted: boolean;
  toggleMicMuted: (isMicMuted: boolean) => void;
  isCamOff: boolean;
  toggleCamOff: (isCamOff: boolean) => void;
  avatarUrl: string;
  setAvatarUrl: (avatarUrl: string) => void;
  displayName: string;
  setDisplayName: (displayName: string) => void;
  isMatched: boolean;
  setIsMatched: (isMatched: boolean) => void;
}

export const useMeetPersistStore = create<MeetPersistState>((set) => ({
  audioInputDevice: {} as MediaDeviceInfo,
  setAudioInputDevice: (audioInputDevice) => set(() => ({ audioInputDevice })),
  videoDevice: {} as MediaDeviceInfo,
  setVideoDevice: (videoDevice) => set(() => ({ videoDevice })),
  audioOutputDevice: {} as MediaDeviceInfo,
  setAudioOutputDevice: (audioOutputDevice) =>
    set(() => ({ audioOutputDevice })),
  isMicMuted: true,
  toggleMicMuted: (isMicMuted) => set(() => ({ isMicMuted })),
  isCamOff: true,
  toggleCamOff: (isCamOff) => set(() => ({ isCamOff })),
  avatarUrl: '',
  setAvatarUrl: (avatarUrl) => set(() => ({ avatarUrl })),
  displayName: '',
  setDisplayName: (displayName) => set(() => ({ displayName })),
  isMatched: false,
  setIsMatched: (isMatched) => set(() => ({ isMatched })),
}));
