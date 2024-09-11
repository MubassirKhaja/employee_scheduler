import React from 'react';
import EmployeeList from '../components/EmployeeList';

import { Toaster } from "@/components/ui/sonner";

import  Header from '../components/layout/Header';
const HomePage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <Header />
    <Toaster richColors />
    <EmployeeList />
  </div>
);

export default HomePage;
