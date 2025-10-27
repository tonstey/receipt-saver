import { useEffect, useState } from "react";

import { useUserState } from "../../../state/authcomp";

import { FaRegTrashAlt, FaCheck } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { baseItem, type Item } from "../../../lib/modelinterfaces";
import { getCookie } from "../../../lib/get_token";

export default function ReceiptItem({ receiptItem }: { receiptItem: Item }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const [isEditting, setIsEditting] = useState(false);

  const [editItem, setEditItem] = useState<Item>(receiptItem || baseItem);

  const refreshFunc = useUserState((state) => state.setRefreshPlaceholder);

  useEffect(() => {
    setEditItem(receiptItem);
  }, [receiptItem]);

  const onEdit = async () => {
    setError("");
    setStatus("loading");

    if (editItem.price < 0) {
      setEditItem((prev) => ({ ...prev, price: 0 }));
    }
    if (editItem.quantity < 0) {
      setEditItem((prev) => ({ ...prev, quantity: 0 }));
    }

    const token = getCookie("csrftoken");
    if (!token) {
      setError("Missing cookies.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/item/${receiptItem.item_uuid}/`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: JSON.stringify(editItem),
      },
    );

    setStatus("idle");

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setIsEditting(false);
    refreshFunc();
  };
  const onDelete = async () => {
    setError("");
    setStatus("loading");

    const token = getCookie("csrftoken");
    if (!token) {
      setError("Missing cookies.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/item/${receiptItem.item_uuid}/`,
      {
        method: "DELETE",
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

  const compareItem = useUserState((state) => state.setCompareItemActive);
  const displayItem = useUserState((state) => state.setDisplayItem);
  const onCompare = () => {
    displayItem(receiptItem);
    compareItem();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-100 p-4">
        {isEditting ? (
          <div className="flex flex-col gap-3">
            <input
              className="rounded-lg border border-gray-300 bg-white p-1 px-3 text-lg"
              value={editItem.name}
              onChange={(e) =>
                setEditItem((prev) => ({ ...prev, name: e.target.value }))
              }
            ></input>
            <div className="flex items-center gap-3">
              $
              <input
                className="rounded-lg border border-gray-300 bg-white p-1 text-end"
                type="number"
                min={0}
                value={editItem.price}
                onChange={(e) => {
                  const price = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(price)) {
                    setEditItem((prev) => ({
                      ...prev,
                      price: Number(price),
                    }));
                  }
                }}
              ></input>
              x
              <input
                className="rounded-lg border border-gray-300 bg-white p-1 text-end"
                type="number"
                min={1}
                step={1}
                value={editItem.quantity}
                onChange={(e) => {
                  const quantity = e.target.value;
                  if (/^\d*$/.test(quantity)) {
                    setEditItem((prev) => ({
                      ...prev,
                      quantity: Number(quantity),
                    }));
                  }
                }}
              ></input>{" "}
              items
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">{receiptItem.name}</h1>
            </div>
            <h1>
              ${receiptItem.price} x {receiptItem.quantity} = $
              {(receiptItem.price * receiptItem.quantity).toFixed(2)}
            </h1>
            <h1
              className="text-sm text-blue-600 hover:cursor-pointer hover:underline"
              onClick={() => onCompare()}
            >
              Click to compare prices
            </h1>
          </div>
        )}

        {status === "idle" ? (
          <div>
            <div className="flex gap-3">
              <button
                className={`rounded-lg bg-gray-300 p-2 text-2xl hover:cursor-pointer ${
                  isEditting ? "hover:bg-green-200" : "hover:bg-blue-200"
                }`}
                onClick={() => {
                  isEditting ? onEdit() : setIsEditting(true);
                }}
              >
                {isEditting ? <FaCheck /> : <MdOutlineModeEditOutline />}
              </button>
              <button
                className="rounded-lg bg-gray-300 p-2 text-2xl hover:cursor-pointer hover:bg-red-200"
                onClick={() => onDelete()}
              >
                <FaRegTrashAlt />
              </button>
            </div>
            {error ? <h1 className="text-red-600">{error}</h1> : ""}
          </div>
        ) : (
          <div>
            <DotLottieReact src="/loading.lottie" loop autoplay />
          </div>
        )}
      </div>
    </>
  );
}
