import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '../ui/button';
import Link from "next/link";
import { House, Calendar, Contact } from "lucide-react";
const Header = () => {
  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Employee Scheduler</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
  
          <Button asChild variant="outline" className="flex items-center space-x-2">
            <Link href="/">
              <House  className="mr-2 h-5 w-5" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center space-x-2">
            <Link href="/schedule">
              <Calendar className="mr-2 h-5 w-5" />
              View Schedule
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center space-x-2">
            <Link href="/roles">
              <Contact className="mr-2 h-5 w-5" />
              Manage Roles
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
  
export default Header;
