/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to get element by data-cy attribute
       * @example cy.dataCy('submit-button')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/**
 * Login command
 */
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/auth");
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.include", "/auth", { timeout: 10000 });
});

/**
 * Logout command
 */
Cypress.Commands.add("logout", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.visit("/auth");
});

/**
 * Get by data-cy attribute
 */
Cypress.Commands.add("dataCy", (value: string) => {
  return cy.get(`[data-cy="${value}"]`);
});

export {};
