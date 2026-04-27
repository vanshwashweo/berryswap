"use client";

import { useBlockchainContext } from "@/context/BlockchainContext";

export const useBlockchain = () => {
  return useBlockchainContext();
};
