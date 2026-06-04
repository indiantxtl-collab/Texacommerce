// Utility to get user data from custom users table based on auth_users
export async function getUserData(authUserId) {
  if (!authUserId) return null;

  try {
    const response = await fetch(
      `/api/profile/user-by-auth-id?authId=${authUserId}`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
