import React, { useEffect, useState } from 'react';
import api from '../pages/api/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ScheduleTable = () => {
  const [schedule, setSchedule] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedEmployee, setHighlightedEmployee] = useState(null);
  const [highlightedDay, setHighlightedDay] = useState(null);

  const fetchSchedule = async () => {
    try {
      const scheduleRes = await api.post('/schedule');
      const employeeRes = await api.get('/employees');
      setSchedule(scheduleRes.data.schedule);
      setEmployees(employeeRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule or employees:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const getEmployeeNameById = (employeeId) => {
    const employee = employees.find(emp => emp[0] === employeeId);
    return employee ? employee[1] : '';
  };

  const getEmployeeShiftsForDay = (employeeId, day) => {
    const daySchedule = schedule.filter(
      (shift) => shift.employee_id === employeeId && new Date(shift.date).getDay() === day
    );
    return daySchedule.map((shift) => {
      const startTime = new Date(`1970-01-01T${shift.start_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const endTime = new Date(`1970-01-01T${shift.end_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return `${startTime}-${endTime}`;
    }).join(', ');
  };

  const getTotalHoursForEmployee = (employeeId) => {
    const totalHours = schedule
      .filter((shift) => shift.employee_id === employeeId)
      .reduce((sum, shift) => {
        const startTime = new Date(`1970-01-01T${shift.start_time}`);
        const endTime = new Date(`1970-01-01T${shift.end_time}`);
        return sum + (endTime - startTime) / (1000 * 60 * 60);
      }, 0);
    return totalHours;
  };

  const getTotalHoursForDay = (day) => {
    const totalHours = schedule
      .filter((shift) => new Date(shift.date).getDay() === day)
      .reduce((sum, shift) => {
        const startTime = new Date(`1970-01-01T${shift.start_time}`);
        const endTime = new Date(`1970-01-01T${shift.end_time}`);
        return sum + (endTime - startTime) / (1000 * 60 * 60);
      }, 0);
    return totalHours;
  };

  const handleMouseEnter = (employeeId, day) => {
    setHighlightedEmployee(employeeId);
    setHighlightedDay(day);
  };

  const handleMouseLeave = () => {
    setHighlightedEmployee(null);
    setHighlightedDay(null);
  };

  const getWeekDates = () => {
    if (schedule.length === 0) return ['', ''];

    const startDate = new Date(schedule[0].date);
    const endDate = new Date(schedule[schedule.length - 1].date);

    const formatOptions = { month: 'short', day: 'numeric' };

    const formattedStartDate = startDate.toLocaleDateString(undefined, formatOptions);
    const formattedEndDate = endDate.toLocaleDateString(undefined, formatOptions);

    return [formattedStartDate, formattedEndDate];
  };

  const getDateForDay = (index) => {
    if (schedule.length === 0) return '';
    
    const firstDay = new Date(schedule[0].date);
    const dayDate = new Date(firstDay);
    dayDate.setDate(firstDay.getDate() + index);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    return dayDate.toLocaleDateString(undefined, formatOptions);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const [startWeekDate, endWeekDate] = getWeekDates();
  const uniqueEmployees = [...new Set(schedule.map(shift => shift.employee_id))];

  return (
    <Card className="w-full max-w-6xl mx-auto mt-10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Schedule</CardTitle>
          <span className="text-lg font-semibold">{startWeekDate} - {endWeekDate}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                {daysOfWeek.map((day, index) => (
                  <TableHead key={day} className={`${highlightedDay === index ? 'bg-yellow-200' : ''}`}>
                    <div>{day}</div>
                    <div className="text-sm text-gray-500">{getDateForDay(index)}</div>
                  </TableHead>
                ))}
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueEmployees.map((employeeId) => (
                <TableRow key={employeeId}>
                  <TableCell className={`${highlightedEmployee === employeeId ? 'bg-yellow-200' : ''}`}>
                    {getEmployeeNameById(employeeId)}
                  </TableCell>
                  {daysOfWeek.map((_, index) => (
                    <TableCell
                      key={index}
                      onMouseEnter={() => handleMouseEnter(employeeId, index)}
                      onMouseLeave={handleMouseLeave}
                      className={`${highlightedEmployee === employeeId && highlightedDay === index ? 'bg-blue-200' : ''}`}
                    >
                      {getEmployeeShiftsForDay(employeeId, index) || ""}
                    </TableCell>
                  ))}
                  <TableCell>{getTotalHoursForEmployee(employeeId)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Total Hours</TableCell>
                {daysOfWeek.map((_, index) => (
                  <TableCell key={index}>
                    {getTotalHoursForDay(index)}
                  </TableCell>
                ))}
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScheduleTable;
