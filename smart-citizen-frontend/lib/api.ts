export const API_URL = "http://127.0.0.1:8000";

// Helper to extract error message safely
const getErrorMessage = (data: any) => {
  if (data.detail) {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
        // FastAPI validation error is an array
        return data.detail.map((e: any) => `${e.loc[1]}: ${e.msg}`).join(", ");
    }
    return JSON.stringify(data.detail);
  }
  return "An unexpected error occurred";
};

// ==========================================
// 1. AUTHENTICATION (Public)
// ==========================================

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    // 🔥 FIXED: Use the helper to get the real text
    throw new Error(getErrorMessage(data));
  }
  return data;
};

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }
  return data;
};

// ==========================================
// 2. HELPER: Get Token from Storage
// ==========================================
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('token');
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }
  return { "Content-Type": "application/json" };
};

// ==========================================
// 3. CITIZEN SERVICES (Protected)
// ==========================================

export const submitApplication = async (data: any) => {
  const response = await fetch(`${API_URL}/api/applications/`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

export const getMyApplications = async () => {
  const response = await fetch(`${API_URL}/api/applications/my-apps`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

// ==========================================
// 4. ADMIN SERVICES (Protected)
// ==========================================

export const getPendingApplications = async () => {
  const response = await fetch(`${API_URL}/api/applications/pending`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const response = await fetch(`${API_URL}/api/applications/${id}/status`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ status }),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

// ==========================================
// 5. MARKETPLACE API
// ==========================================

export const getAllProducts = async () => {
  const response = await fetch(`${API_URL}/api/products/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

export const addProduct = async (productData: any) => {
  const response = await fetch(`${API_URL}/api/products/`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(productData),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

export const getSmartRecommendations = async () => {
  const response = await fetch(`${API_URL}/api/recommendations/`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

// ==========================================
// 6. USER PROFILE & WALLET API
// ==========================================

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error(getErrorMessage(await response.json()));
  return await response.json();
};

export const updateUserProfile = async (data: any) => {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

export const getWalletDocuments = async () => {
  const response = await fetch(`${API_URL}/api/users/wallet`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const resData = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(resData));
  return resData;
};

// ==========================================
// 7. GS OFFICER API
// ==========================================

export const getGSStats = async () => {
  const response = await fetch(`${API_URL}/api/gs/stats`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getVillagers = async () => {
  const response = await fetch(`${API_URL}/api/gs/villagers`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getLandDisputes = async () => {
  const response = await fetch(`${API_URL}/api/gs/land`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const addLandDispute = async (data: any) => {
  const response = await fetch(`${API_URL}/api/gs/land`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return await response.json();
};

// ==========================================
// 8. DS OFFICER API
// ==========================================

export const getDSStats = async () => {
  const response = await fetch(`${API_URL}/api/ds/stats`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getDSQueue = async () => {
  const response = await fetch(`${API_URL}/api/ds/queue`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getDSCertificates = async () => {
  const response = await fetch(`${API_URL}/api/ds/certificates`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

// ==========================================
// 9. SUPER ADMIN API
// ==========================================

export const getAllOfficers = async () => {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const deleteOfficer = async (id: string) => {
  const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getAllServices = async () => {
  const response = await fetch(`${API_URL}/api/admin/services`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const updateServiceConfig = async (id: string, data: any) => {
  const response = await fetch(`${API_URL}/api/admin/services/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getRevenueAnalytics = async () => {
  const response = await fetch(`${API_URL}/api/admin/revenue`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

export const getSystemStats = async () => {
  const response = await fetch(`${API_URL}/api/admin/stats`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  return await response.json();
};

// ==========================================
// NEW: HIERARCHY MANAGEMENT (Admin, DS, GS)
// ==========================================

// ===== ADMIN ENDPOINTS =====
export const assignDSToDiv = async (data: {
  ds_nic: string;
  province: string;
  district: string;
  ds_division: string;
}) => {
  const response = await fetch(`${API_URL}/api/admin/assign-ds`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(result));
  return result;
};

export const getAllDivisions = async () => {
  const response = await fetch(`${API_URL}/api/admin/divisions`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
};

// ===== DS ENDPOINTS =====
export const addGSOfficer = async (data: {
  fullname: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  gs_section: string;
  address: string;
}) => {
  const response = await fetch(`${API_URL}/api/ds/add-gs`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(result));
  return result;
};

export const getGSOfficers = async () => {
  const response = await fetch(`${API_URL}/api/ds/gs-officers`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data));
  return data;
};

// ===== GS ENDPOINTS =====
export const addCitizen = async (data: {
  fullname: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  address: string;
}) => {
  const response = await fetch(`${API_URL}/api/gs/add-citizen`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(result));
  return result;
};

// Download Certificate URL Builder
export const getDownloadUrl = (appId: string) => {
  return `${API_URL}/api/applications/${appId}/download`;
};

// ... existing imports

// Add this to your APPLICATION API section
export const deleteApplication = async (id: string) => {
  const response = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  
  // Note: Ensure your backend has a DELETE route for this. 
  // If not, this frontend call will fail. 
  // For this frontend task, we assume standard REST behavior.
  if (!response.ok) throw new Error("Failed to delete application");
  return await response.json();
};