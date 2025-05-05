// cypress/e2e/create-study.cy.ts
/// <reference types="cypress" />

describe("Researcher flow: login, create study, upload comparison", () => {
  it("logs in, creates a study, and uploads a comparison", () => {
    // send login request to get the access token

    cy.request({ 
      method: "POST",
      url: "http://localhost:5000/api/auth/login",
      body: {
        email: "hello23@hotmail.com",
        password: "hello123",
      },
    }).then((res: Cypress.Response<any>) => { // Check if the login was successful
      console.log("Login response headers:", res.headers); // Log the headers to see the set-cookie header

      // Extract token from set-cookie header
      const rawCookies = Array.isArray(res.headers["set-cookie"]) // Check if set-cookie is an array
        ? res.headers["set-cookie"] // If it is, use it directly
        : [res.headers["set-cookie"]]; // If not, wrap it in an array

      const accessTokenCookie = rawCookies.find((cookie: string) =>  // Find the access_token cookie
        cookie.startsWith("access_token=") // Check if the cookie starts with access_token=
      );
      const token = accessTokenCookie?.split("=")[1]?.split(";")[0]; // Extract the token value

      if (!token) {
        throw new Error("Could not extract token from cookie"); // If token is not found, throw an error
      }

      const userId = res.body.user.id; // Extract userId from the response body

      const headers = {
        Cookie: `access_token=${token}`, // since the backend expects the token in the cookie to be named access_token like const token = req.cookies.access_token;
      };

      let workspaceId: string;

      cy.request({ 
        method: "GET",
        url: "http://localhost:5000/api/workspaces",
        headers, // Use the token in the headers
      }).then((workspaceRes: Cypress.Response<any>) => { // Check if the workspace request was successful
        expect(workspaceRes.status).to.eq(200); // Check if the status is 200
        workspaceId = workspaceRes.body[0]._id; // Extract the workspaceId from the response body

        cy.request({
          method: "POST",
          url: "http://localhost:5000/api/studies/register/study",
          headers,
          body: {
            name: "Cypress E2E Study",
            description: "Study for E2E testing",
            owner: userId,
            workspaceId: workspaceId, // Use the workspaceId from the previous request
            status: "draft", 
          },
        }).then((studyRes: Cypress.Response<any>) => {
          expect(studyRes.status).to.eq(201);
          const studyId = studyRes.body._id;

          cy.task("uploadComparison", { // Use the task to upload the comparison from the cypress.config.ts file
           // uploadComparison is a custom command since it uses form-data and node-fetch to send the request to the backend
           // this is a workaround to avoid CORS issues (since the backend is running on a different port) in Cypress
            studyId, // Use the studyId from the previous request
            token, // Use the token from the login response
          }).then((response: any) => { // Check if the upload was successful
            expect(response.status).to.eq(201);
          });
        });
      });
    });
  });
});
