import { FaRegUserCircle } from "react-icons/fa" ;
import React from "react"
export const OpponentCard=React.memo(({oppId} : {oppId:string | null})=>(
    <div className="mb-2 flex-row space-x-2">
        <FaRegUserCircle className="size-5 md:size-8"/>
        <span className="font-semibold text-sm md:text-base text-[#6D4C41]">{oppId}</span>
    </div>
))