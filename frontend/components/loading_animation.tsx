import React from 'react'

const Loading_animation = () => {
    return (
        <div className="absolute flex justify-center items-center m-10">
            <div className="absolute text-2xl font-bold text-purple-500">Loading...</div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    )
}

export default Loading_animation