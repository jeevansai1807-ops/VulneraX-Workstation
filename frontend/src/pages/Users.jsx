import React from 'react';

export default function Users() {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col space-y-6 relative overflow-hidden">
      <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
      <p className="mt-1 text-muted-foreground">Manage platform access and permissions.</p>
      
      <div className="mt-8 p-6 bg-background/40 rounded-xl border border-border flex items-center justify-center h-64">
        <p className="text-muted-foreground font-medium">No users found or error loading list.</p>
      </div>
    </div>
  );
}
