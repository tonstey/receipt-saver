import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import Select from "react-select";

import { useUserState } from "../../../state/authcomp";

import { IoClose } from "react-icons/io5";
import { getCookie } from "../../../lib/get_token";

export default function CompareModal() {
  const [selectedStore, setSelectedStore] = useState<string | undefined>();
  const [comparisonData, setComparisonData] = useState();

  const [updateStatus, setUpdateStatus] = useState<"idle" | "loading">("idle");
  const [compareStatus, setCompareStatus] = useState<"idle" | "loading">(
    "idle",
  );

  const [error, setError] = useState("");

  const isOpen = useUserState((state) => state.compareItemActive);
  const setIsOpen = useUserState((state) => state.setCompareItemActive);

  const receipt = useUserState((state) => state.displayReceipt);
  const receiptItem = useUserState((state) => state.displayItem);

  type Option = { value: string; label: string };
  const stores: Option[] = [
    {
      value: "target",
      label: "Target",
    },
    {
      value: "walmart",
      label: "Walmart",
    },
    {
      value: "aldi",
      label: "Aldi",
    },
    {
      value: "albertsons",
      label: "Albertsons",
    },
    {
      value: "staterbros",
      label: "Stater Bros.",
    },
    {
      value: "sprouts",
      label: "Sprouts",
    },
  ];

  const saveBestPrice = async () => {
    if (selectedStore && compareStatus === "idle") {
      setUpdateStatus("loading");
      setError("");

      const token = getCookie("csrftoken");
      if (!token) {
        setError("Missing cookies.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/items/${receiptItem.item_uuid}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            ...receiptItem,
            stores_checked: { [selectedStore]: "hii" },
          }),
        },
      );

      setUpdateStatus("idle");

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }
    }
  };

  useEffect(() => {
    if (selectedStore && receiptItem.name && updateStatus === "idle") {
      console.log(selectedStore);
      const getStoreResults = async () => {
        setCompareStatus("loading");
        setError("");

        const token = getCookie("csrftoken");
        if (!token) {
          setError("Missing cookies.");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/scrapestore?store=${selectedStore}&item=${receiptItem.name}`,
          {
            credentials: "include",
            headers: {
              "X-CSRFToken": token,
            },
          },
        );

        setCompareStatus("idle");

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        setComparisonData(data);
      };
      getStoreResults();
    }
  }, [selectedStore]);

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

            <Select
              options={stores}
              value={stores.find((option) => option.value === selectedStore)}
              placeholder="Please select a store to compare prices"
              onChange={(selected) => setSelectedStore(selected?.value)}
              classNames={{
                control: () =>
                  "bg-gray-100 border-none rounded-md my-2 hover:shadow-sm",
                menu: () => "bg-white shadow-lg rounded-md",
                option: ({ isSelected, isFocused }) =>
                  `px-3 py-2 cursor-pointer ${
                    isSelected
                      ? "bg-black text-white"
                      : isFocused
                        ? "bg-gray-100"
                        : "bg-white"
                  }`,
              }}
            />

            {error ? <div className="text-red-600">{error}</div> : ""}

            {Object.keys(receiptItem.stores_checked).length > 0 ? (
              Object.entries(receiptItem.stores_checked).map((entry) => (
                <div key={entry[0]} onClick={() => saveBestPrice()}>
                  {entry[0]}
                  {updateStatus === "loading" ? "" : ""}
                </div>
              ))
            ) : (
              <div>
                You haven't compared this product with any other stores yet!
                Choose a store above!
              </div>
            )}
            {compareStatus === "loading" ? (
              ""
            ) : comparisonData ? (
              <div className="flex flex-col gap-2">
                <h1 className="text-lg font-semibold">Results</h1>
                <div></div>
              </div>
            ) : (
              ""
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
