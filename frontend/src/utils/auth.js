// Central helper: always get current user and their token for API calls
export const getUser = () => JSON.parse(localStorage.getItem("currentUser")) || null;

export const authHeaders = () => {
  const user = getUser();
  return {
    "Content-Type": "application/json",
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
  };
};

export const API = "http://localhost:5000";
