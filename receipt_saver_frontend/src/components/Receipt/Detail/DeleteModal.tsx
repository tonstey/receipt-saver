import { Dialog } from "radix-ui";
import { useState } from "react";
import { getCookie } from "../../../lib/get_token";
import { useNavigate } from "react-router";
import type { Receipt } from "../../../lib/modelinterfaces";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useUserState } from "../../../state/authcomp";

export default function DeleteModal({
  receipt,
  deleteModalStatus,
  setDeleteModal,
}: {
  receipt: Receipt;
  deleteModalStatus: boolean;
  setDeleteModal: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const refreshSidebar = useUserState((state) => state.setRefreshPlaceholder);
  const setUser = useUserState((state) => state.setUser);

  const onDelete = async () => {
    setError("");
    setStatus("loading");

    const token = getCookie("csrftoken");

    if (!token) {
      setError("Missing cookies.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/receipt/${
        receipt.receipt_uuid
      }/`,
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

    const resUser = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRFToken": token,
        },
      },
    );

    const dateUser = await resUser.json();

    if (!resUser.ok) {
      return;
    }
    setUser(dateUser);

    navigate("/");
    refreshSidebar();

    setDeleteModal(false);
  };

  return (
    <>
      <Dialog.Root open={deleteModalStatus} onOpenChange={setDeleteModal}>
        <Dialog.Portal>
          {/* Dark Background */}
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />

          {/* Modal Content */}
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
            {status === "idle" ? (
              <div className="flex flex-col items-center">
                <div className="flex w-full flex-col">
                  <Dialog.Title className="mb-[-2px] text-2xl font-bold">
                    Delete Confirmation
                  </Dialog.Title>
                  <Dialog.Description>
                    Are you sure you would like to delete this receipt?
                  </Dialog.Description>
                </div>
                <div className="mt-4 flex w-full justify-end gap-2">
                  <div
                    className="rounded-xl border border-gray-600 px-2 py-1 text-lg hover:cursor-pointer hover:bg-gray-200"
                    onClick={() => setDeleteModal(false)}
                  >
                    Cancel
                  </div>
                  <div
                    className="rounded-xl bg-red-500 px-4 py-1 text-lg text-white hover:cursor-pointer hover:bg-red-300"
                    onClick={() => onDelete()}
                  >
                    Delete Receipt
                  </div>
                </div>
                {error ? <div className="text-red-600">{error}</div> : ""}
              </div>
            ) : (
              <div>
                <DotLottieReact src="/loading.lottie" loop autoplay />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
