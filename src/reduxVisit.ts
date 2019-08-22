import { INITIAL_STATE } from './util';
export default (
  url: string,
  options: { initialState: any } & Partial<Cypress.VisitOptions>
): Cypress.Chainable<Window> => {
  const { initialState, onBeforeLoad, ...visitOptions } = options;

  return cy.visit(url, {
    ...visitOptions,
    onBeforeLoad: window => {
      (window as any)[INITIAL_STATE] = initialState;

      Cypress.log({
        name: 'reduxVisit',
        displayName: 'Redux',
        message: ['initialized state'],
        consoleProps: () => ({
          state: initialState,
        }),
      });

      if (typeof onBeforeLoad === 'function') onBeforeLoad(window);
    },
  });
};
