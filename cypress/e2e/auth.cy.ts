/// <reference types="cypress" />

describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/auth");
  });

  it("should display the login page", () => {
    cy.url().should("include", "/auth");
    cy.get('#email').should("be.visible");
    cy.get('#password').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("should show error with invalid credentials", () => {
    cy.fixture("user").then((user) => {
      cy.get('#email').type(user.invalidUser.email);
      cy.get('#password').type(user.invalidUser.password);
      cy.get('button[type="submit"]').click();

      // Should show error message or remain on auth page
      cy.url().should("include", "/auth");
      
      // Wait for potential error message
      cy.get('.auth-message', { timeout: 10000 }).should('exist');
    });
  });

  it("should login with valid credentials", () => {
    cy.fixture("user").then((user) => {
      cy.login(user.validUser.email, user.validUser.password);

      // Should redirect away from auth
      cy.url().should("not.include", "/auth");

      // Should have tokens in localStorage
      cy.window().then((win) => {
        const token = win.localStorage.getItem("alpha_token");
        expect(token).to.not.be.null;
      });
    });
  });

  it("should logout successfully", () => {
    cy.fixture("user").then((user) => {
      // Login first
      cy.login(user.validUser.email, user.validUser.password);

      // Then logout
      cy.logout();

      // Should be on auth page
      cy.url().should("include", "/auth");

      // Should not have tokens
      cy.window().then((win) => {
        const token = win.localStorage.getItem("alpha_token");
        expect(token).to.be.null;
      });
    });
  });

  it("should require fields to login", () => {
    // Submit button should be disabled when fields are empty
    cy.get('button[type="submit"]').should("be.disabled");
    
    // Fill email only
    cy.get('#email').type("test@example.com");
    cy.get('button[type="submit"]').should("be.disabled");
    
    // Clear and fill password only
    cy.get('#email').clear();
    cy.get('#password').type("password123");
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("should navigate to forgot password", () => {
    // Look for forgot password link/button
    cy.contains(/esqueceu|forgot/i).should("exist");
  });
});
