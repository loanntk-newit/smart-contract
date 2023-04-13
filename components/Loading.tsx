import React from 'react'

const Loading = () => {
  let circleCommonClasses = 'h-2.5 w-2.5 bg-current   rounded-full'

  return (
    <div className='absolute w-full h-full bg-white bg-opacity-80 inset-0 flex justify-center items-center z-[1000]'>
      <div className="flex">
        <div className={`${circleCommonClasses} mr-1 animate-bounce`}></div>
        <div className={`${circleCommonClasses} mr-1 animate-bounce200`}></div>
        <div className={`${circleCommonClasses} animate-bounce400`}></div>
      </div>
    </div>
  )
}

export default Loading
