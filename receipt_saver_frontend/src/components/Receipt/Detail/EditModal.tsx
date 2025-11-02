import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { getCookie } from "../../../lib/get_token";

import { useUserState } from "../../../state/authcomp";
import type { Receipt } from "../../../lib/modelinterfaces";
import { currentDateString } from "../../../lib/date";
import { AiOutlineLoading } from "react-icons/ai";

export default function EditModal({
  receipt,
  editModalStatus,
  setEditModal,
}: {
  receipt: Receipt;
  editModalStatus: boolean;
  setEditModal: (open: boolean) => void;
}) {
  const [editReceipt, setEditReceipt] = useState<Receipt>(receipt);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const refreshReceipt = useUserState((state) => state.setRefreshPlaceholder);

  useEffect(() => {
    setEditReceipt(receipt);
  }, [receipt]);

  const onEdit = async () => {
    setError("");
    setStatus("loading");

    const token = getCookie("csrftoken");
    if (!token) {
      setError("Missing cookies.");
      return;
    }

    editReceipt.last_updated = currentDateString();

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/receipt/${
        receipt.receipt_uuid
      }/`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: JSON.stringify(editReceipt),
      },
    );

    setStatus("idle");
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    refreshReceipt();
    setEditModal(false);
  };

  const onClose = () => {
    setEditReceipt(receipt);
    setEditModal(false);
  };

  return (
    <>
      <Dialog.Root open={editModalStatus} onOpenChange={setEditModal}>
        <Dialog.Portal>
          {/* Dark Background */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />

          {/* Modal Content */}
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex flex-col items-center justify-between">
              <div className="flex w-full flex-col">
                <Dialog.Title className="mb-[-8px] text-2xl font-bold">
                  Edit Receipt
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm">
                  Update the name of the receipt, the store name, the store
                  address, and the receipt date.
                </Dialog.Description>
              </div>
              {status === "idle" ? (
                <div className="mt-6 flex w-full flex-col gap-2">
                  <div>
                    <h1 className="font-semibold">Receipt Name</h1>
                    <input
                      className="w-full rounded-lg border border-gray-400 px-2 py-1 text-lg"
                      type="text"
                      value={editReceipt.name}
                      onChange={(e) =>
                        setEditReceipt((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    ></input>
                  </div>

                  <div>
                    <h1 className="font-semibold">Store Name</h1>
                    <input
                      className="w-full rounded-lg border border-gray-400 px-2 py-1 text-lg"
                      type="text"
                      value={editReceipt.store}
                      onChange={(e) =>
                        setEditReceipt((prev) => ({
                          ...prev,
                          store: e.target.value,
                        }))
                      }
                    ></input>
                  </div>

                  <div>
                    <h1 className="font-semibold">Store Address</h1>
                    <input
                      className="w-full rounded-lg border border-gray-400 px-2 py-1 text-lg"
                      type="text"
                      value={editReceipt.address}
                      onChange={(e) =>
                        setEditReceipt((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    ></input>
                  </div>

                  <div>
                    <h1 className="font-semibold">Date Purchased</h1>
                    <input
                      className="w-full rounded-lg border border-gray-400 px-2 py-1 text-lg"
                      type="date"
                      value={editReceipt.date_purchased.slice(0, 10)}
                      onChange={(e) =>
                        setEditReceipt((prev) => ({
                          ...prev,
                          date_purchased: e.target.value + "T04:14:53.987274Z",
                        }))
                      }
                    ></input>
                  </div>
                  <div>
                    <h1 className="font-semibold">Tax Percentage (%)</h1>
                    <input
                      className="w-32 rounded-lg border border-gray-400 px-2 py-1 text-lg"
                      type="number"
                      min={0}
                      value={editReceipt.taxpercent}
                      onChange={(e) => {
                        const percent = Number(e.target.value);
                        if (percent >= 0) {
                          setEditReceipt((prev) => ({
                            ...prev,
                            taxpercent: percent,
                          }));
                        }
                      }}
                    ></input>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <div
                      className="w-fit rounded-lg bg-black px-2 py-0.5 text-lg text-white hover:cursor-pointer hover:bg-gray-700"
                      onClick={() => onEdit()}
                    >
                      Confirm
                    </div>
                    <div
                      className="w-fit rounded-lg border border-gray-500 px-2 py-0.5 text-lg hover:cursor-pointer hover:bg-gray-200"
                      onClick={() => onClose()}
                    >
                      Cancel
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <AiOutlineLoading className="w-full animate-spin text-6xl text-blue-600" />
                </div>
              )}
              {error ? <div className="text-red-600">{error}</div> : ""}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
