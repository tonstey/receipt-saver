import { useEffect, useState } from "react";

import { useUserState } from "../../../state/authcomp";
import { get_token, getCookie } from "../../../lib/get_token";
import { baseItem, type Item } from "../../../lib/modelinterfaces";

import { AiOutlineLoading } from "react-icons/ai";
import { FaRegTrashAlt, FaCheck } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";

export default function ReceiptItem({ receiptItem }: { receiptItem: Item }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const [isEditting, setIsEditting] = useState(false);

  const [editItem, setEditItem] = useState<Item>(receiptItem || baseItem);

  const refreshFunc = useUserState((state) => state.setRefreshPlaceholder);
  const compareItem = useUserState((state) => state.setCompareItemActive);
  const displayItem = useUserState((state) => state.setDisplayItem);

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

    let token = getCookie("csrftoken");
    if (!token) {
      token = await get_token();
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/item/${receiptItem.item_uuid}/`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token ?? "",
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

    let token = getCookie("csrftoken");
    if (!token) {
      token = await get_token();
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/item/${receiptItem.item_uuid}/`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": token ?? "",
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

  const onCompare = () => {
    displayItem(receiptItem);
    compareItem();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-gray-100 p-4 md:flex-row">
        {isEditting ? (
          <div className="flex w-[16rem] flex-1 flex-col items-center gap-3 md:items-start">
            <input
              className="w-full rounded-lg border border-gray-300 bg-white p-1 px-3 text-lg"
              value={editItem.name}
              onChange={(e) =>
                setEditItem((prev) => ({ ...prev, name: e.target.value }))
              }
            ></input>
            <div className="flex w-full items-center gap-3">
              $
              <input
                className="w-[4rem] rounded-lg border border-gray-300 bg-white p-1 text-end md:w-1/3"
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
                className="w-[4rem] rounded-lg border border-gray-300 bg-white p-1 text-end md:w-1/3"
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
          <div className="text-center md:text-start">
            <div className="flex items-center gap-4">
              <h1 className="w-full text-lg font-semibold">
                {receiptItem.name}
              </h1>
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
            <div className="flex w-fit gap-3">
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
            <AiOutlineLoading className="w-full animate-spin text-5xl font-extrabold text-blue-600" />
          </div>
        )}
      </div>
    </>
  );
}
