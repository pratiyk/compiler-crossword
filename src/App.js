import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  return (
    <div className="pixel-app">
      <CompilerCrossword />
    </div>
  );
}

function CompilerCrossword() {
  const initialGrid = Array(12).fill().map(() =>
    Array(12).fill().map(() => ({ letter: '', number: null, across: false, down: false }))
  );

  const gridData = [
    { number: 1, clue: "Tokenizing phase (7)", answer: "LEXICAL", row: 0, col: 0, dir: 'across' },
    { number: 4, clue: "Syntax tree type (5)", answer: "PARSE", row: 2, col: 0, dir: 'across' },
    { number: 7, clue: "Identifier storage (6)", answer: "SYMBOL", row: 4, col: 2, dir: 'across' },
    { number: 9, clue: "Code improvement (12)", answer: "OPTIMIZATION", row: 6, col: 0, dir: 'across' },
    { number: 11, clue: "Grammar rules (6)", answer: "SYNTAX", row: 8, col: 3, dir: 'across' },
    { number: 13, clue: "IR format (9)", answer: "THREEADDR", row: 10, col: 2, dir: 'across' },

    { number: 2, clue: "Machine-independent code (11)", answer: "INTERMEDIATE", row: 0, col: 3, dir: 'down' },
    { number: 3, clue: "Optimization type (7)", answer: "PEEPHOL", row: 0, col: 5, dir: 'down' },
    { number: 5, clue: "Register process (8)", answer: "ALLOCATI", row: 2, col: 7, dir: 'down' },
    { number: 6, clue: "Meaning analysis (8)", answer: "SEMANTIC", row: 3, col: 9, dir: 'down' },
    { number: 8, clue: "Forward jumps fix (10)", answer: "BACKPATCHIN", row: 1, col: 1, dir: 'down' },
    { number: 10, clue: "Bottom-up parser (2)", answer: "LR", row: 7, col: 4, dir: 'down' },
    { number: 12, clue: "Token pattern match (6)", answer: "LEXEME", row: 8, col: 6, dir: 'down' },
  ];

  const initializeGrid = () => {
    const newGrid = JSON.parse(JSON.stringify(initialGrid));

    gridData.forEach(item => {
      const { row, col, dir, answer, number } = item;

      if (newGrid[row] && newGrid[row][col]) {
        newGrid[row][col].number = number;
      }

      for (let i = 0; i < answer.length; i++) {
        const r = dir === 'down' ? row + i : row;
        const c = dir === 'across' ? col + i : col;

        if (r < 12 && c < 12 && newGrid[r] && newGrid[r][c]) {
          newGrid[r][c][dir] = true;
        }
      }
    });

    return newGrid;
  };

  const initialClues = {
    across: gridData.filter(item => item.dir === 'across').map(item => ({
      number: item.number,
      clue: item.clue,
      answer: item.answer,
      startRow: item.row,
      startCol: item.col
    })),
    down: gridData.filter(item => item.dir === 'down').map(item => ({
      number: item.number,
      clue: item.clue,
      answer: item.answer,
      startRow: item.row,
      startCol: item.col
    }))
  };

  const termDefinitions = {
    "LEXICAL": "First compiler phase that converts characters to tokens.",
    "PARSE": "Tree representing syntactic structure of code.",
    "SYMBOL": "Data structure storing identifier information.",
    "OPTIMIZATION": "Compiler phase that improves code efficiency.",
    "SYNTAX": "Formal rules governing program structure.",
    "THREEADDR": "Intermediate representation using three-address code.",
    "INTERMEDIATE": "Machine-independent code between front and back ends.",
    "PEEPHOL": "Optimization examining short instruction sequences.",
    "ALLOCATI": "Process assigning variables to CPU registers.",
    "SEMANTIC": "Analysis checking program meaning and validity.",
    "BACKPATCHIN": "Resolving forward branches in code generation.",
    "LR": "Bottom-up parsing algorithm family.",
    "LEXEME": "Character sequence matched by token pattern."
  };

  const [grid, setGrid] = useState(initializeGrid());
  const [clues] = useState(initialClues);
  const [selectedCell, setSelectedCell] = useState(null);
  const [direction, setDirection] = useState('across');
  const [currentClue, setCurrentClue] = useState(null);
  const [completedTerms, setCompletedTerms] = useState([]);
  const [showDefinition, setShowDefinition] = useState('');
  const [pixelEffect, setPixelEffect] = useState(true);
  const [incorrectCells, setIncorrectCells] = useState([]);

  const handleCellSelect = (row, col) => {
    const acrossClues = clues.across.filter(clue =>
      row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length
    );
    const downClues = clues.down.filter(clue =>
      col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length
    );

    let newDirection = direction;
    let clue = null;

    if (direction === 'across' && acrossClues.length > 0) {
      clue = acrossClues[0];
    } else if (direction === 'down' && downClues.length > 0) {
      clue = downClues[0];
    } else if (acrossClues.length > 0) {
      newDirection = 'across';
      clue = acrossClues[0];
    } else if (downClues.length > 0) {
      newDirection = 'down';
      clue = downClues[0];
    }

    setSelectedCell({ row, col });
    setDirection(newDirection);
    setCurrentClue(clue || currentClue);
  };

  const handleKeyDown = (e) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newGrid = [...grid];

    if (e.key.match(/^[a-z]$/i)) {
      newGrid[row][col].letter = e.key.toUpperCase();
      setGrid(newGrid);
      moveToNextCell();
      checkForCompletion();
    } else if (e.key === 'Backspace') {
      if (newGrid[row][col].letter === '') {
        moveToPreviousCell();
      } else {
        newGrid[row][col].letter = '';
        setGrid(newGrid);
      }
      checkForCompletion();
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      let newRow = row;
      let newCol = col;
      if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
      else if (e.key === 'ArrowDown') newRow = Math.min(grid.length - 1, row + 1);
      else if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
      else if (e.key === 'ArrowRight') newCol = Math.min(grid[0].length - 1, col + 1);
      handleCellSelect(newRow, newCol);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setDirection(prev => (prev === 'across' ? 'down' : 'across'));
    }
  };

  const moveToNextCell = () => {
    if (!selectedCell || !currentClue) return;
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    if (direction === 'across') {
      newCol = col + 1;
      if (newCol >= currentClue.startCol + currentClue.answer.length) {
        newCol = currentClue.startCol;
      }
    } else {
      newRow = row + 1;
      if (newRow >= currentClue.startRow + currentClue.answer.length) {
        newRow = currentClue.startRow;
      }
    }

    setSelectedCell({ row: newRow, col: newCol });
  };

  const moveToPreviousCell = () => {
    if (!selectedCell || !currentClue) return;
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    if (direction === 'across') {
      newCol = col - 1;
      if (newCol < currentClue.startCol) {
        newCol = currentClue.startCol + currentClue.answer.length - 1;
      }
    } else {
      newRow = row - 1;
      if (newRow < currentClue.startRow) {
        newRow = currentClue.startRow + currentClue.answer.length - 1;
      }
    }

    setSelectedCell({ row: newRow, col: newCol });
  };

  const checkForCompletion = () => {
    if (!currentClue) return;
    const { startRow, startCol, answer, number } = currentClue;
    let completed = true;
    const newIncorrectCells = [];

    for (let i = 0; i < answer.length; i++) {
      const r = direction === 'across' ? startRow : startRow + i;
      const c = direction === 'across' ? startCol + i : startCol;
      
      if (grid[r][c].letter !== answer[i]) {
        completed = false;
        if (grid[r][c].letter !== '') {
          newIncorrectCells.push(`${r},${c}`);
        }
      }
    }

    setIncorrectCells(prev => {
      // Remove any cells from this clue that might have been marked incorrect before
      const filteredPrev = prev.filter(cell => {
        const [row, col] = cell.split(',').map(Number);
        return !(
          (direction === 'across' && 
           row === startRow && 
           col >= startCol && 
           col < startCol + answer.length) ||
          (direction === 'down' && 
           col === startCol && 
           row >= startRow && 
           row < startRow + answer.length)
        );
      });
      return [...filteredPrev, ...newIncorrectCells];
    });

    if (completed && !completedTerms.includes(number)) {
      setCompletedTerms([...completedTerms, number]);
      setShowDefinition(termDefinitions[answer]);
      setTimeout(() => setShowDefinition(''), 5000);
    }
  };

  const handleClueSelect = (clue, dir) => {
    setDirection(dir);
    setCurrentClue(clue);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
  };

  const togglePixelEffect = () => {
    setPixelEffect(!pixelEffect);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, direction, currentClue, grid]);

  return (
    <div className={`pixel-container ${pixelEffect ? 'pixel-effect' : ''}`}>
      <div className="pixel-header">
        <h1>COMPILER CROSSWORD</h1>
        <div className="pixel-controls">
          <button className="pixel-button" onClick={togglePixelEffect}>
            {pixelEffect ? "NORMAL MODE" : "PIXEL MODE"}
          </button>
        </div>
      </div>

      <div className="pixel-crossword">
        <div className="pixel-grid">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="pixel-row">
              {row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isHighlighted = currentClue &&
                  ((direction === 'across' &&
                    rowIndex === currentClue.startRow &&
                    colIndex >= currentClue.startCol &&
                    colIndex < currentClue.startCol + currentClue.answer.length) ||
                    (direction === 'down' &&
                      colIndex === currentClue.startCol &&
                      rowIndex >= currentClue.startRow &&
                      rowIndex < currentClue.startRow + currentClue.answer.length));
                const isActive = cell.across || cell.down;
                const isIncorrect = incorrectCells.includes(`${rowIndex},${colIndex}`);

                return (
                  <div
                    key={colIndex}
                    className={`pixel-cell ${isActive ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                    onClick={() => handleCellSelect(rowIndex, colIndex)}
                  >
                    {cell.number && <span className="cell-number">{cell.number}</span>}
                    <span className="cell-letter">{cell.letter}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="pixel-clues">
          <div className="clues-section">
            <h3 className="pixel-title">ACROSS</h3>
            <ul className="pixel-list">
              {clues.across.map(clue => (
                <li
                  key={clue.number}
                  className={`pixel-clue ${currentClue === clue ? 'selected' : ''} ${completedTerms.includes(clue.number) ? 'completed' : ''}`}
                  onClick={() => handleClueSelect(clue, 'across')}
                >
                  <span className="clue-number">{clue.number}.</span> {clue.clue}
                </li>
              ))}
            </ul>
          </div>

          <div className="clues-section">
            <h3 className="pixel-title">DOWN</h3>
            <ul className="pixel-list">
              {clues.down.map(clue => (
                <li
                  key={clue.number}
                  className={`pixel-clue ${currentClue === clue ? 'selected' : ''} ${completedTerms.includes(clue.number) ? 'completed' : ''}`}
                  onClick={() => handleClueSelect(clue, 'down')}
                >
                  <span className="clue-number">{clue.number}.</span> {clue.clue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showDefinition && (
        <div className="pixel-definition">
          <div className="definition-box">
            <h3>DEFINITION UNLOCKED!</h3>
            <p>{showDefinition}</p>
          </div>
        </div>
      )}

      <div className="pixel-instructions">
        <p>ARROWS: MOVE | TYPE: INPUT | TAB: SWITCH DIR | BKSP: DELETE</p>
      </div>
    </div>
  );
}

export default App;