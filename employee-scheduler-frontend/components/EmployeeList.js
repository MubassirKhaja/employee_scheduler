import React, { useEffect, useState } from 'react';
import api from '../pages/api/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area"

import Link from "next/link";

import EmployeeDelete from "./EmployeeDelete";
import EmployeeEdit from "./EmployeeEdit";
import EmployeeAdd from "./EmployeeAdd";
import EmployeeAvailability from "./EmployeeAvailability";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees-with-roles');
      const data = res.data;

      // Sort employees by name alphabetically
      const sortedEmployees = data.sort((a, b) => a.name.localeCompare(b.name));
      setEmployees(sortedEmployees);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getPriorityColor = (priority) => {
    const priorityNum = Number(priority);
    if (priorityNum <= 2) return "bg-green-500";
    if (priorityNum <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Users className="mr-2" />
            Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Max Hours/Week</TableHead>
                <TableHead>Restricted Hours/Week</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Skeleton rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto mt-10">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Users className="mr-2" />
            Employees
          </CardTitle>

        </div>
          <Input 
            type="text" 
            placeholder="Search by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-60 w-64"
          />

        <EmployeeAdd refreshData={fetchEmployees}/>
      </CardHeader>
      <CardContent>
        {filteredEmployees.length > 0 ? (
          <Table>
            <ScrollArea className="h-[60vh]   ">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead> {/* Add this header for Roles */}
                <TableHead>Priority</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Max Hours/Week</TableHead>
                <TableHead>Restricted Hours/Week</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
  {employee.roles && employee.roles.length > 0 ? (
    employee.roles.map((role, index) => (
      <Badge key={index} className="mr-1">
        {role}
      </Badge>
    ))
  ) : (
    <span>No Roles Assigned</span>
  )}
</TableCell>

                  <TableCell>
                    <Badge className={`${getPriorityColor(employee.priority)} text-white`}>
                      {employee.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.maxHoursPerWeek}</TableCell>
                  <TableCell>{employee.restrictedHours}</TableCell>
                  <TableCell>
                    <EmployeeEdit employee={employee} refreshData={fetchEmployees} />
                  </TableCell>
                  <TableCell>
                    <EmployeeDelete employee={employee} refreshData={fetchEmployees} />
                  </TableCell>
                  <TableCell>
                    <EmployeeAvailability employee={employee} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </ScrollArea>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No employees found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
