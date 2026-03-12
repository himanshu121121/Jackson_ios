import React, { Suspense } from "react";
import { TicketSuccess } from "../components/TicketSuccess";

export default function TicketSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
      <TicketSuccess />
    </Suspense>
  );
}
