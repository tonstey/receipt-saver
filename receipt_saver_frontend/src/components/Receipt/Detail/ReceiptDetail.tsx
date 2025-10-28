import { useState, useEffect, useRef } from "react";
import { useUserState } from "../../../state/authcomp";

import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";

import { getCookie } from "../../../lib/get_token";
import { stringToDate } from "../../../lib/date";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";

export default function ReceiptDetail({ receiptID }: { receiptID: string }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [openDelete, setOpenDelete] = useState(false);

  const receipt = useUserState((state) => state.displayReceipt);
  const setReceipt = useUserState((state) => state.setDisplayReceipt);
  const refresh = useUserState((state) => state.refreshPlaceholder);

  const loadingRef = useRef<any>(null);

  useEffect(() => {
    const getReceipt = async () => {
      setError("");
      setStatus("loading");

      const token = getCookie("csrftoken");
      if (!token) {
        setError("Missing cookies.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/receipt/${receiptID}/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRFTOKEN": token,
          },
        },
      );

      setStatus("idle");

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setReceipt(data);
    };

    getReceipt();
  }, [receiptID, refresh]);

  return (
    <>
      <div className="mt-16 flex w-[60rem] flex-col items-center justify-between rounded-lg bg-white p-6">
        <DeleteModal
          receipt={receipt}
          deleteModalStatus={openDelete}
          setDeleteModal={setOpenDelete}
        />
        <EditModal
          receipt={receipt}
          editModalStatus={openEdit}
          setEditModal={setOpenEdit}
        />

        {status === "idle" ? (
          <div className="w-full">
            <div className="flex justify-between">
              <h1 className="w-full text-3xl font-bold">{receipt.name}</h1>
              <div className="flex gap-2">
                <h1
                  className="rounded-2xl bg-indigo-400 p-2 text-3xl text-white hover:cursor-pointer hover:bg-indigo-200"
                  onClick={() => setOpenEdit(true)}
                >
                  <MdOutlineModeEditOutline />
                </h1>
                <h1
                  className="rounded-2xl bg-red-400 p-2 text-3xl text-white hover:cursor-pointer hover:bg-red-200"
                  onClick={() => setOpenDelete(true)}
                >
                  <FaRegTrashAlt />
                </h1>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-lg text-gray-600">
                  Store: {receipt.store}
                </h1>
                <h1 className="text-lg text-gray-600">
                  Address: {receipt.address}
                </h1>
                <h1 className="flex gap-2 text-lg text-gray-600">
                  Date:{" "}
                  <div className="flex">
                    {stringToDate(receipt.date_purchased)}
                  </div>
                </h1>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">
                  Subtotal: ${receipt.subtotal.toFixed(2)}
                </h1>
                <h1 className="text-xl font-semibold">
                  {`Tax: $${receipt.tax.toFixed(2)} (${receipt.taxpercent.toFixed(3)}%)`}
                </h1>
                <hr></hr>
                <h1 className="text-2xl font-semibold">
                  Total: ${receipt.total.toFixed(2)}
                </h1>
                <h1 className="text-md text-gray-600">
                  {receipt.num_items} items
                </h1>
              </div>
            </div>
            <div></div>
          </div>
        ) : (
          <div>
            <DotLottieReact
              src="/loading.lottie"
              ref={loadingRef}
              loop
              autoplay
            />
          </div>
        )}

        {error ? <div className="text-red-600">{error}</div> : ""}
      </div>
    </>
  );
}
