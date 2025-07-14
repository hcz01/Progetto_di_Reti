const dog = document.getElementById("dog");
    const game = document.getElementById("game");
    const scoreDisplay = document.getElementById("score");
    const message = document.getElementById("message");
    const restartBtn = document.getElementById("restartBtn");

    const frames = [
        "images/fase1.jpg",
        "images/fase2.jpg",
        "images/fase3.jpg",
        "images/fase4.jpg"
    ];
    let currentFrame = 0;
    let isJumping = false;
    let gameOver = false;
    let score = 0;
    let speed = 5;

    // Animazione cane
    setInterval(() => {
        currentFrame = (currentFrame + 1) % frames.length;
        dog.src = frames[currentFrame];
    }, 150);

    //Salto adattivo
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && !isJumping && !gameOver) {
            jump();
        }
    });

    function jump() {
        isJumping = true;

        const screenHeight = window.innerHeight;
        const jumpHeight = screenHeight > 600 ? 200 : screenHeight * 0.35;
        const jumpDuration = screenHeight > 600 ? 400 : 500;

        dog.style.transition = `bottom ${jumpDuration / 1000}s ease-out`;
        dog.style.bottom = jumpHeight + "px";

        setTimeout(() => {
            dog.style.transition = `bottom ${jumpDuration / 1000}s ease-in`;
            dog.style.bottom = "0";
            setTimeout(() => {
                isJumping = false;
            }, jumpDuration);
        }, jumpDuration);
    }

    //Blocchi
    function createBlock() {
        if (gameOver) return;

        const block = document.createElement("div");
        block.classList.add("block");
        game.appendChild(block);

        let blockX = window.innerWidth;
        block.style.left = blockX + "px";

        function moveBlock() {
            if (gameOver) {
                block.remove();
                return;
            }

            blockX -= speed;
            block.style.left = blockX + "px";

            const dogRect = dog.getBoundingClientRect();
            const blockRect = block.getBoundingClientRect();

            const tolerance = window.innerHeight > 600 ? 40 : 20;
            const collided =
                blockRect.left < dogRect.right &&
                blockRect.right > dogRect.left &&
                blockRect.bottom > dogRect.top + tolerance &&
                !isJumping;

            if (collided) {
                message.textContent = " Hai perso!";
                restartBtn.style.display = "block";
                gameOver = true;
                return;
            }

            if (blockX + block.offsetWidth > 0) {
                requestAnimationFrame(moveBlock);
            } else {
                 if (!gameOver) {
                score++;
                scoreDisplay.textContent = "Punti: " + score;
            }
            block.remove();
            }
        }

        requestAnimationFrame(moveBlock);
    }

    // Timer blocchi
    setInterval(() => {
        if (!gameOver) createBlock();
    }, 2000);

    //Velocità crescente
    setInterval(() => {
        if (!gameOver && speed < 20) speed += 0.5;
    }, 5000);

 

    //Pulsante ricomincia
    restartBtn.addEventListener("click", () => {
        location.reload();
    });