"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROLE_LABELS, USER_ROLES } from "@/config/roles";
import { useClientTable } from "@/hooks/useClientTable";
import { useUsersStore } from "@/store/usersStore";
import type { UserRole } from "@/types/auth";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company is required"),
  role: z.enum([
    "ADMIN",
    "OPERATIONS",
    "PROCUREMENT",
    "FINANCE",
    "LOGISTICS",
    "COMPLIANCE",
    "VIEWER",
    "SELLER",
  ]),
});

type FormValues = z.infer<typeof schema>;

export function UsersView() {
  const users = useUsersStore((s) => s.users);
  const addUser = useUsersStore((s) => s.addUser);
  const setUserStatus = useUsersStore((s) => s.setUserStatus);
  const [open, setOpen] = useState(false);
  const searchFields = useMemo(
    () => (row: (typeof users)[number]) => [
      row.name,
      row.email,
      row.company,
      row.role,
    ],
    [],
  );
  const table = useClientTable({ rows: users, searchFields });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "PetroTrade Operations",
      role: "VIEWER",
    },
  });

  return (
    <OperationsShell
      title="Customer"
      subtitle="Operations directory with frontend-only roles. Authentication is not enforced yet."
      actions={
        <Button className="bg-[#0B1F3A] hover:bg-[#122846]" onClick={() => setOpen(true)}>
          Invite customer
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search name, company or role"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "INVITED", "SUSPENDED"]}
        headers={[
          "Name",
          "Company",
          "Role",
          "Status",
          "KYC",
          "Last Active",
          "Actions",
        ]}
        emptyTitle="No customers found"
        emptyDescription="Invite a customer to populate this directory."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium text-slate-800">{row.name}</p>
              <p className="text-xs text-slate-400">{row.email}</p>
            </TableCell>
            <TableCell>{row.company}</TableCell>
            <TableCell>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {ROLE_LABELS[row.role]}
              </span>
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kyc} />
            </TableCell>
            <TableCell>{row.lastActive}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  const next = row.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
                  setUserStatus(row.id, next);
                  toast.success(`${row.name} marked ${next.toLowerCase()}`);
                }}
              >
                {row.status === "SUSPENDED" ? "Activate" : "Suspend"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite customer</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((values) => {
              addUser({
                id: `usr-${Date.now()}`,
                name: values.name,
                email: values.email,
                company: values.company,
                role: values.role as UserRole,
                status: "INVITED",
                kyc: "PENDING",
                lastActive: "Never",
              });
              toast.success("Invitation queued (mock)");
              form.reset();
              setOpen(false);
            })}
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...form.register("company")} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as FormValues["role"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1B6EF3] hover:bg-[#1558C8]">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OperationsShell>
  );
}
