// Seletores do jogo
const startScreen = document.querySelector('.start-screen');
const startButton = document.querySelector('.start-button');
const julia = document.querySelector('.julia');
const gameBoard = document.querySelector('.game-board');
const scoreDisplay = document.querySelector('.score-display');
const background = document.querySelector('.background');

// Elementos de obstáculos
const shoeObstacle = document.querySelector('.obstacle.shoe');
const bagObstacle = document.querySelector('.obstacle.bag');
const jewelryObstacle = document.querySelector('.obstacle.jewelry');
const allObstacles = [shoeObstacle, bagObstacle, jewelryObstacle];

// Elementos de pontuação e game over
const gameOverScreen = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');
const finalScoreElement = document.querySelector('.final-score');
const finalHighScoreElement = document.querySelector('.final-high-score');

// Variáveis do jogo
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isScoring = false;
let gameLoop;
let currentObstacle = null;

// Configurações dos obstáculos
const obstacleSettings = {
    shoe: { speed: 1.5, points: 1 },
    bag: { speed: 1.8, points: 2 },
    jewelry: { speed: 2.0, points: 3 }
};

// Inicializar displays
highScoreElement.textContent = `Recorde: ${highScore}`;
finalHighScoreElement.textContent = `Recorde: ${highScore}`;

// Esconder elementos do jogo inicialmente
gameBoard.style.display = 'none';
scoreDisplay.style.display = 'none';
allObstacles.forEach(obs => obs.style.display = 'none');

// Função de pulo
const jump = () => {
    if (!gameStarted) return;
    
    julia.classList.add('jump');

    setTimeout(() => {
        julia.classList.remove('jump');
    }, 500);
}

// Atualizar pontuação
const updateScore = (points = 1) => {
    score += points;
    scoreElement.textContent = `Pontuação: ${score}`;
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `Recorde: ${highScore}`;
        finalHighScoreElement.textContent = `Recorde: ${highScore}`;
        localStorage.setItem('highScore', highScore);
    }
}

// Selecionar obstáculo aleatório
const getRandomObstacle = () => {
    // Esconder obstáculo atual
    if (currentObstacle) {
        currentObstacle.style.display = 'none';
        currentObstacle.style.animation = 'none';
    }
    
    // Escolher aleatoriamente um novo obstáculo
    const randomIndex = Math.floor(Math.random() * allObstacles.length);
    const newObstacle = allObstacles[randomIndex];
    const obstacleType = newObstacle.classList[1]; // 'shoe', 'bag' ou 'jewelry'
    const speed = obstacleSettings[obstacleType].speed;
    
    // Configurar novo obstáculo
    newObstacle.style.display = 'block';
    newObstacle.style.animation = `obstacle-animation ${speed}s infinite linear`;
    newObstacle.style.right = '-80px';
    
    currentObstacle = newObstacle;
    return { element: newObstacle, type: obstacleType };
}

// Lógica principal do jogo
const startGameLoop = () => {
    // Começar com um obstáculo aleatório
    let { element: currentObstacle, type: currentType } = getRandomObstacle();
    
    gameLoop = setInterval(() => {
        const obstaclePosition = currentObstacle.offsetLeft;
        const juliaPosition = +window.getComputedStyle(julia).bottom.replace('px', '');
        const backgroundPosition = +window.getComputedStyle(background).left.replace('px', '');

        // Verificar se passou do obstáculo
        if (obstaclePosition <= 0 && !isScoring) {
            isScoring = true;
            updateScore(obstacleSettings[currentType].points);
            
            // Gerar novo obstáculo após passar do atual
            setTimeout(() => {
                const newObstacle = getRandomObstacle();
                currentObstacle = newObstacle.element;
                currentType = newObstacle.type;
            }, 100);
        }
        
        // Resetar flag de pontuação
        if (obstaclePosition > 0 && isScoring) {
            isScoring = false;
        }

        // Verificar colisão
        const collisionRange = currentType === 'jewelry' ? 70 : 60;
        if (obstaclePosition <= 100 && obstaclePosition > 0 && juliaPosition < collisionRange) {
            // Atualizar displays finais
            finalScoreElement.textContent = `Pontuação: ${score}`;
            
            // Parar animações
            currentObstacle.style.animation = 'none';
            currentObstacle.style.left = `${obstaclePosition}px`;

            julia.style.animation = 'none';
            julia.style.bottom = `${juliaPosition}px`;

            // Mudar imagem para game over
            julia.src = 'assets/imgs/game-over.png';
            julia.style.width = '70px';
            julia.style.marginLeft = '35px';

            background.style.animation = 'none';
            background.style.left = `${backgroundPosition}px`;

            // Mostrar tela de game over
            gameOverScreen.style.visibility = 'visible';

            // Parar o loop do jogo
            clearInterval(gameLoop);
        }
    }, 10);
}

// Reiniciar jogo
const restartGame = () => {
    // Resetar tela de game over
    gameOverScreen.style.visibility = 'hidden';

    // Esconder todos os obstáculos
    allObstacles.forEach(obs => {
        obs.style.display = 'none';
        obs.style.animation = 'none';
    });
    currentObstacle = null;

    // Resetar personagem
    julia.src = 'assets/imgs/mario.gif';
    julia.style.width = '120px';
    julia.style.bottom = '0px';
    julia.style.marginLeft = '';
    julia.style.animation = '';

    // Resetar fundo
    background.style.animation = 'background-scroll 20s infinite linear';
    background.style.left = '';
    
    // Resetar pontuação
    score = 0;
    scoreElement.textContent = `Pontuação: ${score}`;
    isScoring = false;

    // Reiniciar loop do jogo
    startGameLoop();
}

// Iniciar jogo
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameBoard.style.display = 'block';
    scoreDisplay.style.display = 'block';
    gameStarted = true;
    
    // Iniciar loop do jogo
    startGameLoop();
});

// Event listeners
document.addEventListener('keydown', jump);
document.addEventListener('touchstart', jump);
restartButton.addEventListener('click', restartGame);