import { FaGithub } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

export function Footer(){
   return(
   <>
   <footer className="bg-[#7a574a] text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <span className="font-bold mb-4 text-3xl  md:mb-0">👥Chess Masters</span>
          <div className="flex gap-4 items-center">
           <a 
              href="https://github.com/dhruvinjs/ChessWs" 
              target="_blank" 
              rel="noopener noreferrer"
              title="github"
            >
              <FaGithub className="h-8 w-8 hover:text-[#BF360C] transition cursor-pointer" />
            </a>
            <BsTwitterX className="h-6 w-8 hover:text-[#BF360C] transition" />
            
          </div>
        </div>
        <p className="text-center text-white mt-6 text-sm">
          &copy; {new Date().getFullYear()} Chess Masters. All rights reserved.
        </p>
      </footer>
   </>
   )
}