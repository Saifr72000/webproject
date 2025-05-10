/// <reference types="cypress" />

describe("Frontend Login Flow", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/auth/refresh-token", {
      statusCode: 200,
      body: { accessToken: "mock.token" },
    });

    cy.visit("http://localhost:3001/login");
  });

  it("shows login form", () => {
    cy.get("form", { timeout: 10000 }).should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
  });

  it("fails to log in with invalid credentials", () => {
    cy.get('input[type="email"]').type("wrong@example.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get("form").submit();

    cy.contains("Invalid email or password.").should("exist");
  });

  it("logs in with valid credentials", () => {
    cy.get('input[type="email"]').type("gustavo@gmail.com");
    cy.get('input[type="password"]').type("gustav1");
    cy.get("form").submit();
  
    // Assert that we successfully navigated away from the login page
    cy.url().should("include", "/studies");
  });
  });

