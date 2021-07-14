//  Classe para gerir as classificações dos jogadores
class Ranking {
  ranking = [];

  constructor(ranking = []) {
    if (ranking.length) {
      this.ranking = ranking;
    } else {
      const savedRanking = localStorage.getItem('ranking');
      if (savedRanking) {
        this.ranking = JSON.parse(savedRanking);
      }
    }
  }

  // Adicionar pontuação nova 
  addNewPontuation(username) {
    const index = this.ranking.findIndex((r) => r.username === username);
    if (index >= 0) {
      this.ranking[index] = { username, points: this.ranking[index].points + 1};
    } else {
      this.ranking.push({ username, points: 1 });
    }
    this._sortRanking();
  }

  //  Ordenar pontuação
  _sortRanking() {
    this.ranking.sort((a, b) => {
      return b.points - a.points;
    });
  }

  // Criar/atualizar o ranking no HTML 
  renderRanking(localRanking = true) {
    if (!localRanking) {
      api.ranking(
        (response) => {
          this.ranking = [];
          response.ranking.forEach((position) => {
            this.ranking.push({ username: position.nick, points: position.victories });
          });
          this._sortRanking();
          this._renderRanking();
        }
      );
    }
    this._sortRanking();
    this._renderRanking();
  }

  _renderRanking() {
    localStorage.setItem('ranking', JSON.stringify(this.ranking));
    const rankingElement = document.querySelector('[data-ranking-table]');
    const childs = document.querySelector('[data-ranking-table] > div');
    if (childs) {
      rankingElement.innerHTML = '';
    }
    
    rankingElement.appendChild(
      this._getRankingRowElement("#", "Utilizador", "Pontuação", true)
    );

    this.ranking.forEach((row, index) => {
      rankingElement.appendChild(this._getRankingRowElement(index + 1, row.username, row.points));
    });
  }

   // Obter uma linha nova (uma linha por cada jogo feito, neste caso)
  _getRankingRowElement(cardinal, username, points, isHeader = false) {
    const columnClasses = ['ranking-column'];
    if (isHeader) {
      columnClasses.push('ranking-column-header');
    }

    const rankingRowHtml = document.createElement('div');
    rankingRowHtml.classList.add('ranking-row');

    const rankingColumnClassificationHtml = document.createElement('div');
    rankingColumnClassificationHtml.classList.add(...columnClasses);
    rankingColumnClassificationHtml.textContent = cardinal;

    const rankingColumnUsernameHtml = document.createElement('div');
    rankingColumnUsernameHtml.classList.add(...columnClasses);
    rankingColumnUsernameHtml.textContent = username;

    const rankingColumnPointsHtml = document.createElement('div');
    rankingColumnPointsHtml.classList.add(...columnClasses);
    rankingColumnPointsHtml.textContent = points;

    rankingRowHtml.appendChild(rankingColumnClassificationHtml);
    rankingRowHtml.appendChild(rankingColumnUsernameHtml);
    rankingRowHtml.appendChild(rankingColumnPointsHtml);

    return rankingRowHtml;
  }
}
