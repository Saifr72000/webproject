import fetch from "node-fetch";

const API_URL = "http://localhost:2000";

describe("Auth API", () => {
  // Test variables
  const testUser = {
    email: "saif@rana.com",
    password: "saif2000",
  };
  let cookies: string;

  // Positive test case
  test("POST /api/auth/login successfully authenticates user", async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const data = (await response.json()) as { user: { email: string } };

    // Save cookies for subsequent tests
    cookies = response.headers.get("set-cookie") || "";

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("user");
    expect(data.user).toHaveProperty("email", testUser.email);
  });

  // Boundary test case - testing token refresh
  test("POST /api/auth/refresh-token successfully refreshes token", async () => {
    // Skip this test if login failed
    if (!cookies) {
      return;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        Cookie: cookies,
      },
    });

    // Update cookies if new ones are set
    const newCookies = response.headers.get("set-cookie");
    if (newCookies) {
      cookies = newCookies;
    }

    expect(response.status).toBe(200);
  });

  // Positive test case
  test("POST /api/auth/logout successfully logs out user", async () => {
    // Skip this test if login failed
    if (!cookies) {
      return;
    }

    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: cookies,
      },
    });

    expect(response.status).toBe(200);

    // Verify cookies are cleared (this depends on how your API handles logout)
    const logoutCookies = response.headers.get("set-cookie") || "";
    expect(logoutCookies).toContain("expires=");
  });

  // Negative test case - invalid credentials
  test("POST /api/auth/login fails with invalid credentials", async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
        password: "wrongpassword",
      }),
    });

    expect(response.status).toBe(401);
  });

  // Negative test case - refresh without token
  test("POST /api/auth/refresh-token fails without valid token", async () => {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  // Edge case - malformed request
  test("POST /api/auth/login fails with malformed request", async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Missing required fields
      }),
    });

    expect(response.status).toBe(400);
  });
});
