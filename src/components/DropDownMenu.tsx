import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
// import { useTheme } from 'next-themes';
import type { FC } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { useMeetPersistStore } from '@/store/meet';

import DeviceList from './DeviceList';

type DropDownProps = {
  deviceType: 'audioInput' | 'video' | 'audioOutput';
};

const DropDownMenu: FC<DropDownProps> = ({ deviceType }) => {
  const {
    setVideoDevice,
    videoDevice,
    setAudioInputDevice,
    audioInputDevice,
    audioOutputDevice,
    setAudioOutputDevice
  } = useMeetPersistStore();

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    []
  );
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);

  // const { resolvedTheme } = useTheme();s

  useEffect(() => {
    const listMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(
          (device) => device.kind === 'audioinput'
        );
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        const audioOutputDevices = devices.filter(
          (device) => device.kind === 'audiooutput'
        );

        setAudioInputDevices(audioInputDevices);
        setAudioOutputDevices(audioOutputDevices);
        setVideoDevices(videoDevices);

        if (!videoDevice.deviceId) {
          setVideoDevice(videoDevices[0]);
        }
        if (!audioInputDevice.deviceId) {
          setAudioInputDevice(audioInputDevices[0]);
        }
        if (!audioOutputDevice.deviceId) {
          setAudioOutputDevice(audioOutputDevices[0]);
        }
      } catch (error) {
        console.error('Error listing media devices:', error);
      }
    };

    listMediaDevices();
  }, [audioInputDevice.deviceId, audioOutputDevice.deviceId, setAudioInputDevice, setAudioOutputDevice, setVideoDevice, videoDevice.deviceId]);

  return (
    <Menu as="div" className="w-full h-full relative inline-block text-left">
      <div>
        <Menu.Button
          className={clsx(
            'w-full h-full inline-flex bg-gray-950 text-gray-300 justify-start gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset'
          )}
        >
          {deviceType == 'video'
            ? videoDevice?.label
            : deviceType == 'audioInput'
              ? audioInputDevice?.label
              : audioOutputDevice?.label}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-white"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute right-0 z-10 mt-2 bg-gray-950 w-full origin-top-right rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
          )}
        >
          <div className="w-full h-full">
            {deviceType === 'video' && (
              <DeviceList
                devices={videoDevices}
                deviceType="video"
                setDevice={setVideoDevice}
              />
            )}
            {deviceType === 'audioInput' && (
              <DeviceList
                devices={audioInputDevices}
                deviceType="audio"
                setDevice={setAudioInputDevice}
              />
            )}
            {deviceType === 'audioOutput' && (
              <DeviceList
                devices={audioOutputDevices}
                deviceType="audio"
                setDevice={setAudioOutputDevice}
              />
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropDownMenu;
