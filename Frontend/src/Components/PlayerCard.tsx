import { FaRegUserCircle } from "react-icons/fa" ;
import React from "react";

export const PlayerCard=React.memo(({playerId}:{playerId:string| null})=>(
    <div className="flex-row space-x-2 mb-2 ">
        <FaRegUserCircle className="size-5 md:size-8" />
        <span className="font-semibold text-sm md:text-base text-[#6D4C41]">
            {playerId}
        </span>
    </div>
))