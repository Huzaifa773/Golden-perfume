// components/Pagination.tsx
"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePageClick = (page: number) => {
    onPageChange(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-neutral-800/80 mt-10">
      {/* Items count indicator */}
      <p className="text-xs text-neutral-400">
        Showing <span className="font-semibold text-gold">{startIdx}</span> to{" "}
        <span className="font-semibold text-gold">{endIdx}</span> of{" "}
        <span className="font-semibold text-ivory">{totalItems}</span> luxury fragrances
      </p>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {/* Prev Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-gold hover:border-gold/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <motion.button
              key={pageNum}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageClick(pageNum)}
              className={`h-9 w-9 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? "bg-gradient-to-r from-gold-600 via-gold to-gold-400 text-obsidian-950 font-bold shadow-gold-glow scale-105"
                  : "border border-neutral-800 text-neutral-300 hover:border-gold/50 hover:text-gold bg-obsidian-950/60"
              }`}
            >
              {pageNum}
            </motion.button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-gold hover:border-gold/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
