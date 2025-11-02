import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import SidebarReceipt from "./SidebarReceipt";
import Authentication from "../User/Authentication";
import { useUserState } from "../../state/authcomp.tsx";
import { getCookie } from "../../lib/get_token.ts";
import { getReceipts } from "../../lib/fetch.ts";
import { baseUser } from "../../lib/modelinterfaces.ts";

import { IoCameraOutline } from "react-icons/io5";
import { LuReceipt } from "react-icons/lu";
import { AiOutlineLoading } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

export default function Sidebar({
  isVisible,
  toggleSidebar,
}: {
  isVisible: boolean;
  toggleSidebar: Function;
}) {
  const [limit, setLimit] = useState(10);

  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const user = useUserState((state) => state.user);
  const setUser = useUserState((state) => state.setUser);
  const openAuth = useUserState((state) => state.setAuthenticateActive);
  const receiptList = useUserState((state) => state.receiptList);
  const setReceiptList = useUserState((state) => state.setReceiptList);
  const refreshReceipts = useUserState((state) => state.refreshPlaceholder);

  const navigate = useNavigate();

  useEffect(() => {
    const getUserReceipts = async () => {
      setError("");
      setStatus("loading");
      const executeFunction = await getReceipts(limit);
      if (executeFunction?.error) {
        setError(executeFunction.error);
      }
      setReceiptList(executeFunction?.data);
      setStatus("idle");
    };
    if (user.username) {
      getUserReceipts();
    } else {
      setError("Please log in.");
    }
  }, [user, limit, refreshReceipts]);

  const attemptNavigation = (user: any) => {
    if (user.username) {
      toggleSidebar(false);
      navigate("/scanreceipt");
    } else {
      openAuth();
    }
  };

  const onLogout = async () => {
    const token = getCookie("csrftoken");
    if (!token) {
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    });

    if (!res.ok) {
      alert(`Server Error: ${res.status}`);
      return;
    }
    setUser(baseUser);
    setLimit(10);
    setReceiptList([]);
    navigate("");
  };

  return (
    <>
      <div
        className={`relative flex h-full w-full flex-col items-center gap-4 bg-white p-4 transition-all duration-500 ease-in sm:w-68 ${
          isVisible ? "" : "hidden"
        }`}
      >
        <RxCross2
          className="absolute right-2 rounded-lg text-3xl font-bold hover:cursor-pointer hover:bg-gray-300 sm:hidden"
          onClick={() => toggleSidebar(false)}
        />
        <Authentication />
        <div className="flex items-center gap-2">
          <LuReceipt className="text-2xl text-blue-600" />
          <h1
            className="text-xl font-semibold hover:cursor-pointer"
            onClick={() => navigate("/")}
          >
            CartCompass
          </h1>
        </div>

        <hr className="h-0.25 w-full border-none bg-gray-400"></hr>
        {user.username ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full justify-between">
              <h1>Welcome {user.username}!</h1>
              <h1
                className="text-sm underline hover:cursor-pointer hover:text-gray-600"
                onClick={() => onLogout()}
              >
                Logout
              </h1>
            </div>
            <hr className="h-0.25 w-full border-none bg-gray-400"></hr>
          </div>
        ) : (
          ""
        )}

        <div className="relative w-full">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white hover:cursor-pointer"
            onClick={() => attemptNavigation(user)}
          >
            <IoCameraOutline className="text-lg" />
            Scan New Receipt
          </button>
        </div>
        <hr className="h-0.25 w-full border-none bg-gray-400"></hr>

        <div className="flex h-full w-full flex-col items-center gap-2 overflow-hidden">
          <h1 className="w-full text-sm font-semibold">Recent Receipts</h1>

          {status === "loading" ? (
            <div>
              <AiOutlineLoading className="animate-spin text-6xl text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : receiptList.length > 0 ? (
            <div className="flex h-full w-full flex-col items-center gap-2 overflow-y-auto">
              {receiptList.map((item: any) => (
                <SidebarReceipt
                  key={item.receipt_uuid}
                  receipt={item}
                  toggleSidebar={toggleSidebar}
                />
              ))}
              {limit < user?.num_receipts ? (
                <div
                  className="rounded-lg border border-gray-400 px-2 hover:cursor-pointer hover:bg-gray-200"
                  onClick={() => setLimit((prev) => prev + 5)}
                >
                  Show More
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            <div className="w-full text-center">
              There are no receipts saved. Scan your receipt above!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
