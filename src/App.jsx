import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import defaultImage from './assets/pexels-plant.webp';

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;
const EMPTY_TILE_ID = TILE_COUNT;

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    if (imageUrl) {
      initializePuzzle();
    }
  }, [imageUrl]);

  const initializePuzzle = () => {
    const newTiles = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      newTiles.push({
        id: i + 1,
        img: imageUrl,
        position: `${-((i % GRID_SIZE) * 100)}% ${-Math.floor(i / GRID_SIZE) * 100}%`,
      });
    }
    newTiles[TILE_COUNT - 1].img = null;
    setTiles(newTiles);
    setMoveCount(0);
    setTimeout(() => {
      setIsScrambling(true);
      shuffleTiles(newTiles);
    }, 2000);
  };

  const shuffleTiles = (tilesArray) => {
    let solvable = false;
    while (!solvable) {
      for (let i = tilesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tilesArray[i], tilesArray[j]] = [tilesArray[j], tilesArray[i]];
      }
      solvable = isSolvable(tilesArray);
    }
    setTiles(tilesArray);
    setTimeout(() => setIsScrambling(false), 1000);
  };

  const moveTile = (index) => {
    if (isComplete || showPreview) return;
    const emptyIndex = tiles.findIndex((t) => t.id === EMPTY_TILE_ID);
    if (!isAdjacent(index, emptyIndex)) return;

    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoveCount(prevCount => prevCount + 1);

    if (isSolved(newTiles)) {
      setIsComplete(true);
      newTiles[TILE_COUNT-1].img = imageUrl;
      setTiles(newTiles);
      triggerConfetti();
    }
  };

  const isAdjacent = (index1, index2) => {
    const row1 = Math.floor(index1 / GRID_SIZE);
    const col1 = index1 % GRID_SIZE;
    const row2 = Math.floor(index2 / GRID_SIZE);
    const col2 = index2 % GRID_SIZE;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const isSolvable = (tilesArray) => {
    let inversionCount = 0;
    for (let i = 0; i < TILE_COUNT - 1; i++) {
      for (let j = i + 1; j < TILE_COUNT; j++) {
        if (tilesArray[i].id !== EMPTY_TILE_ID && tilesArray[j].id !== EMPTY_TILE_ID && tilesArray[i].id > tilesArray[j].id) {
          inversionCount++;
        }
      }
    }
    return inversionCount % 2 === 0;
  };

  const isSolved = (tilesArray) => {
    return tilesArray.every((tile, index) => tile.id === index + 1);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultImage = () => {
    setImageUrl(defaultImage);
  };

  const handlePreview = () => {
    setShowPreview(true);
    setTimeout(() => {
      setShowPreview(false);
    }, 500);
  };

  const handleAutoSolve = () => {
    const solvedTiles = Array.from({ length: TILE_COUNT }, (_, i) => ({
      id: i + 1,
      img: imageUrl,
      position: `${-((i % GRID_SIZE) * 100)}% ${-Math.floor(i / GRID_SIZE) * 100}%`,
    }));
    setTiles(solvedTiles);
    setIsComplete(true);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.4, 1)
      }));
      confetti(Object.assign({}, defaults, {
        particleCount: particleCount * 0.5,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#ffffff'],
        shapes: ['star']
      }));
    }, 250);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
       <h1 className="mb-6 md:mb-10 text-center">
        <span className="block text-4xl md:text-6xl font-bold font-['Brush Script MT', 'Brush Script Std', cursive] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 leading-tight tracking-wide mb-3" style={{textShadow: '2px 2px 4px rgba(255,215,0,0.2)'}}>
          Happy Anniversary
        </span>
        <span className="block text-2xl md:text-3xl font-medium font-['Lucida Handwriting', 'Brush Script MT', cursive] text-pink-200 italic" style={{textShadow: '1px 1px 2px rgba(255,105,180,0.3)'}}>
          Make this day special by solving this Puzzle!
        </span>
      </h1>
      <div className="flex flex-col items-center mb-4 w-full max-w-xs">
        <label htmlFor="file-upload" className="mb-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition duration-300 cursor-pointer font-semibold text-lg">
          Choose Your Special Photo
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={handleDefaultImage}
          className="mt-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-full shadow-md hover:bg-opacity-30 transition duration-300 font-medium"
        >
          Use Default Image
        </button>
        {imageUrl && (
          <button
            onClick={handlePreview}
            className="mt-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-full shadow-lg hover:from-yellow-500 hover:to-pink-600 transition duration-300 font-semibold text-lg"
          >
            Preview Puzzle
          </button>
        )}
      </div>
      {imageUrl && (
        <motion.div 
          className="grid grid-cols-3 gap-1 bg-white p-2 rounded-lg shadow-lg w-full max-w-xs md:max-w-md"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {tiles.map((tile, index) => (
              <motion.div
                key={tile.id}
                className={`w-full pb-[100%] relative ${
                  tile.id === EMPTY_TILE_ID && !isComplete && !showPreview ? 'bg-transparent' : 'bg-gray-200'
                } rounded-md cursor-pointer overflow-hidden`}
                onClick={() => moveTile(index)}
                layout
                initial={isScrambling ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30,
                  duration: isScrambling ? 0.5 : 0.3
                }}
              >
                {(tile.img || showPreview) && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '300%',
                      height: '300%',
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: showPreview ? `${-((index % GRID_SIZE) * 100)}% ${-Math.floor(index / GRID_SIZE) * 100}%` : tile.position,
                      backgroundSize: '300% 300%',
                      transform: 'scale(0.33333)',
                      transformOrigin: 'top left',
                    }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:mt-8 text-2xl md:text-3xl font-bold text-center"
        >
          <p className="mb-2 text-rose-700">🎉 Congratulations 🎉</p>
          <p className="text-xl md:text-2xl text-pink-200">You've solved the puzzle of love in {moveCount} moves!</p>
          <p className="text-lg md:text-xl mt-2 text-amber-200">May your journey together be as beautiful as this moment.</p>
        </motion.div>
      )}
      {!isComplete && imageUrl && moveCount >= 10 && (
        <button
          onClick={handleAutoSolve}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300 font-semibold text-lg"
        >
          Need a little help? Click here to complete the puzzle!
        </button>
      )}
    </div>
  );
};

export default App;
