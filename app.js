const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const sleep = time => new Promise(res => setTimeout(res, time));

new Vue({
  el: '#root',
  data: {
    view: 'round-lobby',
    currentTeamIndex: 0,
    teams: [{ name: 'rocket', color: '#51ed80', points: 0 }, { name: 'paw', color: '#51ed80', points: 100, rank: 1 }, { name: 'beer', color: '#FF9580', points: 65 }, { name: 'cat', color: '#FF9580', points: 100, rank: 2 }],
    colors: ['#51ed80', '#5276E4', '#CE6ED5', '#FF73AC', '#FF9580', '#FFC763', '#F9F871'],
    showTeamOptions: false,
    selectedTeamOption: null,
    teamOptions: ['paw', 'cat', 'hippo', 'tree', 'graduation-cap', 'rocket', 'broom', 'anchor', 'cocktail', 'beer', 'skull-crossbones', 'bicycle', 'bomb', 'biohazard', 'bug', 'car', 'carrot', 'poo', 'bullhorn', 'glasses'],
    consumedIndexes: [],
    words: [],
    guessedWords: [],
    passedWords: [],
    rankCounter: 1,
    wordIndex: 0,
    timer: 0,
    animatingPoints: false,
    roundDuration: 6000,
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
    }
  },
  methods: {
    newGame() {
      this.view = 'new-game';
      this.rankCounter = 1;
      this.roundPoints = 0;
      this.teams = [];
    },
    cancelAddTeam() {
      this.showTeamOptions = false;
      this.selectedTeamOption = null;
    },
    removeTeam(team) {
      if (confirm('Poista joukkue?')) {
        this.teams = this.teams.filter(t => t !== team);
      }
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
      this.rankCounter = 1;
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

      await sleep(1000);
      this.currentTeam.points = clamp(this.currentTeam.points + this.roundPoints, 0, this.maxPoints);
      this.roundPoints = 0;
      await sleep(1000);

      if (this.currentTeam.points === this.maxPoints) {
        this.currentTeam.rank = this.rankCounter++;
      }

      this.animatingPoints = false;

      const allTeamsFinished = !this.teams.find(team => team.points < this.maxPoints);

      if (allTeamsFinished) {
        //do stuff...
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
      this.roundPoints += this.successPoints;
      this.randomizeWordIndex();
    },
    handleWrongAnswer() {
      this.passedWords.push(this.currentWord);
      this.roundPoints += this.failPoints;
      this.randomizeWordIndex();
    },
    randomizeWordIndex() {
      const element = document.querySelector('.current-word');

      if (element) {
        element.classList.add('current-word--bounce');

        setTimeout(() => {
          element.classList.remove('current-word--bounce');
        }, 400);
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
