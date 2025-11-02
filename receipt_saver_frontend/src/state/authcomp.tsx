import { create } from "zustand";
import { baseUser, baseReceipt, baseItem } from "../lib/modelinterfaces";
import type { User, Receipt, Item } from "../lib/modelinterfaces";

type UserState = {
  authenticateActive: boolean;
  setAuthenticateActive: () => void;

  user: User;
  setUser: (inputUser: User) => void;

  token: string;
  setToken: (inputToken: string) => void;

  refreshPlaceholder: number;
  setRefreshPlaceholder: () => void;

  receiptList: Array<any>;
  setReceiptList: (inputList: Array<any>) => void;

  displayReceipt: Receipt;
  setDisplayReceipt: (inputReceipt: Receipt) => void;
  resetDisplayReceipt: () => void;

  compareItemActive: boolean;
  setCompareItemActive: () => void;

  itemList: Array<any>;
  setItemList: (inputList: Array<any>) => void;

  displayItem: Item;
  setDisplayItem: (inputItem: Item) => void;
};

export const useUserState = create<UserState>((set) => ({
  authenticateActive: false,
  setAuthenticateActive: () =>
    set((state) => ({ authenticateActive: !state.authenticateActive })),

  user: baseUser,
  setUser: (inputUser) => set((state) => ({ ...state.user, user: inputUser })),

  token: "",
  setToken: (inputToken) => set(() => ({ token: inputToken })),

  refreshPlaceholder: 0,
  setRefreshPlaceholder: () =>
    set((state) => ({ refreshPlaceholder: state.refreshPlaceholder + 1 })),
  receiptList: [],
  setReceiptList: (inputList) => set(() => ({ receiptList: inputList })),

  displayReceipt: baseReceipt,
  setDisplayReceipt: (inputReceipt) =>
    set(() => ({ displayReceipt: inputReceipt })),
  resetDisplayReceipt: () => set(() => ({ displayReceipt: baseReceipt })),

  compareItemActive: false,
  setCompareItemActive: () =>
    set((state) => ({ compareItemActive: !state.compareItemActive })),

  itemList: [],
  setItemList: (inputList) => set(() => ({ itemList: inputList })),

  displayItem: baseItem,
  setDisplayItem: (inputItem) => set(() => ({ displayItem: inputItem })),
}));
