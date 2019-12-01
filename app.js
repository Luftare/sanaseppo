const WORD_SETS = [{
  label: 'Helppoja sanoja',
  url: 'api/easy.json'
}, {
  label: 'Suomen kielen sanat',
  url: 'api/words.json'
}, {
  label: 'Maiden nimet',
  url: 'api/nations.json'
}, {
  label: 'Nisäkkäät, linnut ja kalat',
  url: 'api/finnish-animals.json'
}];

const MODES = [[10, -1], [5, -1], [5, 0], [10, -10]].map(([correctPoints, passPoints]) => ({
  correctPoints, passPoints,
  label: `Oikea: +${correctPoints}p, väärä: ${passPoints}p`
}));

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const sleep = time => new Promise(res => setTimeout(res, time));

new Vue({
  el: '#root',
  data: {
    view: 'settings',
    wordSets: WORD_SETS,
    selectedWordSet: WORD_SETS[0],
    modes: MODES,
    selectedMode: MODES[0],
    currentTeamIndex: 0,
    teams: [],
    colors: ['#51ed80', '#3bccc2', '#5276E4', '#CE6ED5', '#FF73AC', '#e65755', '#FFC763', '#F9F871', '#9eada2'],
    showTeamOptions: false,
    selectedTeamOption: null,
    teamOptions: ['paw', 'cat', 'hippo', 'graduation-cap', 'rocket', 'broom', 'anchor', 'cocktail', 'beer', 'skull-crossbones', 'bicycle', 'bomb', 'biohazard', 'bug', 'carrot', 'poo', 'bullhorn', 'glasses'],
    consumedIndexes: [],
    words: [],
    guessedWords: [],
    passedWords: [],
    wordIndex: 0,
    timer: 0,
    animatingPoints: false,
    loading: false,
    roundDuration: 60000,
    tickInterval: 100,
    maxPoints: 100,
    roundPoints: 0,
    successPoints: 5,
    failPoints: -1
  },
  async mounted() {
    const response = await fetch('api/words.json');
    this.words = await response.json();
    this.randomizeWordIndex();

    setInterval(() => this.handleTick(), this.tickInterval);
  },
  computed: {
    availableTeams() {
      return this.teamOptions.filter(name => !this.teams.map(({ name }) => name).includes(name));
    },
    currentWord() {
      return this.words[this.wordIndex];
    },
    gameRunning() {
      return this.timer > 0;
    },
    relativeTimeLeft() {
      return this.timer / this.roundDuration;
    },
    timerStyle() {
      return `${this.relativeTimeLeft * 100}%`;
    },
    currentTeam() {
      return this.teams[this.currentTeamIndex];
    },
  },
  methods: {
    async confirmSettings() {
      this.loading = true;
      const response = await fetch(this.selectedWordSet.url);
      this.words = await response.json();
      this.loading = false;
      this.view = 'new-game';
    },
    newGame() {
      if (!confirm('Haluatko lopettaa nykyisen pelin?')) return;

      this.view = 'settings';
      this.currentTeamIndex = 0;
      this.roundPoints = 0;
      this.teams = [];
    },
    cancelAddTeam() {
      this.showTeamOptions = false;
      this.selectedTeamOption = null;
    },
    removeTeam(team) {
      if (!confirm('Haluatko poistaa joukkueen?')) return;

      this.teams = this.teams.filter(t => t !== team);
    },
    showTeamOptionsModal() {
      this.showTeamOptions = true;
    },
    selectTeamColor(color) {
      this.teams.push({ name: this.selectedTeamOption, color, points: 0, rank: null });
      this.selectedTeamOption = null;
    },
    selectTeamOption(optionName) {
      this.selectedTeamOption = optionName;
      this.showTeamOptions = false;
    },
    startGame() {
      this.view = 'round-lobby';
      this.roundPoints = 0;
    },
    startRound() {
      this.view = 'guess-word';
      this.randomizeWordIndex();
      this.timer = this.roundDuration;
      this.guessedWords = [];
      this.passedWords = [];
    },
    handleTick() {
      const previousTime = this.timer;
      this.timer = Math.max(0, this.timer - this.tickInterval);
      const timeDidEnd = previousTime > 0 && this.timer === 0;

      if (timeDidEnd) {
        this.handleTimeEnd();
      }
    },
    handleTimeEnd() {
      this.view = 'round-recap';
    },
    async countRoundPoints() {
      this.animatingPoints = true;
      this.view = 'round-lobby';

      await sleep(500);
      this.currentTeam.points = clamp(this.currentTeam.points + this.roundPoints, 0, this.maxPoints);
      this.roundPoints = 0;
      await sleep(500);

      if (this.currentTeam.points === this.maxPoints) {
        const maxRank = this.teams.reduce((maxRank, team) => Math.max(maxRank, team.rank || 0), 0);
        this.currentTeam.rank = maxRank + 1;
      }

      this.animatingPoints = false;

      const allTeamsFinished = !this.teams.find(team => team.points < this.maxPoints);

      if (allTeamsFinished) {
        alert('Peli loppui!');
        return;
      } else {
        let nextIndex = (this.currentTeamIndex + 1) % this.teams.length;

        while (this.teams[nextIndex].points >= this.maxPoints) {
          nextIndex = (nextIndex + 1) % this.teams.length;
        }

        this.currentTeamIndex = nextIndex;
      }
    },
    handleCorrectAnswer() {
      this.guessedWords.push(this.currentWord);
      this.roundPoints += this.selectedMode.correctPoints;
      this.randomizeWordIndex();
    },
    handleWrongAnswer() {
      this.passedWords.push(this.currentWord);
      this.roundPoints += this.selectedMode.passPoints;
      this.randomizeWordIndex();
    },
    skipRound() {
      this.timer = 0;
      this.handleTimeEnd();
    },
    randomizeWordIndex() {
      const element = document.querySelector('.current-word');

      if (element) {
        element.classList.add('current-word--bounce');

        setTimeout(() => {
          element.classList.remove('current-word--bounce');
        }, 400);
      }

      const wordsLeft = this.words.length - this.consumedIndexes.length;

      if (wordsLeft < 10) {
        this.consumedIndexes = [];
      }

      let index = this.getRandomWordIndex();

      while (this.consumedIndexes.includes(index)) {
        index = this.getRandomWordIndex();
      }

      this.wordIndex = index;
    },
    getRandomWordIndex() {
      return Math.floor(Math.random() * this.words.length);
    }
  }
});
