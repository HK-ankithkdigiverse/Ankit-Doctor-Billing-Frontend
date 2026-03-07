import { getCategoryMedicalStoreId, getCompanyMedicalStoreId } from "./medicalStore";

type SelectOption = {
  value: string;
  label: string;
};

export const toProductPayload = (values: Record<string, unknown>) => ({
  ...values,
  mrp: Number(values.mrp || 0),
  price: Number(values.price || 0),
  stock: Number(values.stock || 0),
});

export const buildCompanyOptions = (
  companies: Array<Record<string, any>>,
  options?: { includeCompany?: Record<string, any> | null }
): SelectOption[] => {
  const mapped = companies.map((company) => ({
    value: company._id,
    label: company.companyName || company.name || company.email || company._id,
  }));

  const includeCompany = options?.includeCompany;
  if (!includeCompany?._id) return mapped;

  const includeOption = {
    value: includeCompany._id,
    label: includeCompany.companyName || includeCompany.name || includeCompany._id,
  };
  if (!mapped.some((option) => option.value === includeOption.value)) {
    mapped.push(includeOption);
  }
  return mapped;
};

export const resolveSelectedCompanyMedicalStoreId = (
  companies: Array<Record<string, any>>,
  selectedCompanyId: string,
  options?: { fallbackCompany?: Record<string, any> | null }
) => {
  if (!selectedCompanyId) return "";
  const selectedCompany =
    companies.find((company) => company._id === selectedCompanyId) || options?.fallbackCompany || null;
  return getCompanyMedicalStoreId(selectedCompany);
};

export const buildCategoryOptionsForProductForm = ({
  categories,
  isAdmin,
  selectedCompanyId,
  selectedCompanyMedicalStoreId,
  includeCategoryName,
}: {
  categories: Array<Record<string, any>>;
  isAdmin: boolean;
  selectedCompanyId: string;
  selectedCompanyMedicalStoreId: string;
  includeCategoryName?: string;
}): SelectOption[] => {
  const filteredCategories = categories.filter((category) => {
    if (!isAdmin) return true;
    if (!selectedCompanyId) return false;
    if (!selectedCompanyMedicalStoreId) return true;
    const categoryStoreId = getCategoryMedicalStoreId(category);
    if (!categoryStoreId) return true;
    return categoryStoreId === selectedCompanyMedicalStoreId;
  });

  const options = filteredCategories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  if (includeCategoryName && !options.some((option) => option.value === includeCategoryName)) {
    options.push({ value: includeCategoryName, label: includeCategoryName });
  }

  const deduped = new Map<string, SelectOption>();
  options.forEach((option) => {
    if (!deduped.has(option.value)) deduped.set(option.value, option);
  });
  return [...deduped.values()];
};
