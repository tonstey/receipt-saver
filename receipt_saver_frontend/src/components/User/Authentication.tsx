import { Dialog, Tabs } from "radix-ui";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import Signup from "./Signup";
import Login from "./Login";

import { useUserState } from "../../state/authcomp";


export default function Authentication( ) {
  const [focus, setFocus] = useState('login')

  const isOpen = useUserState((state:any)=>state.authenticateActive)
  const setIsOpen = useUserState((state:any)=>state.setAuthenticateActive)

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen} >
        
        <Dialog.Portal>
          {/* Dark Background */}
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40" />

          {/* Modal Content */}
          <Dialog.Content
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white p-6 rounded-lg shadow-lg w-[32rem] z-50"
          > 
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <Dialog.Title className="text-2xl font-bold mb-[-8px]">Welcome to ReceiptTracker</Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-gray-500">Sign in to your account or create a new one to get started.</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                  <button className="bg-gray-200 p-1 text-2xl rounded-lg hover:bg-gray-300 hover:cursor-pointer">
                    <IoClose/>
                  </button>
              </Dialog.Close>
            </div>

            <Tabs.Root value={focus} onValueChange={setFocus}>
              <Tabs.List className="flex bg-gray-200 p-1 rounded-lg my-5" >
                <Tabs.Trigger className={`flex-1 py-2 font-semibold rounded-l-lg transition-all ease-in duration-200 hover:cursor-pointer ${focus==='login' ? 'bg-white':''}`} value="login" >Login</Tabs.Trigger>
                <Tabs.Trigger className={`flex-1 py-2 font-semibold rounded-r-lg transition-all ease-in duration-200 hover:cursor-pointer ${focus==='signup' ? 'bg-white':''}`} value="signup" >Sign Up</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="signup" > <Signup setFocus={setFocus}/> </Tabs.Content>
              <Tabs.Content value="login" >  <Login />  </Tabs.Content>
            </Tabs.Root>
            
          </Dialog.Content>
        </Dialog.Portal>

      </Dialog.Root>
    </>
  )
}