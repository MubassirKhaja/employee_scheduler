import { Button } from '@/components/ui/button';

import api from '../pages/api/config';
import { toast } from "sonner"
import { UserX } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "@/components/ui/dialog"

export default function EmployeeDelete(props) {
    return <Dialog>
        
        <DialogTrigger>
            <Button variant="destructive"  className="flex items-center space-x-2">
            <UserX   className="h-4 w-4" /> <span>  Delete</span></Button>
            
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete <b>{props.employee.name}</b>?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
        <DialogClose asChild>
            <Button type="submit" onClick={
                async () => {
                    try {
                        const employeeRes = await api.delete(`/employees/${props.employee.id}`);

                        if(employeeRes.status === 200){
                            props.refreshData();
                            toast.success(`${props.employee.name} deleted successfully`,{
                                duration: 3000,
                            })
                        }

                    } catch (error) {
                        console.error('Error deleting employee:', error);
                        toast.error("Error Deleting Employee")
                    } finally {
                        
                        console.log("to be filled later")

                    }
                    //   alert(props.empid)
                }
                }>Confirm</Button>
                </DialogClose>



        </DialogFooter>
        </DialogContent>
                              

                        
    </Dialog>
    

}


