const COLORS = ['w', 'y', 'r', 'o', 'b', 'g'];
let faces = [], history = [], moves = [], step = 0;

// Variables for 3D rotation
let isDragging = false;
let startX, startY;
let currentRotationX = -30; // Initial X rotation
let currentRotationY = 45;  // Initial Y rotation
const rotationSpeed = 0.5;  // Adjust for faster/slower rotation

function initCube() {
    faces = COLORS.map(c => Array(9).fill(c));
}

function renderCube() {
    const cube3D = document.getElementById("cube-3d");
    cube3D.innerHTML = '';

    const faceMapping = {
        0: 'top',
        1: 'bottom',
        2: 'left',
        3: 'right',
        4: 'front',
        5: 'back'
    };

    COLORS.forEach((color, faceIndex) => {
        const faceDiv = document.createElement("div");
        faceDiv.className = `face-3d ${faceMapping[faceIndex]}`;

        faces[faceIndex].forEach(stickerColor => {
            const stickerDiv = document.createElement("div");
            stickerDiv.className = `sticker ${stickerColor}`;
            faceDiv.appendChild(stickerDiv);
        });
        cube3D.appendChild(faceDiv);
    });

    // Update the cube's 3D transform
    updateCubeRotation();
}

function updateCubeRotation() {
    const cube3D = document.getElementById("cube-3d");
    cube3D.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
}

// --- Mouse/Touch Interaction for 3D Rotation ---
const cubeContainer = document.getElementById('cube-3d-container');

cubeContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    cubeContainer.classList.add('dragging');
});

cubeContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    currentRotationY += deltaX * rotationSpeed;
    currentRotationX -= deltaY * rotationSpeed;

    updateCubeRotation();

    startX = e.clientX;
    startY = e.clientY;
});

cubeContainer.addEventListener('mouseup', () => {
    isDragging = false;
    cubeContainer.classList.remove('dragging');
});

// Prevent context menu on right-click drag
cubeContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Handle touch events for mobile
cubeContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    cubeContainer.classList.add('dragging');
});

cubeContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;

    currentRotationY += deltaX * rotationSpeed;
    currentRotationX -= deltaY * rotationSpeed;

    updateCubeRotation();

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

cubeContainer.addEventListener('touchend', () => {
    isDragging = false;
    cubeContainer.classList.remove('dragging');
});

// --- End Mouse/Touch Interaction ---

function rotateFace(face) {
    const [a, b, c, d, e, f, g, h, i] = faces[face];
    faces[face] = [g, d, a, h, e, b, i, f, c];
}

function move(m) {
    const turns = {
        "U": { face: 0, ringMap: [[2, [0,1,2]], [4, [0,1,2]], [3, [0,1,2]], [5, [0,1,2]]] },
        "D": { face: 1, ringMap: [[2, [6,7,8]], [5, [6,7,8]], [3, [6,7,8]], [4, [6,7,8]]] },
        "L": { face: 2, ringMap: [[0, [0,3,6]], [5, [8,5,2]], [1, [0,3,6]], [4, [0,3,6]]] },
        "R": { face: 3, ringMap: [[0, [8,5,2]], [4, [8,5,2]], [1, [8,5,2]], [5, [0,3,6]]] },
        "F": { face: 4, ringMap: [[0, [6,7,8]], [2, [8,5,2]], [1, [2,1,0]], [3, [0,3,6]]] },
        "B": { face: 5, ringMap: [[0, [0,1,2]], [3, [8,5,2]], [1, [6,7,8]], [2, [0,3,6]]] },
    };

    let base = m[0];
    let times = m.includes("2") ? 2 : 1;
    if (m.includes("'")) times = 4 - times;

    for (let t = 0; t < times; t++) {
        const { face: faceIdx, ringMap: rings } = turns[base];
        rotateFace(faceIdx);

        const temp = rings.map(([f, idxs]) => idxs.map(i => faces[f][i]));
        for (let i = 0; i < 4; i++) {
            const [f, idxs] = rings[i];
            const from = temp[(i + 3) % 4];
            idxs.forEach((idx, j) => faces[f][idx] = from[j]);
        }
    }
}

function applyMoves(moveList) {
    for (const m of moveList) {
        move(m);
    }
    renderCube();
}

function scramble(numMoves) {
    let sMoves = genMoves(numMoves);
    moves = sMoves;
    history = [JSON.parse(JSON.stringify(faces))];
    applyMoves(moves);
    step = moves.length;
    document.getElementById("movesText").textContent = `Scramble (${numMoves} moves): ` + moves.join(" ");
    document.getElementById("stepInfo").textContent = `Cube is scrambled with ${numMoves} moves.`;

    document.getElementById("scrambleBtn1").disabled = true;
    document.getElementById("scrambleBtn2").disabled = true;
    document.getElementById("scrambleBtn3").disabled = true;
    document.getElementById("solveBtn").disabled = false;
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("prevBtn").disabled = true;
}

function genMoves(n) {
    const base = ['U', 'D', 'L', 'R', 'F', 'B'];
    const mods = ['', "'", '2'];
    let m = [];
    for (let i = 0; i < n; i++) {
        let newMove;
        do {
            newMove = base[Math.floor(Math.random() * 6)] + mods[Math.floor(Math.random() * 3)];
        } while (m.length > 0 && newMove[0] === m[m.length - 1][0]);
        m.push(newMove);
    }
    return m;
}

function inverseMove(m) {
    if (m.endsWith("'")) return m[0];
    if (m.endsWith("2")) return m;
    return m + "'";
}

function solve() {
    if (moves.length === 0) return;
    let reversed = moves.slice().reverse().map(inverseMove);
    history = [JSON.parse(JSON.stringify(faces))];
    moves = reversed;
    step = 0;
    document.getElementById("movesText").textContent = "Solution: " + reversed.join(" ");
    document.getElementById("stepInfo").textContent = "Step 0 / " + moves.length;
    document.getElementById("nextBtn").disabled = false;
    document.getElementById("prevBtn").disabled = true;
    document.getElementById("solveBtn").disabled = true;
}

function nextStep() {
    if (step >= moves.length) {
        document.getElementById("nextBtn").disabled = true;
        return;
    }
    history[step + 1] = JSON.parse(JSON.stringify(faces));
    move(moves[step]);
    step++;
    renderCube();
    document.getElementById("stepInfo").textContent = `Step ${step} / ${moves.length}: ${moves[step - 1]}`;
    if (step === moves.length) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("stepInfo").textContent += " (Solved!)";
    }
    document.getElementById("prevBtn").disabled = false;
}

function prevStep() {
    if (step <= 0) return;
    step--;
    faces = JSON.parse(JSON.stringify(history[step]));
    renderCube();
    document.getElementById("stepInfo").textContent = `Step ${step} / ${moves.length}: ${moves[step] || ''}`;
    document.getElementById("nextBtn").disabled = false;
    if (step === 0) {
        document.getElementById("prevBtn").disabled = true;
    }
}

function resetCube() {
    initCube();
    renderCube();
    history = [];
    moves = [];
    step = 0;
    document.getElementById("movesText").textContent = "";
    document.getElementById("stepInfo").textContent = "";

    document.getElementById("scrambleBtn1").disabled = false;
    document.getElementById("scrambleBtn2").disabled = false;
    document.getElementById("scrambleBtn3").disabled = false;
    document.getElementById("solveBtn").disabled = true;
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("prevBtn").disabled = true;

    // Reset cube's visual rotation to initial state
    currentRotationX = -30;
    currentRotationY = 45;
    updateCubeRotation();
}

// Initialize the cube when the script loads
resetCube();