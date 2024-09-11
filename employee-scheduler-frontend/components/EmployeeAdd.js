import { Button } from "@/components/ui/button";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from '../pages/api/config';

// Define validation schema using Zod
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  priority: z.number().max(50, "Priority should not be greater than 50"),
  maxHoursPerWeek: z.number().min(0, "Max hours must be a positive number"),
});

export default function EmployeeAdd(props) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', // Enables real-time validation and form state tracking
  });

  const onSubmit = async (data) => {
    try {
      const employeeRes = await api.post(`/employees`, data);
  
      if (employeeRes.status === 201) {
        props.refreshData();
        toast.success(`${data.name} added successfully`, {
          duration: 3000,
        });
        reset(); // Reset form after successful submission
        setIsOpen(false); // Close the dialog manually
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("Error adding Employee");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2" onClick={() => setIsOpen(true)}>
          <UserRoundPlus  className="h-5 w-5" />
          <span>Add Employee</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <div className="col-span-3">
                <Input
                  id="priority"
                  type="number"
                  {...register("priority", { valueAsNumber: true })}
                />
                {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxHoursPerWeek" className="text-right">Max Hours Per Week</Label>
              <div className="col-span-3">
                <Input
                  id="maxHoursPerWeek"
                  type="number"
                  {...register("maxHoursPerWeek", { valueAsNumber: true })}
                />
                {errors.maxHoursPerWeek && <p className="text-red-600 text-sm mt-1">{errors.maxHoursPerWeek.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isValid}>Add Employee</Button>
            <DialogClose asChild>

            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
