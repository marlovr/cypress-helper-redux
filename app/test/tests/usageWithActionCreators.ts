import rootAction from '../../src/store/rootAction';

describe('Redux Helper: Usage with action creators', () => {
  before(() => {
    cy.visit('/');
  });

  describe('redux', () => {
    it('gets action creators', () => {
      cy.redux((_, actions) => {
        expect(actions)
          .to.be.an('object')
          .that.has.all.keys(rootAction);
      });
    });
  });

  describe('reduxDispatch', () => {
    it('gets action creators', () => {
      cy.reduxDispatch(actions => {
        expect(actions)
          .to.be.an('object')
          .that.has.all.keys(rootAction);
        return [];
      });
    });
  });
});
