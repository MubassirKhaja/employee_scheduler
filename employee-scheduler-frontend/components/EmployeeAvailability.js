import React, { useEffect, useState } from 'react';
import api from '../pages/api/config';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from "sonner";
import { CalendarCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const EmployeeAvailability = (props) => {
  const [availability, setAvailability] = useState([]);
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: '',
    start_time: '',
    end_time: ''
  });

  // const fetchEmpAvailability = (() => {
  //   const fetchAvailability = async () => {
  //     try {
  //       const res = await api.get(`/employees/${props.employee.id}/availability`);
  //       setAvailability(res.data);
  //     } catch (error) {
  //       console.error('Error fetching availability:', error);
  //     }
  //   };
  //   fetchAvailability();
  // }, [props.employee.id]);



  const fetchAvailability = async () => {
    try {
      const empAvailabilityRes = await api.get(`/employees/${props.employee.id}/availability`);
      setAvailability(empAvailabilityRes.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleAddAvailability = async () => {
    try {
      await api.post(`/employees/${props.employee.id}/availability`, newAvailability);
      toast.success('Availability added successfully');
      setNewAvailability({ day_of_week: '', start_time: '', end_time: '' });
      const res = await api.get(`/employees/${props.employee.id}/availability`);
      setAvailability(res.data);
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error('Error adding availability');
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    try {
      await api.delete(`/employees/${props.employee.id}/availability/${availabilityId}`);
      toast.success('Availability deleted successfully');
      const res = await api.get(`/employees/${props.employee.id}/availability`);
      setAvailability(res.data);
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Error deleting availability');
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const renderAvailabilityCards = () => {
    const groupedAvailability = daysOfWeek
      .map(day => ({
        day: day.label,
        intervals: availability
          .filter(item => item.day_of_week === day.value)
          .map(item => ({
            id: item.id, // Ensure you have an `id` field in your API response
            interval: `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
          }))
      }))
      .filter(group => group.intervals.length > 0);

    return groupedAvailability.map((group, index) => (
      <Card key={index} className="mb-4 p-2 max-w-xs">
        <CardContent>
          <h3 className="text-md font-semibold mb-2">{group.day}</h3>
          {group.intervals.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="text-sm">{item.interval}</p>
              <Button
                onClick={() => handleDeleteAvailability(item.id)}
                variant="ghost"
                className="ml-2 text-red-400"
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    ));
  };



  const handleEditClick = () => {
    fetchAvailability();
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="secondary" className="flex items-center space-x-2" onClick={handleEditClick}>
        <CalendarCheck   className="h-4 w-4" /> <span>  Availability</span></Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle><b>{props.employee.name}</b>'s Availability</DialogTitle>
        </DialogHeader>
        <CardContent>
          {availability.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Availability:</h3>
              <div className="flex flex-wrap gap-4">
                {renderAvailabilityCards()}
              </div>
            </div>
          ) : (
            <p>No availability found. Please add availability.</p>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Add New Availability</h3>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day_of_week" className="text-right">Day of Week</Label>
                <div className="col-span-3">
                  <Select
                    value={newAvailability.day_of_week}
                    onValueChange={(value) => setNewAvailability({ ...newAvailability, day_of_week: value })}
                  >
                    <SelectTrigger>
                      <span>{daysOfWeek.find(day => day.value === parseInt(newAvailability.day_of_week))?.label || 'Select Day'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_time" className="text-right">Start Time</Label>
                <div className="col-span-3">
                  <Input
                    id="start_time"
                    type="time"
                    value={newAvailability.start_time}
                    onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_time" className="text-right">End Time</Label>
                <div className="col-span-3">
                  <Input
                    id="end_time"
                    type="time"
                    value={newAvailability.end_time}
                    onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddAvailability} className="mt-4">
                Add Availability
              </Button>
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAvailability;
