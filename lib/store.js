// lib/store.js
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Local product images
const LUXURY_PICS = [
  "/images/products/p1.jpg",
  "/images/products/p2.jpg",
  "/images/products/p3.jpg",
  "/images/products/p4.jpg",
  "/images/products/p5.jpg",
  "/images/products/p6.jpg",
  "/images/products/p7.jpg",
  "/images/products/p8.jpg",
  "/images/products/p9.jpg",
  "/images/products/p10.jpg",
  "/images/products/p11.jpg",
  "/images/products/p12.jpg",
  "/images/products/p13.jpg",
  "/images/products/p14.jpg",
  "/images/products/p15.jpg",
  "/images/products/p16.jpg",
  "/images/products/p17.jpg",
];

const PLACEHOLDER_IMAGE = "/images/products/placeholder.jpg";
const PLACEHOLDER_USER_AVATAR = "/images/products/placeholder.jpg";

// ============================================================
// HELPERS
// ============================================================

function mapProduct(p) {
  if (!p) return null;
  const img1 = p.image_1 || p.images?.[0]?.url || (typeof p.images?.[0] === "string" ? p.images[0] : null);
  const img2 = p.image_2 || p.images?.[1]?.url || (typeof p.images?.[1] === "string" ? p.images[1] : null);

  const allImages = [];
  if (img1) allImages.push(img1);
  if (img2 && img2 !== img1) allImages.push(img2);
  if (p.images && p.images.length > 0) {
    p.images.forEach((img) => {
      const url = typeof img === "string" ? img : img.url;
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }
  if (allImages.length === 0) allImages.push(PLACEHOLDER_IMAGE);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    brand: p.brand,
    size: p.size,
    category: p.category?.slug || p.category?.name || "shop",
    targetPage: p.targetPage || p.category?.slug || "shop",
    fragranceType: p.fragranceType,
    sku: p.sku,
    stock: p.stock,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    isActive: p.isActive,
    image_1: img1 || allImages[0],
    image_2: img2 || allImages[1] || allImages[0],
    images: allImages,
    notes: p.notes || { top: [], heart: [], base: [] },
    variants: (p.variants || []).map((v, idx) => ({
      id: v.id,
      size: v.size,
      price: Number(v.price),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
      stock: v.stock,
      position: v.position ?? idx,
    })),
    rating: 5.0,
    reviewCount: p.reviews?.length || 0,
    addedByUserId: "admin",
    addedByUserName: "Admin",
    addedByUserEmail: "admin@perfume.store",
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
  };
}

function mapOrder(o) {
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    userId: o.userId,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.address
      ? {
          fullName: o.address.fullName,
          phone: o.address.phone,
          line1: o.address.line1,
          line2: o.address.line2,
          city: o.address.city,
          province: o.address.province,
          postalCode: o.address.postalCode,
          country: o.address.country,
        }
      : {},
    items: (o.items || []).map((it) => ({
      productId: it.productId,
      name: it.name,
      price: Number(it.price),
      quantity: it.quantity,
      size: it.product?.size || "",
      image:
        it.product?.images?.[0]?.url ||
        it.product?.images?.[0] ||
        PLACEHOLDER_IMAGE,
    })),
    subtotal: Number(o.subtotal),
    shippingCost: Number(o.shippingCost),
    discount: Number(o.discount),
    total: Number(o.total),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    expectedDeliveryDate:
      o.orderStatus === "PROCESSING" || o.orderStatus === "CONFIRMED"
        ? "Within 2–3 Days"
        : "Estimated 2–4 Business Days",
    proofImageUrl: o.payments?.[0]?.proofImageUrl || "",
    paymentReference: o.payments?.[0]?.gatewayReference || "",
    notes: o.notes || "",
    createdAt: o.createdAt?.toISOString?.() || o.createdAt,
    updatedAt: o.updatedAt?.toISOString?.() || o.updatedAt,
  };
}

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    isAdmin: u.role === "ADMIN",
    phone: u.phone,
    address: u.addresses?.[0] || {},
    image: u.image || PLACEHOLDER_USER_AVATAR,
    isActive: u.isActive,
    createdAt: u.createdAt?.toISOString?.() || u.createdAt,
  };
}

// ============================================================
// EXPORTED UNIFIED STORE API
// ============================================================

export const store = {
  // ---------- PRODUCTS ----------
  async getProducts({
    category = "all",
    targetPage = "all",
    search = "",
    page = 1,
    limit = 20,
    sort = "featured",
    featured = false,
  } = {}) {
    try {
      const andConditions = [{ isActive: true }];

      // Featured filter
      if (featured === true || featured === "true") {
        andConditions.push({ isFeatured: true });
      }

      // ============================================================
      // TARGET PAGE FILTER (Strict Category Isolation)
      // - "shop"  → matches products assigned to "shop", "all", or multi-tagged
      // - "home"  → strictly products assigned to "home"
      // - "men"   → strictly products assigned to "men"
      // - "women" → strictly products assigned to "women"
      // - "attar" → strictly products assigned to "attar"
      // - "oud"   → strictly products assigned to "oud"
      // ============================================================
      if (targetPage && targetPage !== "all" && targetPage !== "featured") {
        const pageLower = targetPage.toLowerCase().trim();
        if (pageLower === "shop") {
          andConditions.push({
            OR: [
              { targetPage: "shop" },
              { targetPage: { contains: "shop" } },
              { targetPage: "all" },
            ],
          });
        } else {
          andConditions.push({
            OR: [
              { targetPage: pageLower },
              { targetPage: { contains: pageLower } },
            ],
          });
        }
      }

      // CATEGORY FILTER (Fallback/Complementary)
      if (category && category !== "all" && category !== "shop") {
        const catLower = category.toLowerCase().trim();
        andConditions.push({
          OR: [
            { category: { slug: catLower } },
            { category: { name: { contains: catLower } } },
            { targetPage: catLower },
            { targetPage: { contains: catLower } },
          ],
        });
      }

      // Search
      if (search && search.trim()) {
        const term = search.trim();
        andConditions.push({
          OR: [
            { name: { contains: term } },
            { brand: { contains: term } },
            { description: { contains: term } },
          ],
        });
      }

      const where = andConditions.length > 1 ? { AND: andConditions } : andConditions[0];

      let orderBy = { createdAt: "desc" };
      if (sort === "price-asc") orderBy = { price: "asc" };
      else if (sort === "price-desc") orderBy = { price: "desc" };
      else if (sort === "newest") orderBy = { createdAt: "desc" };
      else orderBy = { isFeatured: "desc" };

      const total = await prisma.product.count({ where });
      const pageNum = Math.max(1, parseInt(page) || 1);
      const pageSize = Math.max(1, parseInt(limit) || 20);
      const totalPages = Math.ceil(total / pageSize) || 1;

      const products = await prisma.product.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
          reviews: true,
        },
      });

      return {
        products: products.map(mapProduct),
        total,
        page: pageNum,
        limit: pageSize,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      };
    } catch (err) {
      console.error("getProducts error:", err.message);
      return {
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  },

  async getProductById(id) {
    try {
      const p = await prisma.product.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: [{ position: "asc" }, { price: "asc" }] },
          reviews: true,
        },
      });
      return mapProduct(p);
    } catch {
      return null;
    }
  },

  async createProduct(productData) {
    try {
      const slug =
        (productData.name || "perfume")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Date.now().toString(36);

      // Step 1: Get or create category
      let category = null;
      try {
        category = await prisma.category.findFirst({
          where: { slug: (productData.category || "men").toLowerCase() },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: productData.category || "General",
              slug: (productData.category || "general").toLowerCase(),
            },
          });
        }
      } catch (catErr) {
        console.error("Category error:", catErr);
        category = await prisma.category.findFirst();
        if (!category) {
          throw new Error("No categories available in database");
        }
      }

      // Step 2: Prepare images
      const providedImages = Array.isArray(productData.images)
        ? productData.images.filter(
            (img) => typeof img === "string" && img.trim().length > 0
          )
        : [];

      const images =
        providedImages.length > 0
          ? providedImages
          : [LUXURY_PICS[Math.floor(Math.random() * LUXURY_PICS.length)]];

      // Step 3: Generate unique SKU
      const uniqueSku =
        productData.sku ||
        `MC-${Date.now().toString().slice(-8)}-${Math.floor(
          Math.random() * 1000
        )}`;

      // Step 4: Determine targetPage
      const targetPage =
        productData.targetPage || productData.category || "shop";

      // Step 5: Create product
      const p = await prisma.product.create({
        data: {
          name: productData.name,
          slug,
          description: productData.description || "",
          price: Number(productData.price) || 0,
          discountPrice: productData.discountPrice
            ? Number(productData.discountPrice)
            : null,
          brand: productData.brand || "Maison Charcoal",
          size: productData.size || "100ml",
          fragranceType: productData.fragranceType || "EAU_DE_PARFUM",
          sku: uniqueSku,
          stock: Number(productData.stock) || 20,
          isFeatured: Boolean(productData.isFeatured),
          isBestSeller: Boolean(productData.isBestSeller),
          isNewArrival: true,
          isActive: true,
          targetPage: targetPage,
          notes: productData.notes || { top: [], heart: [], base: [] },
          categoryId: category.id,
          images: {
            create: images.map((url, i) => ({ url, position: i })),
          },
        },
        include: { category: true, images: true, reviews: true },
      });

      return mapProduct(p);
    } catch (err) {
      console.error("createProduct FULL error:", err);
      throw new Error(err.message || "Failed to create product");
    }
  },

  async updateProduct(id, updates) {
    try {
      await prisma.product.update({
        where: { id },
        data: {
          name: updates.name,
          description: updates.description,
          price:
            updates.price !== undefined ? Number(updates.price) : undefined,
          discountPrice:
            updates.discountPrice !== undefined
              ? updates.discountPrice
                ? Number(updates.discountPrice)
                : null
              : undefined,
          stock:
            updates.stock !== undefined ? Number(updates.stock) : undefined,
          isFeatured: updates.isFeatured,
          isBestSeller: updates.isBestSeller,
          isActive: updates.isActive,
          targetPage: updates.targetPage,
        },
      });
      return this.getProductById(id);
    } catch {
      return null;
    }
  },

  async deleteProduct(id) {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  // ---------- USERS & AUTH ----------
  async getUserByEmail(email) {
    if (!email) return null;
    try {
      const u = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { addresses: true },
      });
      return mapUser(u);
    } catch {
      return null;
    }
  },

  async getUserById(id) {
    try {
      const u = await prisma.user.findUnique({
        where: { id },
        include: { addresses: true },
      });
      return mapUser(u);
    } catch {
      return null;
    }
  },

  async createUser(userData) {
    const existing = await this.getUserByEmail(userData.email);
    if (existing)
      throw new Error("A user with this email address already exists.");

    const passwordHash = bcrypt.hashSync(userData.password, 10);

    const u = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash,
        role: userData.role || "CUSTOMER",
        phone: userData.phone || "",
        image: PLACEHOLDER_USER_AVATAR,
        addresses: userData.address
          ? {
              create: {
                fullName: userData.name,
                phone: userData.phone || "",
                line1: userData.address.line1 || "",
                city: userData.address.city || "",
                province: userData.address.province || "",
                postalCode: userData.address.postalCode || "",
                country: "Pakistan",
                isDefault: true,
              },
            }
          : undefined,
      },
      include: { addresses: true },
    });

    return mapUser(u);
  },

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          addresses: true,
          orders: true,
          _count: { select: { orders: true, reviews: true } },
        },
      });
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isAdmin: u.role === "ADMIN",
        phone: u.phone,
        address: u.addresses[0] || {},
        image: u.image || PLACEHOLDER_USER_AVATAR,
        createdAt: u.createdAt?.toISOString?.() || u.createdAt,
        productCount: 0,
        orderCount: u._count.orders,
        totalSpend: u.orders.reduce((s, o) => s + Number(o.total), 0),
      }));
    } catch {
      return [];
    }
  },

  async getUserDetail(userId) {
    try {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          addresses: true,
          orders: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
              address: true,
              payments: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!u) return null;
      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isAdmin: u.role === "ADMIN",
          phone: u.phone,
          address: u.addresses[0] || {},
          createdAt: u.createdAt,
        },
        products: [],
        orders: u.orders.map(mapOrder),
        totalSpend: u.orders.reduce((s, o) => s + Number(o.total), 0),
        productCount: 0,
        orderCount: u.orders.length,
      };
    } catch {
      return null;
    }
  },

  // ---------- ORDERS ----------
  async getOrders(userId = null) {
    try {
      const where = userId ? { userId } : {};
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          address: true,
          payments: true,
        },
      });
      return orders.map(mapOrder);
    } catch (err) {
      console.error("getOrders error:", err);
      return [];
    }
  },

  async getOrderById(orderId) {
    try {
      const o = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          address: true,
          payments: true,
        },
      });
      return mapOrder(o);
    } catch {
      return null;
    }
  },

  async createOrder(orderData) {
    try {
      const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      let userId = orderData.userId;
      if (!userId || userId === "guest") {
        const guestEmail =
          orderData.customerEmail || `guest-${Date.now()}@perfume.store`;
        let guest = await prisma.user.findUnique({
          where: { email: guestEmail },
        });
        if (!guest) {
          guest = await prisma.user.create({
            data: {
              name: orderData.customerName || "Guest",
              email: guestEmail,
              role: "CUSTOMER",
              phone: orderData.customerPhone || "",
            },
          });
        }
        userId = guest.id;
      }

      const addr = orderData.shippingAddress || {};
      const address = await prisma.address.create({
        data: {
          userId,
          fullName: addr.fullName || orderData.customerName || "Customer",
          phone: addr.phone || orderData.customerPhone || "",
          line1: addr.line1 || "N/A",
          city: addr.city || "Karachi",
          province: addr.province || "Sindh",
          postalCode: addr.postalCode || "00000",
          country: addr.country || "Pakistan",
        },
      });

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          addressId: address.id,
          subtotal: Number(orderData.subtotal) || 0,
          shippingCost: Number(orderData.shippingCost) || 0,
          discount: Number(orderData.discount) || 0,
          total: Number(orderData.total) || 0,
          paymentMethod: orderData.paymentMethod || "COD",
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          customerName: orderData.customerName || "Guest",
          customerEmail: orderData.customerEmail || "guest@perfume.store",
          customerPhone: orderData.customerPhone || "",
          notes: orderData.notes || "",
          items: {
            create: (orderData.items || []).map((it) => ({
              productId: it.productId,
              name: it.name,
              price: Number(it.price),
              quantity: it.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          address: true,
          payments: true,
        },
      });

      return mapOrder(order);
    } catch (err) {
      console.error("createOrder error:", err.message);
      return null;
    }
  },

  async updateOrderStatus(
    orderId,
    { orderStatus, paymentStatus, expectedDeliveryDate }
  ) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) return null;

      const updateData = {};

      if (orderStatus) {
        updateData.orderStatus = orderStatus;
        if (orderStatus === "CANCELLED") {
          updateData.paymentStatus = "FAILED";
        }
      }

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });

      return this.getOrderById(order.id);
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      return null;
    }
  },

  async clearPayment(
    orderId,
    expectedDeliveryDate = "Within 2–3 Days",
    newStatus = null
  ) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) return null;

      const updateData = {
        paymentStatus: "PAID",
      };

      if (newStatus && newStatus !== "PENDING") {
        updateData.orderStatus = newStatus;
      } else {
        updateData.orderStatus = "PROCESSING";
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });

      try {
        await prisma.notification.create({
          data: {
            userId: order.userId,
            userEmail: order.customerEmail,
            orderId: order.id,
            orderNumber: order.orderNumber,
            title: "Payment Cleared! 🚚",
            message:
              "Aap ki payment clear ho gai hai. Ab aap ka parcel 24 se 48 ghantay mein aap ke pate par deliver ho jayega. Shukriya!",
            type: "PAYMENT_CLEARED",
            isRead: false,
          },
        });
      } catch (notifErr) {
        console.warn("Notification skipped:", notifErr.message);
      }

      return this.getOrderById(order.id);
    } catch (err) {
      console.error("clearPayment error:", err);
      return null;
    }
  },

  // ---------- NOTIFICATIONS ----------
  async getNotifications(userId) {
    try {
      if (!userId) return [];
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        userEmail: n.userEmail,
        orderId: n.orderId,
        orderNumber: n.orderNumber,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt?.toISOString?.() || n.createdAt,
      }));
    } catch (err) {
      console.error("getNotifications error:", err);
      return [];
    }
  },

  async markNotificationRead(notifId) {
    try {
      await prisma.notification.update({
        where: { id: notifId },
        data: { isRead: true },
      });
      return true;
    } catch {
      return false;
    }
  },

  async createNotification(data) {
    try {
      const notif = await prisma.notification.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          title: data.title,
          message: data.message,
          type: data.type || "ORDER_STATUS",
          isRead: false,
        },
      });
      return notif;
    } catch (err) {
      console.error("createNotification error:", err);
      return null;
    }
  },

  // ---------- SEARCH PRODUCTS ----------
  async logSearchProduct({ query }) {
    console.log("Search logged:", query);
    return { id: `sp-${Date.now()}`, query };
  },

  async getSearchProducts() {
    return [];
  },

  async deleteSearchProduct() {
    return true;
  },
};