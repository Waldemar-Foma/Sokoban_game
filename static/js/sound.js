let backgroundMusic = new Audio('static/audio/background.mp3');
let moveSound = new Audio('static/audio/move.wav');
let winSound = new Audio('static/audio/win.wav');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;
moveSound.volume = 0.7;
winSound.volume = 0.8;

export function playMoveSound() {
    moveSound.currentTime = 0;
    moveSound.play();
}

export function playWinSound() {
    winSound.currentTime = 0;
    winSound.play();
}

export function toggleMusic(gameState) {
    if (gameState.isMusicOn) {
        backgroundMusic.pause();
        gameState.isMusicOn = false;
    } else {
        backgroundMusic.play();
        gameState.isMusicOn = true;
    }
}