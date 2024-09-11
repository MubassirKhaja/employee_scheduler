import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import  Header from '../components/layout/Header';
import RoleView from '@/components/RoleView';
const RolePage = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <Header />
    <Toaster richColors />
    <RoleView />
  </div>
);

export default RolePage;
