"use client";

import Swal, { SweetAlertIcon } from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";

/**
 * Maison Charcoal Haute Parfumerie
 * Unified Luxury SweetAlert2 Notification Suite
 */

const baseCustomClass = {
  popup: "vip-swal",
  confirmButton: "btn-primary !px-5 !py-2.5",
  cancelButton: "btn-secondary !px-5 !py-2.5",
};

/**
 * Display a luxury success alert modal
 */
export async function alertSuccess(title: string, message: string = "", confirmButtonText: string = "Understood") {
  return Swal.fire({
    title,
    html: message ? `<p class="text-neutral-300 text-sm mt-1">${message}</p>` : undefined,
    icon: "success",
    customClass: baseCustomClass,
    buttonsStyling: false,
    confirmButtonText,
    showClass: {
      popup: "animate__animated animate__fadeInDown animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp animate__faster",
    },
  });
}

/**
 * Display a luxury error alert modal
 */
export async function alertError(title: string, message: string = "", confirmButtonText: string = "Dismiss") {
  return Swal.fire({
    title,
    html: message ? `<p class="text-neutral-300 text-sm mt-1">${message}</p>` : undefined,
    icon: "error",
    customClass: baseCustomClass,
    buttonsStyling: false,
    confirmButtonText,
  });
}

/**
 * Display a luxury warning alert modal
 */
export async function alertWarning(title: string, message: string = "", confirmButtonText: string = "Acknowledge") {
  return Swal.fire({
    title,
    html: message ? `<p class="text-neutral-300 text-sm mt-1">${message}</p>` : undefined,
    icon: "warning",
    customClass: baseCustomClass,
    buttonsStyling: false,
    confirmButtonText,
  });
}

/**
 * Display a luxury info alert modal
 */
export async function alertInfo(title: string, message: string = "", confirmButtonText: string = "Got it") {
  return Swal.fire({
    title,
    html: message ? `<p class="text-neutral-300 text-sm mt-1">${message}</p>` : undefined,
    icon: "info",
    customClass: baseCustomClass,
    buttonsStyling: false,
    confirmButtonText,
  });
}

/**
 * Display a luxury confirm dialog modal
 * Returns true if confirmed, false otherwise
 */
export async function alertConfirm(
  title: string,
  message: string,
  confirmButtonText: string = "Confirm",
  cancelButtonText: string = "Cancel",
  icon: SweetAlertIcon = "question"
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    html: message ? `<p class="text-neutral-300 text-sm mt-1">${message}</p>` : undefined,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: baseCustomClass,
    buttonsStyling: false,
    focusCancel: true,
  });
  return Boolean(result.isConfirmed);
}

/**
 * Display a top-end luxury toast notification
 */
export function alertToast(
  title: string,
  type: "success" | "error" | "info" | "warning" = "success",
  timer: number = 3000
) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    customClass: {
      popup: "vip-swal !py-3 !px-4 !rounded-xl !border-gold/50 !shadow-gold-glow",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  return Toast.fire({
    icon: type,
    title,
  });
}

/**
 * Luxury "Added to Bag" confirmation popup with thumbnail & quick checkout
 */
export async function alertAddToCart({
  name,
  price,
  image,
}: {
  name: string;
  price: string | number;
  image?: string;
}) {
  const displayPrice = typeof price === "number" ? `PKR ${price.toLocaleString()}` : price;

  const result = await Swal.fire({
    title: "Added to Your Bag",
    html: `
      <div class="flex items-center gap-4 p-3.5 my-2 rounded-2xl bg-obsidian-950/90 border border-gold/40 text-left shadow-inner">
        ${
          image
            ? `<img src="${image}" alt="${name}" class="w-16 h-16 object-cover rounded-xl border border-gold/30 flex-shrink-0" />`
            : `<div class="w-16 h-16 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold">MC</div>`
        }
        <div class="flex-1 min-w-0">
          <p class="font-serif text-sm text-gold-300 font-semibold truncate">${name}</p>
          <p class="text-[11px] text-neutral-400 mt-0.5">Luxury Artisanal Flacon</p>
          <p class="text-sm font-bold text-ivory mt-1">${displayPrice}</p>
        </div>
      </div>
      <p class="text-xs text-neutral-400 mt-2">Complimentary curated sample vials included with every acquisition.</p>
    `,
    showCancelButton: true,
    confirmButtonText: "Proceed to Checkout",
    cancelButtonText: "Continue Exploring",
    reverseButtons: true,
    customClass: baseCustomClass,
    buttonsStyling: false,
  });

  return Boolean(result.isConfirmed);
}

/**
 * Luxury Wishlist notification toast
 */
export function alertWishlist(name: string, added: boolean) {
  const toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: {
      popup: "vip-swal !py-3 !px-4 !rounded-xl !border-gold/50",
    },
  });

  toast.fire({
    icon: added ? "success" : "info",
    title: added ? `Added to Private Reserve` : `Removed from Wishlist`,
    html: `<span class="text-xs text-neutral-300">${name}</span>`,
  });
}

// Export default instance for custom usages
export default Swal;
