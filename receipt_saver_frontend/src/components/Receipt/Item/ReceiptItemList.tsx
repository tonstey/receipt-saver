import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { getCookie } from "../../../lib/get_token";
import ReceiptItem from "./ReceiptItem";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useUserState } from "../../../state/authcomp";

export default function ReceiptItemList({ receiptID }: { receiptID: string }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const itemList = useUserState((state) => state.itemList);
  const setItemList = useUserState((state) => state.setItemList);

  const refreshVar = useUserState((state) => state.refreshPlaceholder);
  const refreshFunc = useUserState((state) => state.setRefreshPlaceholder);

  useEffect(() => {
    const getReceiptList = async () => {
      setError("");
      setStatus("loading");

      const token = getCookie("csrftoken");
      if (!token) {
        setError("Missing cookies.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getitems/${receiptID}/`,
        {
          credentials: "include",
          headers: {
            "X-CSRFToken": token,
          },
        },
      );

      setStatus("idle");

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }
      setItemList(data.data);
    };

    getReceiptList();
  }, [receiptID, refreshVar]);

  const addItem = async () => {
    setError("");
    setStatus("loading");

    const token = getCookie("csrftoken");
    if (!token) {
      setError("Missing cookies.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/createitem/${receiptID}/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": token,
        },
      },
    );

    setStatus("idle");

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }
    refreshFunc();
  };

  return (
    <>
      {status === "idle" ? (
        <div className="flex w-[60rem] flex-col gap-4 rounded-xl bg-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Items</h1>
            <button
              className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-lg text-white hover:cursor-pointer hover:bg-gray-700"
              onClick={() => addItem()}
            >
              <FiPlus />
              Add Item
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {itemList.length > 0 ? (
              itemList.map((item) => (
                <ReceiptItem key={item.item_uuid} receiptItem={item} />
              ))
            ) : (
              <h1 className="text-gray-600">
                There are no items from your receipt. Add one now!
              </h1>
            )}
          </div>
          {error ? <div className="text-red-600">{error}</div> : ""}
        </div>
      ) : (
        <div>
          <DotLottieReact src="/loading.lottie" loop autoplay />
        </div>
      )}
    </>
  );
}
