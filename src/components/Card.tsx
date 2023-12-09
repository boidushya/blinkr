import React from 'react'
import Image from 'next/image'

const Card = (props: any) => {
    const { content } = props;
    return (
        <div className="w-full md:w-1/2 h-fit py-6 px-5 rounded-xl flex flex-row items-center justify-evenly gap-x-4 border grayscale hover:grayscale-0 border-cardGray-700 hover:border-gray-700 sm:min-h-[220px] md:min-h-[180px] lg:min-h-min relative group"
        data-aos={content.aos} data-aos-anchor-placement="center-bottom">
            <div className='h-[100px] flex aspect-square absolute left-0 z-0'>
                <Image
                    src={content.hero}
                    alt="Logo"
                    fill={true}
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                />
            </div>
            <div className='z-10 pl-[100px]'>
                <div className="w-full flex flex-col gap-1 text-black dark:text-white">
                    <h3 className="font-semibold text-xl">
                        {content.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        {content.subTitle}
                    </p>
                </div>
            </div>

            {content.accent}
        </div>
    )
}

export default Card