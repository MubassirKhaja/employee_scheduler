import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from '../pages/api/config';
import { AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

const RoleDelete = ({ roleId, roleName, refreshData }) => {
  const handleDelete = async () => {

    try {
      const response = await api.delete(`/roles/${roleId}`);
      if (response.status === 200) {
        toast.success(`Role "${roleName}" deleted successfully.`);
        refreshData(); // Refresh the role list
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Role is assigned to an employee and cannot be deleted.");
      } else if (error.response && error.response.status === 404) {
        toast.error("Role not found.");
      } else {
        toast.error("An error occurred while trying to delete the role.");
      }
      console.error('Error deleting role:', error);
    }
  };

 
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete Role
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            role from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
};

export default RoleDelete;
