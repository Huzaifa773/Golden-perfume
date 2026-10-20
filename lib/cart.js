// lib/cart.js
"use client";

import { useState, useEffect } from "react";

const CART_STORAGE_KEY = "maison_charcoal_cart_v1";

export function getCartFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCartToStorage(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

// ✅ Helper: Image URL ko safely extract karein
function extractImageUrl(images) {
  if (!images) return "";

  // Agar string hai
  if (typeof images === "string") return images;

  // Agar array hai
  if (Array.isArray(images)) {
    for (const item of images) {
      if (typeof item === "string" && item.trim()) return item;
      if (item && typeof item === "object" && typeof item.url === "string") {
        return item.url;
      }
    }
  }

  return "";
}

export function addToCart(product, quantity = 1, selectedSize = null) {
  const current = getCartFromStorage();
  const sizeToUse = selectedSize || product.size || "100ml";

  // Variant ID bhi include karein (agar mojood ho)
  const variantId = product.selectedVariantId || null;
  const itemKey = `${product.id}-${sizeToUse}${variantId ? `-${variantId}` : ""}`;

  const existingIdx = current.findIndex(
    (item) => item.id === product.id && item.size === sizeToUse
  );

  // Selected variant ki price use karein
  const priceToUse = product.discountPrice || product.price;

  // ✅ Image URL sahi tareeqe se nikaalein
  const imageUrl = extractImageUrl(product.images) || product.image || "";

  if (existingIdx !== -1) {
    current[existingIdx].quantity += quantity;
  } else {
    current.push({
      itemKey,
      id: product.id,
      variantId: variantId,
      name: product.name,
      brand: product.brand || "Maison Charcoal",
      price: Number(priceToUse),
      originalPrice: Number(product.price),
      image: imageUrl, // ✅ Sahi image URL
      size: sizeToUse,
      quantity,
    });
  }

  saveCartToStorage(current);
  return current;
}

export function removeFromCart(itemKey) {
  const current = getCartFromStorage();
  const updated = current.filter(
    (item) => (item.itemKey || item.id) !== itemKey
  );
  saveCartToStorage(updated);
  return updated;
}

export function updateCartQuantity(itemKey, quantity) {
  const current = getCartFromStorage();
  const item = current.find((i) => (i.itemKey || i.id) === itemKey);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCartToStorage(current);
  }
  return current;
}

export function clearCart() {
  saveCartToStorage([]);
}

export function useCart() {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getCartFromStorage());
    setIsLoaded(true);

    const onUpdate = () => {
      setItems(getCartFromStorage());
    };

    window.addEventListener("cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items,
    isLoaded,
    totalCount,
    subtotal,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateCartQuantity,
    clear: clearCart,
  };
}