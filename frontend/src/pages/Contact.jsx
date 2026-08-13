import React from 'react';

export default function Contact() {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col space-y-6 relative overflow-hidden">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-1 text-muted-foreground">Get in touch with the VulneraX team.</p>
      
      <div className="mt-8 p-6 bg-background/40 rounded-xl border border-border">
        <p className="text-muted-foreground font-medium">Contact options are currently unavailable in this demo.</p>
      </div>
    </div>
  );
}
