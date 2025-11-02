import { useState } from "react";
import { Dialog, Tabs } from "radix-ui";

import Signup from "./Signup";
import Login from "./Login";

import { useUserState } from "../../state/authcomp";

import { IoClose } from "react-icons/io5";

export default function Authentication() {
  const [focus, setFocus] = useState("login");

  const isOpen = useUserState((state: any) => state.authenticateActive);
  const setIsOpen = useUserState((state: any) => state.setAuthenticateActive);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          {/* Dark Background */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />

          {/* Modal Content */}
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Dialog.Title className="mb-[-8px] text-2xl font-bold">
                  Welcome to ReceiptTracker
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-gray-500">
                  Sign in to your account or create a new one to get started.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-lg bg-gray-200 p-1 text-2xl hover:cursor-pointer hover:bg-gray-300">
                  <IoClose />
                </button>
              </Dialog.Close>
            </div>

            <Tabs.Root value={focus} onValueChange={setFocus}>
              <Tabs.List className="my-5 flex rounded-lg bg-gray-200 p-1">
                <Tabs.Trigger
                  className={`flex-1 rounded-l-lg py-2 font-semibold transition-all duration-200 ease-in hover:cursor-pointer ${focus === "login" ? "bg-white" : ""}`}
                  value="login"
                >
                  Login
                </Tabs.Trigger>
                <Tabs.Trigger
                  className={`flex-1 rounded-r-lg py-2 font-semibold transition-all duration-200 ease-in hover:cursor-pointer ${focus === "signup" ? "bg-white" : ""}`}
                  value="signup"
                >
                  Sign Up
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="signup">
                {" "}
                <Signup setFocus={setFocus} />{" "}
              </Tabs.Content>
              <Tabs.Content value="login">
                {" "}
                <Login />{" "}
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
