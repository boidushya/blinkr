import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useTheme } from 'next-themes';
import type { FC } from 'react';
import { useState } from 'react';

import { BasicIcons } from './BasicIcons';
import DropDownMenu from './DropDownMenu';
import Modal from './Modal';

const SwitchDeviceMenu: FC = () => {
  const { resolvedTheme } = useTheme();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button
        type='button'
        title='switch_device'
        onClick={() => setShowSettings(!showSettings)}
        className='flex h-10 w-10 items-center hover:bg-white/20 justify-center rounded-xl'>
        <AdjustmentsHorizontalIcon className="text-brand-500 flex h-6 w-6 items-center justify-center rounded-xl" />
      </button>
      <Modal show={showSettings} onClose={() => setShowSettings(false)}>
        <div
          className={clsx(
            resolvedTheme == 'dark' ? 'bg-gray-900' : 'bg-brand-100',
            'rounded-xl p-5'
          )}
        >
          <div className="flex items-center gap-2 self-stretch text-slate-500">
            <div className='w-10 h-fit flex justify-start items-center text-white'>
              {BasicIcons.active['cam']}
            </div>
            <div className="flex h-fit items-center justify-between self-stretch">
              <DropDownMenu deviceType={'video'} />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 self-stretch text-slate-500">
            <div className='w-10 h-fit flex justify-start items-center'>
              {BasicIcons.active['mic']}
            </div>
            <div className="flex h-fit items-center justify-between self-stretch">
              <DropDownMenu deviceType={'audioInput'} />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 self-stretch text-slate-500">
            <div className='w-10 h-fit flex justify-start items-center'>
              {BasicIcons.speaker}
            </div>
            <div className="flex h-fit items-center justify-between self-stretch">
              <DropDownMenu deviceType={'audioOutput'} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SwitchDeviceMenu;
