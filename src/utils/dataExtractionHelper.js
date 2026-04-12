/**
 * 🛠️ DATA EXTRACTION HELPER
 * Standardizes API response extraction across the entire application
 */

export const extractData = (response) => {
  if (!response) return [];

  if (response.data?.data?.orders) return response.data.data.orders;
  if (response.data?.orders) return response.data.orders;
  if (response.data) return response.data;
  if (Array.isArray(response)) return response;

  return response.data || [];
};

export const extractPagination = (response) => {
  if (!response) return { total: 0, page: 1, pages: 0 };

  return (
    response.data?.data?.pagination ||
    response.data?.pagination ||
    { total: 0, page: 1, pages: 0 }
  );
};

export const extractError = (response) => {
  if (!response) return "Unknown error";

  return (
    response.message ||
    response.data?.message ||
    response.error ||
    "An error occurred"
  );
};

export const isSuccess = (response) => {
  if (!response) return false;
  return response?.success === true || response?.data?.success === true;
};

export const createSuccessResponse = (data, message = "Success") => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

export const logApiCall = (endpoint, method = "GET", data = null) => {
  console.log(`🔗 API Call: ${method} ${endpoint}`, data ? { data } : "");
};

export const logApiResponse = (endpoint, response) => {
  const extractedData = extractData(response);

  console.log(`📦 API Response: ${endpoint}`, {
    success: isSuccess(response),
    dataCount: Array.isArray(extractedData)
      ? extractedData.length
      : extractedData
      ? 1
      : 0,
    hasData: Array.isArray(extractedData)
      ? extractedData.length > 0
      : !!extractedData,
  });
};