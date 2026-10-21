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

// Helper: Safely extract image URL
export function extractImageUrl(images) {
  if (!images) return "";
  if (typeof images === "string") return images;

  if (Array.isArray(images)) {
    for (const item of images) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item && typeof item === "object" && typeof item.url === "string" && item.url.trim()) {
        return item.url.trim();
      }
    }
  }

  return "";
}

/**
 * Robust addToCart binding:
 * Accurately binds size ↔ price ↔ stock per variant object.
 */
export function addToCart(product, quantity = 1, selectedSize = null) {
  if (!product) return [];
  const current = getCartFromStorage();

  // 1. Resolve matching variant if product has variants
  let matchingVariant = null;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  if (hasVariants) {
    if (selectedSize) {
      matchingVariant =
        product.variants.find(
          (v) =>
            v &&
            String(v.size).toLowerCase().trim() ===
              String(selectedSize).toLowerCase().trim()
        ) || null;
    }
    // If no matching variant found by size, check if product has a selectedVariantId
    if (!matchingVariant && product.selectedVariantId) {
      matchingVariant =
        product.variants.find((v) => v.id === product.selectedVariantId) || null;
    }
    // Default to the first variant if still not matched
    if (!matchingVariant) {
      matchingVariant = product.variants[0];
    }
  }

  // 2. Derive size, price, and stock from matching variant (or fallback to product base)
  const sizeToUse = matchingVariant
    ? matchingVariant.size
    : selectedSize || product.size || "100ml";

  const priceToUse = matchingVariant
    ? matchingVariant.discountPrice && Number(matchingVariant.discountPrice) > 0
      ? Number(matchingVariant.discountPrice)
      : Number(matchingVariant.price)
    : product.discountPrice && Number(product.discountPrice) > 0
    ? Number(product.discountPrice)
    : Number(product.price);

  const originalPriceToUse = matchingVariant
    ? Number(matchingVariant.price)
    : Number(product.price);

  const variantId = matchingVariant?.id || product.selectedVariantId || null;
  const stockToUse = matchingVariant?.stock !== undefined ? Number(matchingVariant.stock) : (Number(product.stock) || 99);

  // 3. Unique itemKey per product and size combination
  const itemKey = `${product.id}-${String(sizeToUse).trim()}`;

  const existingIdx = current.findIndex(
    (item) => item.itemKey === itemKey || (item.id === product.id && item.size === sizeToUse)
  );

  const imageUrl =
    extractImageUrl(product.images) ||
    (typeof product.image === "string" ? product.image : "") ||
    "/images/products/placeholder.jpg";

  const qtyToAdd = Math.max(1, Number(quantity) || 1);

  if (existingIdx !== -1) {
    current[existingIdx].quantity += qtyToAdd;
    current[existingIdx].price = Number(priceToUse);
    current[existingIdx].originalPrice = Number(originalPriceToUse);
    current[existingIdx].size = sizeToUse;
    current[existingIdx].stock = stockToUse;
    if (imageUrl) current[existingIdx].image = imageUrl;
  } else {
    current.push({
      itemKey,
      id: product.id,
      variantId: variantId,
      name: product.name,
      brand: product.brand || "Maison Charcoal",
      price: Number(priceToUse),
      originalPrice: Number(originalPriceToUse),
      image: imageUrl,
      size: sizeToUse,
      quantity: qtyToAdd,
      stock: stockToUse,
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
    const maxStock = item.stock && item.stock > 0 ? item.stock : 999;
    item.quantity = Math.min(maxStock, Math.max(1, quantity));
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