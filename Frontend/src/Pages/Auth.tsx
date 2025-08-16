import { useRef,useState } from "react";
import { Button, Card, DropDown, Input } from "../Components";
import { ChessLevel, useUserStore } from "../stores/useUserStore";
import {toast} from "react-hot-toast"
export function Auth(){
    const {login,loading,success,message,error,register}=useUserStore()
    const passwordRef=useRef<HTMLInputElement>(null)
    const [isSignup,setIsSignUp]=useState(false)
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const [selectedLevel, setSelectedLevel] = useState<ChessLevel | "">("");
    const confirmPasswordref=useRef<HTMLInputElement>(null);
    const [confirmPasswordError,showConfirmPasswordError]=useState(false)

    const handleLogin=()=>{
        const email=emailRef.current?.value
        const password=passwordRef.current?.value
        if (!email || !password) {
        toast.error("Please enter both username and password.");
        return;
    }
            login(email,password)
            if(success){
                toast.success(message || "Login successfull")
            }        
            else if(error){
                toast.error(error)
            }

        }

        const handleSignIn=()=>{
        const email=emailRef.current?.value
        const name=nameRef.current?.value
        const chessLevel = selectedLevel;
        const password=passwordRef.current?.value
        const confirmPassword=confirmPasswordref.current?.value
        if (!email || !name || !chessLevel || !password || !confirmPassword ){
        toast.error("Please enter all fields.");
        return
        }
         
        if(confirmPassword != password ){
            showConfirmPasswordError(true)
            return
        }
        register(name,email,password,chessLevel)

        if(success){
                toast.success(message || "Register successfull")
            }        
            else if(error){
                toast.error(error)
            }
    }


    return(
    <>
 <div className="min-h-screen flex justify-center items-center bg-[#6D4C41]">
        {/* <div className="space-x-4"> */}

        <Card
        title={isSignup ? "Register to ChessArena" : "Login To ChessArena"}
        className="text-center text-[#5D4037]"
        subtitle={
            isSignup
            ? "Join the battle of minds! Fill in your details to start."
            : "Welcome back! Please enter your credentials"
        }
        >
  <div className="space-y-4">
    {isSignup ? (
      <>
        <Input
          type="text"
          placeholder="Enter Username"
          className="bg-black"
          required
          minLength={3}
          maxLength={20}
          inputRef={nameRef}
        />
        <Input
          type="email"
          placeholder="Enter Email"
          className="bg-black"
          required
          minLength={3}
          maxLength={50}
          inputRef={emailRef}
        />
        <Input
          type="password"
          placeholder="Enter Password"
          className="bg-black"
          required
          minLength={6}
          maxLength={100}
          inputRef={passwordRef}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          className="bg-black"
          required
          minLength={6}
          maxLength={100}
          inputRef={confirmPasswordref}
        />
        {confirmPasswordError && 
          <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>
        }
        <DropDown label={selectedLevel || "Select Chess Level"}
        align="start"
        items={[
            { label: "BEGINNER", onClick: () => setSelectedLevel("BEGINNER") },
            { label: "INTERMEDIATE", onClick: () => setSelectedLevel("INTERMEDIATE") },
            { label: "PRO", onClick: () => setSelectedLevel("PRO") },
        ]}
          />


        <div className="flex justify-center">
          <Button
            onClick={handleSignIn}
            size="sm"
            text="Register"
            variant="primary"
            loading={loading}
          />
        </div>
      </>
    ) : (
      <>
        <Input
          type="email"
          placeholder="Enter Email"
          className="bg-black"
          required
          minLength={3}
          maxLength={50}
          inputRef={emailRef}
        />
        <Input
          type="password"
          placeholder="Enter Password"
          className="bg-black"
          required
          minLength={6}
          maxLength={100}
          inputRef={passwordRef}
        />
        <div className="flex justify-center">
          <Button
            onClick={handleLogin}
            size="md"
            text="Login"
            variant="primary"
            loading={loading}
          />
        </div>
      </>
    )}

    <div className="text-center text-md text-amber-950 mt-4 ">
      {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Button variant="outline" onClick={()=>setIsSignUp(!isSignup)} size="sm" text={isSignup ? "Login" : "Register"}/>
    </div>

    <div className="mt-6 text-center text-xs text-[#5D4037]">
      By signing in, you agree to our Terms of Service and Privacy Policy.
    </div>
  </div>
</Card>

    </div>
    </>
)
}