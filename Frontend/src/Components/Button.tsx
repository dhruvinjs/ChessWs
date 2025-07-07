// import React from 'react'
import {  Loader2 } from "lucide-react"
import { ReactElement } from "react"
type ButtonProps= {
    variant:"primary" | "secondary"  | "outline"  | "link",
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
    "outline":"bg-[##8b5e3c] text-[#8b5e3c] hover:bg-[#f0d9b5]",
    "link":"text-[#5D4037] cursor-pointer underline hover:cursor-pointer hover:text-[#9c6b5c] px-0 py-0 bg-transparent"
}
const defaultStyles="rounded-md cursor-pointer transition disabled:cursor-not-allowed "
const sizeDef={
    "sm":"px-2 py-1 text-sm rounded-sm",
    "md":"px-4 py-2 text-base rounded-md",
    "lg":"px-6 py-4 text-lg rounded-lg"
}
export function Button(props: ButtonProps) {
    const { variant, size, onClick, text, className, loading, icon} = props
    const padding = variant==="link" ? "" :sizeDef[size]
    const layout= variant  ==="link" ? "font-semibold" :"flex justify-center items-center gap-2"
     return (
        <button className={`${variantDef[variant]} 
        ${defaultStyles}
        ${padding}
        ${className || ""}
        ${layout}
        `} 
        onClick={onClick}
        >
        {loading && <Loader2 className="animate-spin h-4 w-4" />}
        {icon}
        {text}
        </button>
    )
}

