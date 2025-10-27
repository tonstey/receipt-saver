import { Dialog } from "radix-ui";
import { IoClose, IoSearch } from "react-icons/io5";

import { useUserState } from "../../../state/authcomp";

export default function CompareModal() {
  const isOpen = useUserState((state) => state.compareItemActive);
  const setIsOpen = useUserState((state) => state.setCompareItemActive);

  const receipt = useUserState((state) => state.displayReceipt);
  const receiptItem = useUserState((state) => state.displayItem);

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
                  Comparing {receiptItem.name}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-gray-500">
                  Current price at {receipt.store}: ${receiptItem.price}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="rounded-lg bg-gray-200 p-1 text-2xl hover:cursor-pointer hover:bg-gray-300">
                  <IoClose />
                </button>
              </Dialog.Close>
            </div>

            <div className="my-4 flex justify-between gap-4">
              <input
                className="flex-1 rounded-lg border px-2 py-1"
                type="text"
                placeholder="Enter store name"
              ></input>
              <button className="flex items-center gap-2 rounded-lg bg-black px-3 py-1 text-white hover:cursor-pointer hover:bg-gray-700">
                <IoSearch />
                Search
              </button>
            </div>

            {Object.keys(receiptItem.stores_checked).length > 0 ? (
              <div></div>
            ) : (
              ""
            )}
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">Results</h1>
              <div></div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
