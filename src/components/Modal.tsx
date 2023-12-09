import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const Modal = ({ show, onClose, children }: any) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Delayed hide for smoother effect
            return () => clearTimeout(timer);
        }
    }, [show]);

    return isVisible &&
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50 ">
            <div className="bg-black p-4 rounded-lg border border-zinc-800 relative">
                <button title="close_modal" type='button' className="absolute top-2 right-2 flex h-6 w-6 p-1 items-center hover:bg-white/20 justify-center rounded-full" onClick={onClose}>
                    <XMarkIcon />
                </button>
                {children}
            </div>
        </div>
        ;
};

export default Modal;
