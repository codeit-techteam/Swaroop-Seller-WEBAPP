import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { suppliersMock, usersMock } from "@/mock/users";
import type { DirectoryUser, DirectoryUserStatus, Supplier } from "@/types/users";

interface UsersState {
  users: DirectoryUser[];
  suppliers: Supplier[];
  addUser: (user: DirectoryUser) => void;
  addSupplier: (supplier: Supplier) => void;
  setUserStatus: (id: string, status: DirectoryUserStatus) => void;
}

export const useUsersStore = create<UsersState>()(
  devtools(
    (set) => ({
      users: usersMock,
      suppliers: suppliersMock,
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),
      addSupplier: (supplier) =>
        set((state) => ({ suppliers: [supplier, ...state.suppliers] })),
      setUserStatus: (id, status) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, status } : user,
          ),
        })),
    }),
    { name: "users-store" },
  ),
);
