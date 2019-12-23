function get(name, value) {
  const query = typeof value === 'undefined' ? `[data-e2e-${name}]` : `[data-e2e-${name}="${value}"]`
  return cy.get(query);
}

function repeat(times, fn) {
  for (let index = 0; index < times; index++) {
    fn(index);
  }
}

describe('Single player game', () => {
  it('can play the game', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        delete win.navigator.__proto__.serviceWorker
      }
    });
    get('confirm-settings').click();
    get('add-team').click();
    get('team-icon-option', 'paw').click();
    get('team-color-option', '#51ed80').click();
    get('confirm-teams').click();
    get('start-round', 'paw').click();

    const correctAnswersCount = 3;
    const wrongAnswersCount = 2;

    repeat(correctAnswersCount, () => {
      get('correct-answer').click();
    });

    repeat(wrongAnswersCount, () => {
      get('wrong-answer').click();
    });

    get('end-round').click();

    get('guessed-words-count', correctAnswersCount);
    get('passed-words-count', wrongAnswersCount);

    const correctAnswerReward = 10;
    const wrongAnswerPenalty = -1;
    const expectedResult = correctAnswersCount * correctAnswerReward + wrongAnswersCount * wrongAnswerPenalty;

    get('total-points', expectedResult);
    get('total-points-continue').click();
    cy.get(`[data-e2e-team="paw"], [data-e2e-team-points="paw-${expectedResult}"]`).should('exist');
    get('new-game').click();
    get('confirm-settings').should('exist');
  })
});