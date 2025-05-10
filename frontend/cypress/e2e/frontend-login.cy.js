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

  it("logs in with valid credentials and creates a new study", () => {
    cy.get('input[type="email"]').type("gustavo@gmail.com");
    cy.get('input[type="password"]').type("gustav1");
    cy.get("form").submit();
  
    // Assert that we successfully navigated away from the login page
    cy.url().should("include", "/studies");

    cy.contains("Create Study").click();
    cy.url().should("include", "/create-study");

    // Fill in the form with valid data
    cy.get("#study-name").type("My New Study");
    cy.get("#study-description").type("This is a description of my new study.");

    // upload a cover image
    cy.get("#cover-image").selectFile("cypress/fixtures/DALL·E 2023-11-16 00.59.51 - An illustration of the Earth with a questioning expression, suitable for a children's educational website on climate action. The Earth should have a c.png", {force: true});
    // submit the form
    cy.get('button.primary-btn').contains("Save Study").click();
    cy.contains("Study created successfully! Now you can add comparisons.").should("exist");


    cy.contains("Done - View Study").click();
    cy.url().should("include", "/studies");
    cy.contains("My New Study").should("exist");
  });
  });

