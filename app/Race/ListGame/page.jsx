"use client";
import React, { Suspense } from "react";
import { ListGame } from "../components/ListGame";

export default function ListGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <div className="flex justify-center w-full">
        <div className="relative w-full max-w-md min-h-screen bg-black mx-auto">
          <ListGame />
        </div>
      </div>
    </Suspense>
  );
}
