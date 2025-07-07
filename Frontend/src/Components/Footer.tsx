import { Github, Twitter } from "lucide-react";

export function Footer(){
   return(
   <>
   <footer className="bg-[#BCAAA4] text-[#5D4037] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <span className="font-serif font-bold mb-4 md:mb-0">🛡️🏆👥Chess Masters</span>
          <div className="flex gap-4">
            <Github className="h-8 w-8 hover:text-[#BF360C] transition cursor-pointer"  />
            <Twitter className="h-8 w-8 hover:text-[#BF360C] transition" />
            
          </div>
        </div>
        <p className="text-center text-[#5D4037]/60 mt-6 text-sm">
          &copy; {new Date().getFullYear()} Chess Masters. All rights reserved.
        </p>
      </footer>
   </>
   )
}