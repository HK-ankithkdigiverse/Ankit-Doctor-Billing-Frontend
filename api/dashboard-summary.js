const DEFAULT_BACKEND_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const asInt = Math.trunc(parsed);
  return asInt > 0 ? asInt : fallback;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const parsePagination = (raw, fallbackTotal) => {
  const total = toPositiveInt(raw?.pagination?.total ?? raw?.totalData, fallbackTotal);
  const page = toPositiveInt(raw?.pagination?.page ?? raw?.state?.page, 1);
  const limit = toPositiveInt(raw?.pagination?.limit ?? raw?.state?.limit, Math.max(total, 1));
  const totalPages = toPositiveInt(
    raw?.pagination?.totalPages ??
      raw?.pagination?.page_limit ??
      raw?.state?.page_limit ??
      Math.ceil(total / Math.max(limit, 1)),
    1
  );

  return { total, page, limit, totalPages };
};

const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  if ("status" in payload && "message" in payload && "data" in payload) {
    return payload.data;
  }
  return payload;
};

const normalizeBills = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const bills = toArray(payload.data).length
    ? toArray(payload.data)
    : toArray(payload.bills).length
    ? toArray(payload.bills)
    : toArray(payload.bill_data);
  return {
    ...payload,
    data: bills,
    bills,
    pagination: payload.pagination || parsePagination(payload, bills.length),
  };
};

const normalizeProducts = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const products = toArray(payload.products).length
    ? toArray(payload.products)
    : toArray(payload.product_data).length
    ? toArray(payload.product_data)
    : toArray(payload.data);
  return {
    ...payload,
    products,
    pagination: payload.pagination || parsePagination(payload, products.length),
  };
};

const normalizeCompanies = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const companies = toArray(payload.companies).length
    ? toArray(payload.companies)
    : toArray(payload.company_data);
  return {
    ...payload,
    companies,
    pagination: payload.pagination || parsePagination(payload, companies.length),
  };
};

const normalizeCategories = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const categories = toArray(payload.categories).length
    ? toArray(payload.categories)
    : toArray(payload.category_data);
  return {
    categories,
    pagination: payload.pagination || parsePagination(payload, categories.length),
  };
};

const normalizeUsers = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const users = toArray(payload.users).length
    ? toArray(payload.users)
    : toArray(payload.user_data);
  return {
    ...payload,
    users,
    pagination: payload.pagination || parsePagination(payload, users.length),
  };
};

const normalizeMedicalStores = (raw) => {
  const payload = raw && typeof raw === "object" ? raw : {};
  const medicalStores = toArray(payload.medicalStores).length
    ? toArray(payload.medicalStores)
    : toArray(payload.medicalStore_data);
  return {
    medicalStores,
    pagination: payload.pagination || parsePagination(payload, medicalStores.length),
  };
};

const buildUrl = (path, medicalStoreId) => {
  const origin = (process.env.DASHBOARD_API_ORIGIN || DEFAULT_BACKEND_ORIGIN)
    .trim()
    .replace(/\/+$/, "");
  const baseUrl = `${origin}/api/${path}`;
  if (!medicalStoreId) return baseUrl;
  return `${baseUrl}?medicalStoreId=${encodeURIComponent(medicalStoreId)}`;
};

const fetchResource = async (path, authorization, medicalStoreId) => {
  const response = await fetch(buildUrl(path, medicalStoreId), {
    method: "GET",
    headers: authorization
      ? {
          Authorization: authorization,
        }
      : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || `Failed to fetch ${path}`;
    throw new Error(message);
  }

  return unwrapPayload(payload);
};

module.exports = async (req, res) => {
  const authorization = req.headers.authorization || "";
  const medicalStoreId =
    typeof req.query?.medicalStoreId === "string"
      ? req.query.medicalStoreId
      : "";

  try {
    const [billsRaw, productsRaw, companiesRaw, categoriesRaw, usersRaw, medicalStoresRaw] =
      await Promise.all([
        fetchResource("bills", authorization, medicalStoreId),
        fetchResource("products", authorization, medicalStoreId),
        fetchResource("companies", authorization, medicalStoreId),
        fetchResource("categories", authorization, medicalStoreId),
        fetchResource("users", authorization, ""),
        fetchResource("medical-stores", authorization, ""),
      ]);

    const bills = normalizeBills(billsRaw);
    const products = normalizeProducts(productsRaw);
    const companies = normalizeCompanies(companiesRaw);
    const categories = normalizeCategories(categoriesRaw);
    const users = normalizeUsers(usersRaw);
    const medicalStores = normalizeMedicalStores(medicalStoresRaw);

    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({
      bills,
      products,
      companies,
      categories,
      users,
      medicalStores,
    });
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? error.message
        : "Unable to load dashboard summary";
    return res.status(500).json({ message });
  }
};
