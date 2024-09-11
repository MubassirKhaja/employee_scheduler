import React, { useState } from 'react';
import api from '../pages/api/config';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define validation schema using Zod
const schema = z.object({
  roleName: z.string().min(1, "Role name is required"),
});

export default function RoleAdd({ refreshData }) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/roles', { role_name: data.roleName });

      if (res.status === 201) {
        toast.success(`${data.roleName} added successfully`);
        reset();
        setIsOpen(false);
        if (refreshData) refreshData();
      }
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error("Error adding role");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setIsOpen(true)}>
          <span>Add Role</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">Role Name</Label>
              <div className="col-span-3">
                <Input id="roleName" {...register("roleName")} />
                {errors.roleName && <p className="text-red-600 text-sm mt-1">{errors.roleName.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isValid}>Add Role</Button>
            <DialogClose asChild />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
