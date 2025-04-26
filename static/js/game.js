import { levels } from './levels.js';

// Game State
const gameState = {
    currentLevel: 0,
    manPos: { x: 0, y: 0 },
    cells: [],
    steps: 0,
    time: 0,
    timer: null,
    language: 'en',
    isDarkMode: false,
    completedLevels: new Set(),
    originalMap: null // Добавляем для хранения исходного состояния уровня
};

// DOM Elements
const elements = {
    loadingScreen: document.querySelector('.loading-screen'),
    mainMenu: document.querySelector('.main-menu'),
    levelsMenu: document.querySelector('.levels-menu'),
    settingsMenu: document.querySelector('.settings-menu'),
    gameContainer: document.querySelector('.game-container'),
    gameMap: document.querySelector('#game-map'),
    levelsContainer: document.querySelector('#levels-container'),
    stepsCounter: document.querySelector('#steps-counter'),
    timerDisplay: document.querySelector('#timer'),
    levelName: document.querySelector('[data-level-name]'),
    winModal: document.querySelector('.win-modal'),
    winTime: document.querySelector('#win-time'),
    winSteps: document.querySelector('#win-steps'),
    languageSelect: document.querySelector('#language-select'),
    themeToggle: document.querySelector('#theme-toggle')
};

// Buttons
const buttons = {
    playBtn: document.querySelector('#play-btn'),
    settingsBtn: document.querySelector('#settings-btn'),
    backToMenu: document.querySelector('#back-to-menu'),
    backToMenuSettings: document.querySelector('#back-to-menu-settings'),
    resetLevel: document.querySelector('#reset-level'),
    backToLevels: document.querySelector('#back-to-levels'),
    nextLevel: document.querySelector('#next-level'),
    backToLevelsWin: document.querySelector('#back-to-levels-win')
};

// Translations
const translations = {
    en: {
        play: 'Play',
        settings: 'Settings',
        selectLevel: 'Select Level',
        back: 'Back',
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        reset: 'Reset',
        levels: 'Levels',
        youWin: 'You Win!',
        time: 'Time',
        steps: 'Steps',
        nextLevel: 'Next Level'
    },
    ru: {
        play: 'Играть',
        settings: 'Настройки',
        selectLevel: 'Выберите уровень',
        back: 'Назад',
        language: 'Язык',
        theme: 'Тема',
        light: 'Светлая',
        dark: 'Тёмная',
        reset: 'Сброс',
        levels: 'Уровни',
        youWin: 'Победа!',
        time: 'Время',
        steps: 'Шаги',
        nextLevel: 'Следующий уровень'
    }
};

// Initialize the game
function init() {
    // Simulate loading
    setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
            showMainMenu();
        }, 500);
    }, 3500);

    // Load saved settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render level buttons
    renderLevelButtons();
}

// Setup event listeners
function setupEventListeners() {
    // Menu buttons
    buttons.playBtn.addEventListener('click', showLevelsMenu);
    buttons.settingsBtn.addEventListener('click', showSettingsMenu);
    
    // Back buttons
    buttons.backToMenu.addEventListener('click', showMainMenu);
    buttons.backToMenuSettings.addEventListener('click', showMainMenu);
    buttons.backToLevels.addEventListener('click', showLevelsMenu);
    buttons.backToLevelsWin.addEventListener('click', showLevelsMenu);
    
    // Game buttons
    buttons.resetLevel.addEventListener('click', resetLevel);
    buttons.nextLevel.addEventListener('click', loadNextLevel);
    
    // Settings
    elements.languageSelect.addEventListener('change', updateLanguage);
    elements.themeToggle.addEventListener('change', toggleTheme);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Show main menu
function showMainMenu() {
    elements.mainMenu.style.display = 'flex';
    elements.levelsMenu.style.display = 'none';
    elements.settingsMenu.style.display = 'none';
    elements.gameContainer.style.display = 'none';
}

// Show levels menu
function showLevelsMenu() {
    elements.mainMenu.style.display = 'none';
    elements.levelsMenu.style.display = 'flex';
    elements.settingsMenu.style.display = 'none';
    elements.gameContainer.style.display = 'none';
}

// Show settings menu
function showSettingsMenu() {
    elements.mainMenu.style.display = 'none';
    elements.levelsMenu.style.display = 'none';
    elements.settingsMenu.style.display = 'flex';
    elements.gameContainer.style.display = 'none';
}

// Show game
function showGame() {
    elements.mainMenu.style.display = 'none';
    elements.levelsMenu.style.display = 'none';
    elements.settingsMenu.style.display = 'none';
    elements.gameContainer.style.display = 'flex';
}

// Render level buttons
function renderLevelButtons() {
    elements.levelsContainer.innerHTML = '';
    
    levels.forEach((level, index) => {
        const levelBtn = document.createElement('button');
        levelBtn.className = 'level-btn';
        if (gameState.completedLevels.has(index)) {
            levelBtn.classList.add('completed');
        }
        levelBtn.textContent = index + 1;
        levelBtn.addEventListener('click', () => loadLevel(index));
        elements.levelsContainer.appendChild(levelBtn);
    });
}

// Load level
function loadLevel(levelIndex) {
    gameState.currentLevel = levelIndex;
    gameState.manPos = { x: 0, y: 0 };
    gameState.steps = 0;
    gameState.time = 0;
    gameState.cells = [];
    
    clearInterval(gameState.timer);
    
    const level = levels[levelIndex];
    elements.levelName.textContent = `Level ${levelIndex + 1}`;
    
    // Сохраняем оригинальную карту для сброса
    gameState.originalMap = JSON.parse(JSON.stringify(level.map));
    
    createBoard(level.map);
    updateStats();
    startTimer();
    
    showGame();
}

// Load next level
function loadNextLevel() {
    const nextLevel = gameState.currentLevel + 1;
    if (nextLevel < levels.length) {
        hideWinModal();
        loadLevel(nextLevel);
    } else {
        hideWinModal();
        showLevelsMenu();
    }
}

// Reset level
function resetLevel() {
    // Восстанавливаем оригинальную карту
    levels[gameState.currentLevel].map = JSON.parse(JSON.stringify(gameState.originalMap));
    
    // Полный сброс состояния
    gameState.steps = 0;
    gameState.time = 0;
    clearInterval(gameState.timer);
    
    // Находим начальную позицию игрока
    findPlayerPosition();
    
    createBoard(levels[gameState.currentLevel].map);
    updateStats();
    startTimer();
}

// Find player position
function findPlayerPosition() {
    const level = levels[gameState.currentLevel].map;
    for (let x = 0; x < level.length; x++) {
        for (let y = 0; y < level[x].length; y++) {
            if (level[x][y] === 4 || level[x][y] === 6) {
                gameState.manPos = { x, y };
                return;
            }
        }
    }
}

// Create game board
function createBoard(levelMap) {
    elements.gameMap.innerHTML = '';
    
    for (let x = 0; x < levelMap.length; x++) {
        const row = document.createElement('div');
        row.className = 'row';
        gameState.cells[x] = [];
        
        for (let y = 0; y < levelMap[x].length; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Set cell type based on map value
            switch (levelMap[x][y]) {
                case 1: // Wall
                    cell.classList.add('wall');
                    break;
                case 2: // Box
                    cell.classList.add('box');
                    cell.innerHTML = '<i class="fas fa-cube"></i>';
                    break;
                case 3: // Target
                    cell.classList.add('krest');
                    cell.innerHTML = '<i class="fas fa-bullseye"></i>';
                    break;
                case 4: // Player
                    cell.classList.add('man');
                    cell.innerHTML = '<i class="fas fa-user"></i>';
                    gameState.manPos = { x, y };
                    break;
                case 5: // Box on target
                    cell.classList.add('box-on-krest');
                    cell.innerHTML = '<i class="fas fa-cube"></i>';
                    break;
                case 6: // Player on target
                    cell.classList.add('man-on-krest');
                    cell.innerHTML = '<i class="fas fa-user"></i>';
                    gameState.manPos = { x, y };
                    break;
                default: // Empty
                    break;
            }
            
            row.appendChild(cell);
            gameState.cells[x][y] = cell;
        }
        
        elements.gameMap.appendChild(row);
    }
}

// Update game stats
function updateStats() {
    elements.stepsCounter.textContent = gameState.steps;
    
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start timer
function startTimer() {
    clearInterval(gameState.timer);
    gameState.time = 0;
    updateStats();
    
    gameState.timer = setInterval(() => {
        gameState.time++;
        updateStats();
    }, 1000);
}

// Handle keyboard input
function handleKeyPress(e) {
    if (elements.gameContainer.style.display !== 'flex') return;
    
    let dx = 0, dy = 0;
    
    switch (e.key) {
        case 'ArrowUp':
            dy = -1;
            break;
        case 'ArrowDown':
            dy = 1;
            break;
        case 'ArrowLeft':
            dx = -1;
            break;
        case 'ArrowRight':
            dx = 1;
            break;
        case 'r':
        case 'R':
            resetLevel();
            return;
        default:
            return;
    }
    
    movePlayer(dx, dy);
}

// Move player
function movePlayer(dx, dy) {
    const level = levels[gameState.currentLevel].map;
    const { x, y } = gameState.manPos;
    const newX = x + dx;
    const newY = y + dy;
    
    // Check boundaries
    if (newX < 0 || newX >= level.length || newY < 0 || newY >= level[0].length) {
        return;
    }
    
    const targetCell = level[newX][newY];
    
    // Wall - can't move
    if (targetCell === 1) {
        return;
    }
    
    // Box - need to push
    if (targetCell === 2 || targetCell === 5) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;
        
        // Check if box can be pushed
        if (boxNewX < 0 || boxNewX >= level.length || boxNewY < 0 || boxNewY >= level[0].length) {
            return;
        }
        
        const boxTargetCell = level[boxNewX][boxNewY];
        
        // Box can't be pushed into wall or another box
        if (boxTargetCell === 1 || boxTargetCell === 2 || boxTargetCell === 5) {
            return;
        }
        
        // Move box
        if (boxTargetCell === 3 || boxTargetCell === 6) {
            level[boxNewX][boxNewY] = 5; // Box on target
        } else {
            level[boxNewX][boxNewY] = 2; // Box
        }
        
        // Remove box from old position
        if (targetCell === 5) {
            level[newX][newY] = 3; // Target
        } else {
            level[newX][newY] = 0; // Empty
        }
    }
    
    // Move player
    const currentCell = level[x][y];
    if (currentCell === 6) {
        level[x][y] = 3; // Restore target under player
    } else {
        level[x][y] = 0; // Empty
    }
    
    if (targetCell === 3 || targetCell === 6) {
        level[newX][newY] = 6; // Player on target
    } else {
        level[newX][newY] = 4; // Player
    }
    
    gameState.manPos = { x: newX, y: newY };
    gameState.steps++;
    updateStats();
    createBoard(level);
    
    // Check win condition
    checkWinCondition();
}

// Check win condition
function checkWinCondition() {
    const level = levels[gameState.currentLevel].map;
    let hasBoxes = false;
    
    for (let x = 0; x < level.length; x++) {
        for (let y = 0; y < level[x].length; y++) {
            if (level[x][y] === 2) { // Box not on target
                hasBoxes = true;
                break;
            }
        }
        if (hasBoxes) break;
    }
    
    if (!hasBoxes) {
        gameState.completedLevels.add(gameState.currentLevel);
        showWinModal();
    }
}

// Show win modal
function showWinModal() {
    clearInterval(gameState.timer);
    
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    elements.winTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.winSteps.textContent = gameState.steps;
    elements.winModal.style.display = 'flex';
    
    // Disable next level button if it's the last level
    if (gameState.currentLevel === levels.length - 1) {
        buttons.nextLevel.style.display = 'none';
    } else {
        buttons.nextLevel.style.display = 'flex';
    }
}

// Hide win modal
function hideWinModal() {
    elements.winModal.style.display = 'none';
}

// Update language
function updateLanguage() {
    gameState.language = elements.languageSelect.value;
    saveSettings();
    
    const lang = translations[gameState.language];
    
    // Update all elements with data-lang attribute
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (lang[key]) {
            el.textContent = lang[key];
        }
    });
}

// Toggle theme
function toggleTheme() {
    gameState.isDarkMode = elements.themeToggle.checked;
    document.body.classList.toggle('dark', gameState.isDarkMode);
    saveSettings();
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('sokobanSettings')) || {};
    
    if (settings.language) {
        gameState.language = settings.language;
        elements.languageSelect.value = gameState.language;
    }
    
    if (settings.isDarkMode !== undefined) {
        gameState.isDarkMode = settings.isDarkMode;
        elements.themeToggle.checked = gameState.isDarkMode;
        document.body.classList.toggle('dark', gameState.isDarkMode);
    }
    
    if (settings.completedLevels) {
        gameState.completedLevels = new Set(settings.completedLevels);
    }
    
    updateLanguage();
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        language: gameState.language,
        isDarkMode: gameState.isDarkMode,
        completedLevels: Array.from(gameState.completedLevels)
    };
    
    localStorage.setItem('sokobanSettings', JSON.stringify(settings));
}

document.addEventListener('DOMContentLoaded', init);