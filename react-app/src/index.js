import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  return (
    <button className="square" onClick={props.onClick} 
                style={props.highlighted == true ?
              {backgroundColor: 'yellow'} : {}}
              >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
        highlighted={this.props.winningIndices !== undefined ? this.props.winningIndices.includes(i) : false}
      />
    );
  }

  render() {

    let rows = [];

    for(let rowNum = 0; rowNum < 3; rowNum++)
    {
      let currentRowChildren = [];

      for(let colNum = 0; colNum < 3; colNum++)
        currentRowChildren.push(this.renderSquare((rowNum * 3) + colNum));

      rows.push(React.createElement('div', {className: "board-row"},
          currentRowChildren));
    }

    let boardgrid = React.createElement('div', null,
      rows);

    return boardgrid;
  }
}

function calculateWinningLineIndex(squares) {
  const lines = Game.winningLines;
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return i;
    }
  }
  return null;
}

function getWinningTeam(squares, winningLineIndex)
{
  // get the first index of the winningLine
  return squares[Game.winningLines[winningLineIndex][0]];
}

function calculateDraw(squares)
{
  for(let i = 0; i < squares.length; i++)
  {
    if(!squares[i])
      return false;
  }

  return true;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        indexChanged: null,
      }],
      displayMovesForward: true,
      stepNumber: 0,
      xIsNext: true,
    };    
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if(calculateWinningLineIndex(squares) || squares[i])
    {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        indexChanged: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: this.getXIsNextByStep(step),
    });
  }

  getRowColByIndex(index)
  {
    let row = Math.floor(index / 3);
    let col = index % 3;

    return {
      row: row,
      col: col,
    }
  }

  getXIsNextByStep(step)
  {
    return (step % 2) === 0;
  }

  toggleClicked()
  {
    this.setState({
      displayMovesForward: !this.state.displayMovesForward,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningLineIndex = calculateWinningLineIndex(current.squares);
    const draw = calculateDraw(current.squares);

    let moves = history.map((step, move) => {
      let desc = move ? 
        'Go to move #' + move :
        'Go to game start';

      if(step.indexChanged !== null)
      {
        let rowCol = this.getRowColByIndex(step.indexChanged);
        desc += ' (' + rowCol.row + ',' + rowCol.col + ') ';
        desc += this.getXIsNextByStep(move - 1) ? 'X' : 'O';
      }

      return (
        <li key={move}>
          <button 
            onClick={() => this.jumpTo(move)}
            style={this.state.stepNumber === move ?
              {fontWeight: 'bold'} : 
              {fontWeight: 'normal'}}
            >
            {desc}
          </button>
        </li>
      );
    });

    if(!this.state.displayMovesForward)
      moves = moves.reverse();

    let toggleDesc = 'Change move order to ' + (this.state.displayMovesForward ? 'descending' : 'ascending');

    let status;
    if(winningLineIndex)
    {
      status = 'Winner: ' + getWinningTeam(current.squares, winningLineIndex);
    } else if(draw) {
      status = 'Draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningIndices={Game.winningLines[winningLineIndex]}
          />

        </div>
        <div className="game-info">
          <button onClick={() => this.toggleClicked()}>{toggleDesc}</button>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

Game.winningLines = 
    [ 
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
    ];

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
