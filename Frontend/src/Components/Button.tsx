// import React from 'react'
import {  Loader2 } from "lucide-react"
import { ReactElement } from "react"
type ButtonProps= {
    variant:"primary" | "secondary"  | "outline" ,
    size:"md" | "sm" | "lg",
    onClick:()=>void,
    text:string,
    className?:string,
    loading?:boolean
    icon?:ReactElement

}
const variantDef={
    "primary":"bg-[#8b5e3c] text-white hover:bg-[#a76d47] ",
    "secondary":"bg-[#b58863] text-white hover:bg-[#c69d74] ",
    "outline":"bg-[##8b5e3c] text-[#8b5e3c] hover:bg-[#f0d9b5]"
}
const defaultStyles="px-4 py-2 rounded-md cursor-pointer transition "
const sizeDef={
    "sm":"px-2 py-1 text-sm rounded-sm",
    "md":"px-4 py-2 text-base rounded-md",
    "lg":"px-6 py-4 text-lg rounded-lg"
}
export function Button(props: ButtonProps) {
    const {} = props

    return (
        <button className={`${variantDef[props.variant]} ${defaultStyles}
        ${sizeDef[props.size]}
        flex items-center justify-center gap-2
        disabled:opacity-60 disabled:cursor-not-allowed`} 
        onClick={props.onClick}
        >
        {props.loading && (
        <Loader2 className="animate-spin h-4 w-4" />
      )}
       {props.icon}
      
            {props.text}
        </button>
    )
}

