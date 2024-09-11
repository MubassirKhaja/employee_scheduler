import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRoundPen } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from '../pages/api/config';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Define validation schema using Zod
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  priority: z.number().max(50, "Priority should not be greater than 50"),
  maxHoursPerWeek: z.number().min(0, "Max hours must be a positive number"),
  restrictedHours: z.number().min(0, "Restricted hours must be a positive number"),
}).superRefine((data, ctx) => {
  if (data.restrictedHours > data.maxHoursPerWeek) {
    ctx.addIssue({
      path: ["restrictedHours"],
      message: "Restricted hours should be less than or equal to max hours",
    });
  }
});

export default function EmployeeEdit(props) {
  const [roles, setRoles] = useState([]);
  const [initialRoles, setInitialRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Use React Hook Form
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: props.employee.name,
      priority: props.employee.priority,
      maxHoursPerWeek: props.employee.maxHoursPerWeek,
      restrictedHours: props.employee.restrictedHours,
    }
  });

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);

      const employeeRoles = await api.get(`/employees/${props.employee.id}/roles`);
      const roleIds = employeeRoles.data.map(role => role.id);
      console.log(roleIds)
      setInitialRoles(roleIds);
      setSelectedRoles(roleIds);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Check if roles have changed
      const rolesChanged = JSON.stringify(selectedRoles.sort()) !== JSON.stringify(initialRoles.sort());

      const employeeData = {
        ...data,
      };

      if (rolesChanged) {
        employeeData.roles = selectedRoles;
        const roleRes = await api.post(`/employees/${props.employee.id}/roles`, {'role_ids':selectedRoles});
      }

      const employeeRes = await api.put(`/employees/${props.employee.id}`, employeeData);
      
      if (employeeRes.status === 200) {
        props.refreshData();
        toast.success(`${props.employee.name} updated successfully`, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("Error updating Employee");
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoles((prevSelectedRoles) =>
      prevSelectedRoles.includes(roleId)
        ? prevSelectedRoles.filter((id) => id !== roleId)
        : [...prevSelectedRoles, roleId]
    );
  };



  const handleEditClick = () => {
    fetchRoles();

  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2" onClick={handleEditClick}>
          <UserRoundPen className="h-4 w-4" /> <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit employee</DialogTitle>
          <DialogDescription>
            Make changes to <b>{props.employee.name}</b>'s profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input id="name" {...register("name")} />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restrictedHours" className="text-right">Restricted Hours Per Week</Label>
              <div className="col-span-3">
                <Input
                  id="restrictedHours"
                  type="number"
                  {...register("restrictedHours", { valueAsNumber: true })}
                />
                {errors.restrictedHours && <p className="text-red-600 text-sm mt-1">{errors.restrictedHours.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Roles</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Select Roles</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label htmlFor={`role-${role.id}`}>{role.role_name}</Label>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" disabled={!isValid}>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
