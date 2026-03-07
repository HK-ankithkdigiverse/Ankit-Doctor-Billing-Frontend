const DEFAULT_BACKEND_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";

const unwrapPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  if ("status" in payload && "message" in payload && "data" in payload) {
    return payload.data;
  }
  return payload;
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
    const [bills, products, companies, categories, users, medicalStores] =
      await Promise.all([
        fetchResource("bills", authorization, medicalStoreId),
        fetchResource("products", authorization, medicalStoreId),
        fetchResource("companies", authorization, medicalStoreId),
        fetchResource("categories", authorization, medicalStoreId),
        fetchResource("users", authorization, ""),
        fetchResource("medical-stores", authorization, ""),
      ]);

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
