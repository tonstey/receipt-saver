import { useEffect, useState } from "react";

import { Routes, Route } from "react-router";

import Sidebar from "./components/Sidebar/Sidebar";
import HomePage from "./pages/HomePage";
import ScanReceipt from "./pages/ScanReceipt";
import ReceiptPage from "./pages/ReceiptPage";

import { getCookie } from "./lib/get_token";
import { useUserState } from "./state/authcomp";
import { baseUser } from "./lib/modelinterfaces";
import { AiOutlineLoading } from "react-icons/ai";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(
    window.innerWidth >= 640,
  );
  const [status, setStatus] = useState<"idle" | "loading">("loading");

  const user = useUserState((state) => state.user);
  const setUser = useUserState((state) => state.setUser);

  useEffect(() => {
    const resetUser = async () => {
      const token = getCookie("csrftoken");
      if (!token) {
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/logout/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        },
      );

      if (!res.ok) {
        return;
      }
      setUser(baseUser);
    };
    setStatus("loading");

    if (user.username) {
      resetUser();
    }
    setStatus("loading");
  }, []);

  return (
    <>
      {status === "idle" ? (
        <div className="flex h-screen w-screen">
          <Sidebar
            isVisible={sidebarVisible}
            toggleSidebar={setSidebarVisible}
          />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route
                path="/"
                element={<HomePage toggleSidebar={setSidebarVisible} />}
              />
              <Route
                path="/scanreceipt"
                element={<ScanReceipt toggleSidebar={setSidebarVisible} />}
              />
              <Route
                path="/receipt/:receiptid"
                element={<ReceiptPage toggleSidebar={setSidebarVisible} />}
              />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
          <AiOutlineLoading className="animate-spin text-8xl text-blue-600" />
          <h1 className="font-semibold">Loading App, please wait.</h1>
          <h1>If app takes over 2 minutes to load, please try again later.</h1>
        </div>
      )}
    </>
  );
}

export default App;
