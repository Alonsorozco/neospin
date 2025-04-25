
// VARIABLES Y ESTADO DEL JUEGO

  let matrixNumbers = [];
  let selectedBets = {};
  let selectedNumber = null;
  let selectedButton = null;
  let betAmount = 0;
  let countdownInterval;
  let rouletteInterval;
  let rouletteTime = 10000;
  let playerBalance = 1500000; // Saldo inicial de 1.000.000
  let totalWon = 0;
  let totalLost = 0;
  let ownedSymbols = [];
  let isQuickBet = false;
  let quickBetRefunded = false;



  const symbolValues = {
  "👑": 1500000,
  "🏵️": 1450000,
  "💎": 1400000,
  "🏆": 1350000,
  "💰": 1250000,
  "🎩": 1150000,
  "🧿": 1050000,
  "🔱": 1000000,
  "⚜️": 950000,
  "🌟": 900000,
  "🦄": 850000,
  "🌙": 800000,
  "🔮": 750000,
  "🧬": 700000,
  "🛸": 650000,
  "🧠": 600000,
  "🎮": 550000,
  "🎯": 500000,
  "🧊": 475000,
  "🍀": 450000,
  "👾": 400000,
  "🎰": 375000,
  "🧩": 350000,
  "🐉": 325000,
  "🔥": 300000,
  "👻": 275000,
  "🐾": 250000,
  "⚡": 225000,
  "🧨": 200000,
  "🚀": 175000,
  "🕹️": 150000,
  "🦾": 125000,
  "🪐": 100000,
  "🥇": 75000,
  "🎲": 60000,
  "📿": 50000
};
//MOSTRAR SÍMBOLOS Y VALORES
const container = document.getElementById('symbol-values');
const ul = document.createElement('ul');
ul.style.maxHeight = '300px'; // altura máxima visible
ul.style.overflowY = 'auto'; // permite scroll vertical
ul.style.padding = '10px';
ul.style.margin = '0';
ul.style.listStyle = 'none';
ul.style.border = '1px solid #ccc';
ul.style.width = '80%'; // Ancho aumentado, ajustable con porcentaje o píxeles

Object.entries(symbolValues).forEach(([symbol, value]) => {
  const li = document.createElement('li');
  li.innerHTML = `
    <div>
      <strong>${symbol}</strong><br>
      ${value.toLocaleString()} pts
    </div>
    <hr>
  `;
  ul.appendChild(li);
});

container.appendChild(ul);


//GENERAR MATRIZ DE NÚMEROS DE 10X10 
function generateMatrix() {
  const container = document.getElementById('grid-container');
  container.innerHTML = '';
  matrixNumbers = [];
  selectedBets = {};

  const uniqueNumbers = new Set();
  while (uniqueNumbers.size < 100) {
    uniqueNumbers.add(Math.floor(Math.random() * 999) + 1);
  }

  const numbers = Array.from(uniqueNumbers);

  numbers.forEach(num => {
    matrixNumbers.push(num);
    const btn = document.createElement('button');
    btn.innerText = num;
    btn.classList.add('numero-btn');
    
    btn.onclick = () => {
      const clickSound = document.getElementById('click-sound');
      clickSound.currentTime = 0;
      clickSound.play();
      openBetModal(num, btn);
    };

    btn.dataset.number = num;
    container.appendChild(btn);
  });
}


//MODAL DE APUESTAS
function openBetModal(num, btn) {
  if (document.getElementById('countdown').innerText === '00:00') return;
  selectedNumber = num;
  selectedButton = btn;
  selectedNumbers = [num]; // Solo uno
  isQuickBet = false; // ← Apuesta manual
  $('#betModal').modal('show');
}


  let selectedBet = 0; // Variable para almacenar la apuesta seleccionada

// Seleccionar los botones de apuesta
document.querySelectorAll('.bet-btn').forEach(button => {
  button.addEventListener('click', () => {
    selectedBet = parseInt(button.getAttribute('data-bet')); // Obtener la cantidad de apuesta del atributo data-bet
    // Resaltar el botón seleccionado
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('selected')); // Quitar la clase 'selected' de los botones
    button.classList.add('selected'); // Añadir la clase 'selected' al botón clickeado
  });
});


let selectedNumbers = [];
quickBetRefunded = false; // Reiniciar bandera al comenzar nueva apuesta rápida
let quickBetPending = false;
let previousQuickBetCost = 0;

let wasBetConfirmed = false;


function updateBalance() {
  const balanceEl = document.getElementById('balanceDisplay');
  if (balanceEl) balanceEl.textContent = `Saldo: ${playerBalance.toLocaleString()} pts`;
}


function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Variable global para controlar si hay una apuesta pendiente
function quickBet() {

  const rulesSeen = sessionStorage.getItem('rulesSeen');
  if (!rulesSeen) {
    const rulesModal = new bootstrap.Modal(document.getElementById('rulesModal'));
    rulesModal.show();
    sessionStorage.setItem('rulesSeen', 'true'); // Solo lo muestra una vez por sesión
    return; // Evita continuar hasta que cierre el modal
  }
  
  if (document.getElementById('countdown')?.innerText === '00:00') return;

  if (quickBetPending || wasBetConfirmed) {
    showActiveBetModal(); 
    return;
  }

  // ⚠️ Limpiar botones y estado de apuestas anteriores
  selectedNumbers.forEach(num => {
    const button = document.querySelector(`.numero-btn[data-number="${num}"]`);
    if (button) {
      button.classList.remove('selected');
      const label = button.querySelector('.bet-amount-display');
      if (label) label.remove(); // Limpiar visualmente montos también
    }
  });

  // 🔄 Limpieza de estado
  selectedNumbers = [];
  selectedBets = {}; // Limpiar apuestas anteriores

  const allButtons = Array.from(document.querySelectorAll('.numero-btn'));
  const chosen = shuffleArray(allButtons).slice(0, 20);
  const betCost = selectedBet * chosen.length;

  if (playerBalance < betCost) {
    alert('Saldo insuficiente');
    return;
  }

  // Función para mostrar el modal de apuesta activa
function showActiveBetModal() {
  const activeBetModal = new bootstrap.Modal(document.getElementById('activeBetModal'));
  activeBetModal.show();
}

  // Restar el costo de la apuesta del saldo del jugador
  playerBalance -= betCost;
  updateBalance(); // Asegúrate de que esta función actualice correctamente el balance en la interfaz

  previousQuickBetCost = betCost;
  quickBetRefunded = false;
  quickBetPending = true;
  wasBetConfirmed = true; // Asegura que esté marcada como confirmada

  selectedNumbers = chosen.map(btn => parseInt(btn.dataset.number));
  isQuickBet = true;

  chosen.forEach(btn => btn.classList.add('selected'));

  if (window.$) {
    $('#betModal').modal('show');
  } else {
    console.log("Apuesta rápida lista:", selectedNumbers);
  }
}

function setBetAmount() {
  if (selectedBet === 0) {
    showResultModal('😢 No se ha seleccionado una apuesta.', 0);
    return;
  }

  // Calcular el costo total dependiendo del tipo de apuesta
  const totalCost = isQuickBet ? previousQuickBetCost : selectedBet * selectedNumbers.length;

  // Si NO es apuesta rápida, hacemos el descuento aquí
  if (!isQuickBet) {
    if (playerBalance < totalCost) {
      showResultModal('😢 Saldo insuficiente.', 0);
      return;
    }

    playerBalance -= totalCost;
    updateBalance();
  }

  selectedNumbers.forEach(num => {
    const button = document.querySelector(`.numero-btn[data-number="${num}"]`);
    if (!button) return;

    button.classList.add('selected');
    selectedBets[num] = (selectedBets[num] || 0) + selectedBet;

    let label = button.querySelector('.bet-amount-display');
    if (!label) {
      label = document.createElement('div');
      label.classList.add('bet-amount-display');
      button.appendChild(label);
    }
    label.innerText = selectedBets[num] + ' pts';
  });

  wasBetConfirmed = true;
  $('#betModal').modal('hide');
}






function updateBalance() {
  const balanceEl = document.getElementById('player-balance');
  if (balanceEl) {
    balanceEl.innerText = `Saldo: ${playerBalance.toLocaleString()} pts`;
  }

  // Guardar el saldo en localStorage
  localStorage.setItem('playerBalance', playerBalance);
}


  function startGame() {
    // Ocultar el botón "Apostar" y mostrar el botón "Volver atrás"
    document.getElementById("quickBetDiv").style.display = 'block';
    document.getElementById('betButton').style.display = 'none';
    document.getElementById('backButton').style.display = 'inline-block';
  
  
    // 🔁 RESETEO CORRECTO
    selectedBets = {};
    selectedNumber = null;
    selectedButton = null;
    betAmount = 0;
  
    // Limpiar botones anteriores
    document.querySelectorAll('#grid-container button').forEach(btn => {
      btn.classList.remove('selected', 'winner');
      const label = btn.querySelector('.bet-amount-display');
      if (label) label.remove();
    });
  
    generateMatrix();
    document.getElementById('rouletteDisplay').innerText = 'Haz tus apuestas y presiona "Girar Ruleta"';
    updateBalance();
  
    // Mostrar el botón para girar ruleta manualmente
    document.getElementById('spinButton').style.display = 'inline-block';

    const quickDiv = document.getElementById('canceldiv');
    if (quickDiv) {
      quickDiv.style.display = 'block';
    }
  
  }
  
  
  



function goBack() {
  // Mostrar el botón "Apostar" y ocultar el botón "Volver atrás"
  document.getElementById('betButton').style.display = 'inline-block'; // Muestra "Apostar"
  document.getElementById('backButton').style.display = 'none';  // Oculta "Volver atrás"

  // Lógica de regreso: No borrar el localStorage
  // Si necesitas resetear el juego visualmente pero mantener los datos en localStorage, no hagas nada con el localStorage aquí
  resetGame();
}

function resetGame() {
  // Lógica para resetear el estado del juego, como quieras
  selectedBets = {};
  selectedNumber = null;
  selectedButton = null;
  betAmount = 0;

  document.getElementById('rouletteDisplay').innerText = 'Haz tu apuesta';
  updateBalance(); // Vuelve a mostrar el balance inicial
}



  function updateCountdown(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    document.getElementById('countdown').innerText = `${min}:${sec}`;
  }

  function startRouletteSpin() {
    let display = document.getElementById('rouletteDisplay');
    let spinTime = 0;
  
    // 🔒 Desactivar "Apuesta Rápida" al iniciar el giro
    const quickBetButton = document.getElementById('quickBetButton');
    if (quickBetButton) {
      quickBetButton.disabled = true;
      quickBetButton.classList.add('disabled'); // si usas Bootstrap para efecto visual
    }
  
    // Verificar si se han hecho apuestas
    if (!selectedBets || Object.keys(selectedBets).length === 0) {
      showCustomModal(); // Mostrar el modal de advertencia si no se ha apostado
      return; // Detener el giro si no hay apuestas
    }
  
    // Deshabilitar el botón de girar mientras se realiza el giro
    const spinButton = document.getElementById('spinButton');
    spinButton.disabled = true; // Deshabilitar el botón
    spinButton.style.cursor = 'not-allowed'; // Cambiar el cursor para indicar que está deshabilitado
    
     // También podrías ocultar el cancelador si quieres:
     document.getElementById('cancelQuickBetBtn').disabled = true;

    // Crear una lista ponderada de números
    let weightedNumbers = [];
  
    matrixNumbers.forEach(num => {
      if (selectedBets[num]) {
        let betMultiplier = 2; // Aumentar la probabilidad del número apostado
        for (let i = 0; i < betMultiplier; i++) {
          weightedNumbers.push(num); // Añadir más veces el número apostado
        }
      } else {
        weightedNumbers.push(num); // El número no apostado se añade una vez
      }
    });
  
    // Elegir el número final con más probabilidad entre los apostados
    let finalNumber = weightedNumbers[Math.floor(Math.random() * weightedNumbers.length)];
  
    // Simular la animación del giro (puedes personalizarla)
    let spinInterval = setInterval(() => {
      let randomDisplay = matrixNumbers[Math.floor(Math.random() * matrixNumbers.length)];
      display.innerText = `Girando... ${randomDisplay}`;
      spinTime += 100;
      if (spinTime >= 2000) { // 2 segundos de giro
        clearInterval(spinInterval);
        display.innerText = `Número ganador: ${finalNumber}`;
  
        // 🔁 Iniciar nueva ronda automáticamente después de mostrar el resultado
        setTimeout(() => {
          startGame();
        }, 8000); // Esperar 3 segundos para mostrar el número antes de reiniciar
      }
    }, 100);
  
    // Iniciar animación de la ruleta
    rouletteInterval = setInterval(() => {
      let randomNum = matrixNumbers[Math.floor(Math.random() * matrixNumbers.length)];
      display.innerText = randomNum;
      spinTime += 100;
  
      if (spinTime >= rouletteTime) {
        clearInterval(rouletteInterval);
        display.innerText = finalNumber;
        finishGame(finalNumber);
      }
    }, 50);
  }
  


  function finishGame(winningNumber) {
    const gridButtons = document.querySelectorAll('#grid-container button');
    gridButtons.forEach(btn => {
      if (parseInt(btn.dataset.number) === winningNumber) {
        btn.classList.add('winner');
      }
    });
  
    // Calcular la apuesta total antes de resolver
    const totalBet = Object.values(selectedBets).reduce((acc, val) => acc + val, 0);
  
    // Restar del saldo si aún no lo has hecho al apostar
    if (playerBalance < 0) playerBalance = 0; // Protege de negativos
    updateBalance();
  
    // Obtén los elementos de sonido
    const winSound = document.getElementById('click-sound');
    const loseSound = document.getElementById('lose-sound');
  
    if (selectedBets[winningNumber]) {
      const winAmount = selectedBets[winningNumber] * 100;
      totalWon += winAmount;
      playerBalance += winAmount; // Ganancia neta
      updateBalance();
      saveToStorage();
  
      // Reproducir el sonido cuando se gane
      winSound.currentTime = 0; // Reiniciar si ya se está reproduciendo
      winSound.play();
  
      // Mostrar el modal de resultados de victoria

      showResultModal(`🎉 ¡Ganaste!<br>
                       Número: ${winningNumber}<br>
                       Premio: ${winAmount.toLocaleString()} pts<br>
                       Apostado: ${totalBet.toLocaleString()} pts<br>
                       Saldo actual: ${playerBalance.toLocaleString()} pts`, winAmount);
    } else {
      totalLost += totalBet;
      saveToStorage();
  
      // Reproducir el sonido cuando se pierda
      loseSound.currentTime = 0; // Reiniciar si ya se está reproduciendo
      loseSound.play();
  
      // Mostrar el modal de resultados de derrota
      showResultModal(`😢 Perdiste.<br>
        Número ganador: ${winningNumber}<br>
        Apostado: ${totalBet.toLocaleString()} pts<br>
        Perdido: ${totalBet.toLocaleString()} pts<br>
        Saldo actual: ${playerBalance.toLocaleString()} pts`, 0);
      
      
    }

    setTimeout(() => {
      const spinButton = document.getElementById('spinButton');
      if (spinButton) {
        spinButton.disabled = false;
        spinButton.classList.remove('disabled'); // Si estás usando clases Bootstrap
      }
    }, 3500); 

    setTimeout(() => {
      const cancelBtn = document.getElementById('cancelQuickBetBtn');
      if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.classList.remove('disabled'); // Si usás clases Bootstrap
      }
    }, 3500);
    // 👇 Desbloquea el botón después de un retraso
    setTimeout(() => {
      const quickBetButton = document.getElementById('quickBetButton');
      if (quickBetButton) {
        quickBetButton.disabled = false;
        quickBetButton.classList.remove('disabled'); // Si estás usando Bootstrap
      }
    }, 3500);  // 3000 ms (3 segundos de espera antes de desbloquear el botón)

    // 🔁 Limpia el estado de la apuesta rápida para la nueva ronda
    quickBetPending = false;
    wasBetConfirmed = false;
    previousQuickBetCost = 0;
    selectedNumbers = [];
    isQuickBet = false;
  
    // Limpia las apuestas para la siguiente ronda
    selectedBets = {};
  }
  
  


function placeBet(number, amount) {
  if (amount > playerBalance) {
    alert("No tienes suficiente saldo para esta apuesta.");
    return;
  }

  if (!selectedBets[number]) selectedBets[number] = 0;
  selectedBets[number] += amount;
  playerBalance -= amount; // Descontar aquí también es válido si prefieres
  updateBalance();
}



  function showResultModal(message, points) {
    document.getElementById('resultBody').innerHTML = message;
    $('#resultModal').modal('show');
  }

  // Funcionalidad del chat
  function handleChatInput(event) {
    if (event.key === 'Enter') {
      const chatInput = document.getElementById('chat-input');
      if (chatInput.value.trim()) {
        addMessage(chatInput.value);
        chatInput.value = '';  // Limpiar el campo de texto
      }
    }
  }

  function addMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    chatMessages.appendChild(newMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;  // Desplazar hacia abajo
  }



  function loadFromStorage() {
    const savedBalance = localStorage.getItem('playerBalance');
    const savedSymbols = localStorage.getItem('ownedSymbols');
    const savedTotalWon = localStorage.getItem('totalWon');
    const savedTotalLost = localStorage.getItem('totalLost');

    playerBalance = savedBalance ? parseInt(savedBalance) : 1500000; // Establece 1.000.000 si no hay saldo guardado
    ownedSymbols = savedSymbols ? JSON.parse(savedSymbols) : [];
    totalWon = savedTotalWon ? parseInt(savedTotalWon) : 0;
    totalLost = savedTotalLost ? parseInt(savedTotalLost) : 0;
  }

  function saveToStorage() {
    localStorage.setItem('playerBalance', playerBalance);
    localStorage.setItem('ownedSymbols', JSON.stringify(ownedSymbols));
    localStorage.setItem('totalWon', totalWon);
    localStorage.setItem('totalLost', totalLost);
  }


function showNotification(message) {
  const notificationMessage = document.getElementById("notificationMessage");
  notificationMessage.textContent = message;

  const notificationModal = new bootstrap.Modal(document.getElementById("notificationModal"));
  notificationModal.show();
}

// 1️⃣ Definición de la función de conmteo simbolo
function updateUniqueSymbolCount() {
  const uniqueCount = new Set(ownedSymbols).size;
  const countEl = document.getElementById('uniqueSymbolCount');
  const msgEl   = document.getElementById('completionMessage');

  if (countEl) countEl.textContent = uniqueCount;

  if (msgEl) {
    if (uniqueCount === 36) {
      msgEl.textContent = '¡Felicitaciones, Completaste los 36 Simbolos! 👏';
    } else {
      msgEl.textContent = '';  // limpia el mensaje si no son 36
    }
  }
}


function updateDuplicateSymbolCount() {
  const symbolMap = {};
  ownedSymbols.forEach(sym => {
    symbolMap[sym] = (symbolMap[sym] || 0) + 1;
  });

  // Calcular cantidad total de repetidos (más de 1 vez)
  let duplicateCount = 0;
  const repetidos = [];

  for (const simbolo in symbolMap) {
    if (symbolMap[simbolo] > 1) {
      duplicateCount += symbolMap[simbolo] - 1;
      repetidos.push({
        simbolo: simbolo,
        cantidad: symbolMap[simbolo]
      });
    }
  }

  const dupEl = document.getElementById('duplicateSymbolCount');
  if (dupEl) dupEl.textContent = duplicateCount;

  loadOwnedSymbols();

}




function updateInventory(isModal = false) {
  // Definir el contenedor adecuado según si es el modal o la barra lateral
  const container = isModal ? document.getElementById('owned-symbols') : document.getElementById('owned-symbols-box');
  
  // Limpiar el contenedor antes de agregar los nuevos símbolos
  container.innerHTML = '';

  // Si no hay símbolos, mostrar mensaje
  if (ownedSymbols.length === 0) {
    const message = document.createElement('div');
    message.classList.add('text-muted', 'mt-2', 'text-center');
    message.textContent = 'Mochila vacía';
    message.style.fontSize = '2rem';  // Tamaño de fuente más pequeño
    container.appendChild(message);
    return;
  }

  // Añadir los símbolos
  ownedSymbols.forEach(symbol => {
    const span = document.createElement('span'); // Crear un elemento <span> para cada símbolo
    span.classList.add('mx-1');  // Añadir espaciado
    span.textContent = symbol;   // Asignar el símbolo al <span>
    container.appendChild(span); // Añadir el <span> al contenedor
  });
}



  ownedSymbols.forEach(symbol => {
    const span = document.createElement('span');
    span.classList.add('mx-1');           // espaciado horizontal
    span.textContent = symbol;            // emoji o nombre
    container.appendChild(span);
  });


// 2️⃣ Cargar datos guardados al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  const savedSymbols = localStorage.getItem('ownedSymbols');
  if (savedSymbols) {
    ownedSymbols = JSON.parse(savedSymbols);
    updateUniqueSymbolCount();
    updateDuplicateSymbolCount();
    updateInventory();
  }

  
  // Actualizo balance si usas balance stored
  const savedBalance = localStorage.getItem('playerBalance');
  if (savedBalance !== null) {
    playerBalance = Number(savedBalance);
    updateBalance();
    updateUniqueSymbolCount();
  }
  // Render del inventario inicial (por si abren el modal sin comprar nada en la sesión)
  updateInventory();
});

// 3️⃣ Conectar la apertura del modal para refrescar el inventario
const inventoryModalEl = document.getElementById('inventoryModal');
inventoryModalEl.addEventListener('show.bs.modal', () => {
  updateShopUI();
  loadOwnedSymbols();
  updateInventory();
  updateUniqueSymbolCount();
  updateDuplicateSymbolCount();
  updateSymbolSidebar(); 
  saveToStorage();
 
});

// 4️⃣ Tu función buySymbol, modificada para llamar a updateInventory()
function buySymbol(symbol, price) {
  if (playerBalance >= price) {
    playerBalance -= price;
    updateBalance();
    localStorage.setItem('playerBalance', playerBalance);

    ownedSymbols.push(symbol);
    localStorage.setItem('ownedSymbols', JSON.stringify(ownedSymbols));

    showNotification(`¡Has comprado el símbolo ${symbol} por ${price.toLocaleString()} pts!`);

    // Marcar el item como comprado
    document.querySelectorAll('.symbol-item').forEach(item => {
      if (item.textContent.includes(symbol)) {
        item.classList.add('bought');
      }
    });

    const compraModal = bootstrap.Modal.getInstance(document.getElementById('comprasimbolos'));
    compraModal.hide();

    updateInventory(); // actualizo el modal también si está abierto
    updateUniqueSymbolCount();
    updateDuplicateSymbolCount();
    updateSymbolSidebar();
  } else {
    showNotification("No tienes suficientes puntos para comprar este símbolo.");
  }
}




  function updateShopUI() {
    document.getElementById('player-balance').innerText = `Puntos: ${playerBalance}`;
    document.getElementById('owned-symbols').innerText = ` ${ownedSymbols.join(' ') || 'Ninguno'}`;
  }

  //function updateStatsUI() {
    //document.getElementById('total-won').innerText = `Puntos Ganados: ${totalWon}`;
    //document.getElementById('total-lost').innerText = `Puntos Perdidos: ${totalLost}`;
 // }

  // Iniciar
  window.onload = function () {
    loadFromStorage();
    updateShopUI();
    //updateStatsUI();
  };

  function resetGame() {
    location.reload();
    // Restablecer variables
    playerBalance = 1500000; // Volver al saldo inicial de 1.000.000
    totalWon = 0;
    totalLost = 0;
    ownedSymbols = [];
    selectedBets = {};
    matrixNumbers = [];
    
    // Limpiar el almacenamiento local
    localStorage.removeItem('playerBalance');
    localStorage.removeItem('ownedSymbols');
    localStorage.removeItem('totalWon');
    localStorage.removeItem('totalLost');
    
    // Volver a generar la matriz de números
    generateMatrix();
    
    // Actualizar la interfaz de usuario
    updateBalance();
    updateShopUI();

    
    // Si hay un modal o mensaje de resultado, ocultarlo
    $('#resultModal').modal('hide');
    
  }

function openInventoryModal() {
    const inventoryContainer = document.getElementById('inventory-symbols');
    inventoryContainer.innerHTML = ''; // Limpiar el contenido previo
    // Mostrar el número de símbolos en el inventario
    const symbolCount = ownedSymbols.length;
    const countMessage = `Tienes ${symbolCount} símbolo(s) en tu inventario.`;

    if (symbolCount === 0) {
      inventoryContainer.innerText = 'No tienes símbolos.';
    } else {
      // Mostrar el mensaje con el conteo de símbolos
      const countDiv = document.createElement('div');
      countDiv.classList.add('inventory-count');
      countDiv.innerText = countMessage;
      inventoryContainer.appendChild(countDiv);

      // Crear los elementos de los símbolos
      ownedSymbols.forEach(symbol => {
        const div = document.createElement('div');
        div.classList.add('inventory-item');
        div.innerHTML = `
          <span>${symbol}</span>
          <button class="btn btn-sm btn-danger ms-2" onclick="sellSymbol('${symbol}', 10000)">Vender por 10,000 pts</button>
        `;
        inventoryContainer.appendChild(div);
      });
    }

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    updateUniqueSymbolCount();
   
    modal.show();
}


function loadOwnedSymbols() {
  const ventaContent = document.getElementById('venta-content');
  ventaContent.innerHTML = '';

  // Cargar símbolos del localStorage
  ownedSymbols = JSON.parse(localStorage.getItem('ownedSymbols') || '[]');

  if (ownedSymbols.length === 0) {
    const noSymbolsMessage = document.createElement('div');
    noSymbolsMessage.textContent = 'No tienes símbolos para vender.';
    ventaContent.appendChild(noSymbolsMessage);
    return;
  }

  // Contar ocurrencias de cada símbolo
  const symbolCounts = {};
  ownedSymbols.forEach(symbol => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });

  // 🔷 Mostrar símbolos únicos
  const unicosTitle = document.createElement('div');
  unicosTitle.classList.add('w-100', 'text-center', 'mb-2', 'text-info');
  unicosTitle.innerHTML = '<strong>🎯 Únicos</strong>';
  ventaContent.appendChild(unicosTitle);

  let hasUnique = false;
  for (let symbol in symbolCounts) {
    const count = symbolCounts[symbol];
    if (count === 1) {
      hasUnique = true;
      const value = symbolValues[symbol] || 0;
      const div = document.createElement('div');
      div.classList.add('symbol-item', 'mb-3');
      div.innerHTML = `
        <span style="font-size: 2rem;">${symbol}</span><br>
        <span style="font-size: 1rem;" class="text-success">${value.toLocaleString()} pts</span><br>
        <button class="btn btn-danger btn-sm mt-2" onclick="sellSymbol('${symbol}')">Vender</button>
      `;
      ventaContent.appendChild(div);
    }
  }

  if (!hasUnique) {
    const noUniqueMessage = document.createElement('div');
    noUniqueMessage.textContent = 'No tienes símbolos únicos.';
    ventaContent.appendChild(noUniqueMessage);
  }

  // 🔁 Mostrar símbolos duplicados
  const duplicados = Object.entries(symbolCounts).filter(([_, count]) => count > 1);
  if (duplicados.length > 0) {
    const duplicadosTitle = document.createElement('div');
    duplicadosTitle.classList.add('w-100', 'text-center', 'mt-4', 'mb-2', 'text-warning');
    duplicadosTitle.innerHTML = '<strong>🌀 Duplicados</strong>';
    ventaContent.appendChild(duplicadosTitle);

    duplicados.forEach(([symbol, count]) => {
      const value = symbolValues[symbol] || 0;
      const div = document.createElement('div');
      div.classList.add('symbol-item', 'mb-3');
      div.innerHTML = `
        <span style="font-size: 2rem;">${symbol} x${count}</span><br>
        <span style="font-size: 1rem;" class="text-success">${value.toLocaleString()} pts</span><br>
        <button class="btn btn-danger btn-sm mt-2" onclick="sellSymbol('${symbol}')">Vender Uno</button>
      `;
      ventaContent.appendChild(div);
    });
  }
}





function sellSymbol(symbol) {
  const index = ownedSymbols.indexOf(symbol);

  if (index > -1) {
    // Eliminar el símbolo del inventario
    ownedSymbols.splice(index, 1);

    // Sumar puntos por la venta
    const value = symbolValues[symbol] || 10; // valor por defecto si no existe
    playerBalance += value;

    // Guardar y actualizar la UI
    saveToStorage();
    updateShopUI();
    updateUniqueSymbolCount();
    updateDuplicateSymbolCount();

    // Mostrar el modal de venta exitosa
    document.getElementById('ventaSymbolDisplay').innerText = symbol;
    document.getElementById('ventaAmountDisplay').innerText = value;
    const modal = new bootstrap.Modal(document.getElementById('ventaExitosaModal'));
    modal.show();

    const ventaModalEl = document.getElementById('ventaModal');
    const ventaModal = bootstrap.Modal.getInstance(ventaModalEl);
    ventaModal.hide(); // Cierra el modal correctamente

    // ⚠️ NO cierres el modal de venta automáticamente si quieres seguir vendiendo
    // Si aún quieres cerrarlo, puedes mantener esta parte:
    // const ventaModalEl = document.getElementById('ventaModal');
    // const ventaModal = bootstrap.Modal.getInstance(ventaModalEl) || new bootstrap.Modal(ventaModalEl);
    // ventaModal.hide();

    // Recargar los símbolos en venta
    loadOwnedSymbols(); // Recarga visual de repetidos
    updateInventory();
  } else {
    alert("El símbolo no se encuentra en tu inventario.");
  }
}


function buySymbolPack() {
  const packCost = 1500000;
  const symbolsPerPack = Math.floor(Math.random() * 3) + 1; 

  if (playerBalance < packCost) {
    const insufficientModal = new bootstrap.Modal(document.getElementById('insufficientFundsModal'));
    insufficientModal.show();
    return;
  }

  // Descontar puntos
  playerBalance -= packCost;
  updateBalance();

  // Obtener símbolos aleatorios
  const keys = Object.keys(symbolValues);
  const newSymbols = [];

  while (newSymbols.length < symbolsPerPack) {
    const randomIndex = Math.floor(Math.random() * keys.length);
    const symbol = keys[randomIndex];
    newSymbols.push(symbol);
    ownedSymbols.push(symbol);
  }

  // Guardar y actualizar UI
  saveToStorage();
  updateShopUI();
  updateUniqueSymbolCount();
  updateDuplicateSymbolCount();
  updateInventory();  

  // Mostrar modal con los nuevos símbolos
  document.getElementById('purchasedSymbolDisplay').innerText = newSymbols.join(' ');
  
  const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
  modal.show();
    const clickSound = document.getElementById('click-sound');
    clickSound.currentTime = 0;
    clickSound.play();
}

const betModal = document.getElementById('betModal');

betModal.addEventListener('shown.bs.modal', () => {
  document.addEventListener('keydown', handleEnterKey);
});

betModal.addEventListener('hidden.bs.modal', () => {
  document.removeEventListener('keydown', handleEnterKey);
});

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    document.getElementById('confirmBetBtn').click();
  }
}

function showModal(symbol, description, price) {
  document.getElementById('symbolDescription').innerText = description;
  document.getElementById('symbolPrice').innerText = `Precio: ${price}`;
}

 // Mostrar y ocultar el shopBox con el botón
function toggleShopBox() {
  let shopBox = document.getElementById("shopBox");

  // Si el shopBox tiene la clase 'hidden', la eliminamos, de lo contrario, la añadimos
  shopBox.classList.toggle("hidden");
  updateUniqueSymbolCount();

}

function showResultModal(message, amount) {
    const modal = document.createElement('div');
    modal.className = 'result-modal';
  
    const content = document.createElement('div');
    content.className = 'modal-content';
  
    // Crear botón de cierre
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => modal.remove(); // Cierra el modal
  
    // Agregar mensaje y posible ganancia
    const messageText = document.createElement('div');
    messageText.className = 'modal-text';
    messageText.innerHTML = message;
  
    const winAmountText = document.createElement('div');
    winAmountText.className = 'big-win';
    if (amount > 0) {
      winAmountText.innerHTML = `💸 + ${amount.toLocaleString()} pts`;
    }
  
    // Agregar elementos al modal
    content.appendChild(closeBtn);
    content.appendChild(messageText);
    if (amount > 0) content.appendChild(winAmountText);
    modal.appendChild(content);
    document.body.appendChild(modal);
  
    // Mostrar con animación
    setTimeout(() => {
      modal.classList.add('visible');
    }, 10);
  }
  
  
  spinButton.addEventListener('click', () => {
    const totalBet = Object.values(selectedBets).reduce((acc, val) => acc + val, 0);
    if (totalBet === 0) {
      showResultModal('⚠️ Debes apostar antes de girar.', 0);
      const quickBetButton = document.getElementById('quickBetButton');
      if (quickBetButton) {
        quickBetButton.disabled = false;
        quickBetButton.classList.remove('disabled'); // Si estás usando Bootstrap
      return;

    }
    
    }
    
 
  });



  document.addEventListener('DOMContentLoaded', () => { 
    const clickSound = document.getElementById('click-sound');
    const muteButton = document.getElementById('mute-toggle');
    let isMuted = false;
  
    // Establecer volumen inicial
    clickSound.volume = 0.2;  // Establecer volumen inicial a 50%
  
    // Reproducir sonido al hacer clic en botones
    document.addEventListener('click', (e) => {
      if ((e.target.tagName === 'BUTTON' || e.target.closest('button')) && !isMuted) {
        clickSound.currentTime = 0;  // Reiniciar al inicio
        clickSound.play();           // Reproducir el sonido
      }
    });
  
    // Alternar mute
    muteButton.addEventListener('click', () => {
      isMuted = !isMuted;
      muteButton.innerText = isMuted ? '🔈 Activar sonido' : '🔇 Silenciar';
  
      // Aplicar el estado de mute
      if (isMuted) {
        clickSound.volume = 0;  // Silenciar
      } else {
        clickSound.volume = 0.5;  // Restaurar volumen a 50%
      }
    });
  });
  
  function playSlot() {
    const spinCost = 3000000;
    const resultBox1 = document.getElementById('slot-result1');
    const resultBox2 = document.getElementById('slot-result2');
    const resultBox3 = document.getElementById('slot-result3');
    const resultMessage = document.getElementById('slot-result-message'); // Nuevo elemento para el mensaje
  
    if (playerBalance < spinCost) {
      resultBox1.textContent = '❌';
      resultBox2.textContent = '❌';
      resultBox3.textContent = '❌';
      resultBox1.style.color = '#ff0033';
      resultBox2.style.color = '#ff0033';
      resultBox3.style.color = '#ff0033';
      showNotification("No tienes suficientes puntos para girar el slot.");
      return;
    }
  
    playerBalance -= spinCost;
    updateBalance();
    localStorage.setItem('playerBalance', playerBalance);
  
    const symbolKeys = Object.keys(symbolValues); // Asegúrate de obtener las llaves
  
    // Establecer animación de "giro"
    resultBox1.style.animation = 'spin-animation 0.8s ease-in-out';
    resultBox2.style.animation = 'spin-animation 0.8s ease-in-out';
    resultBox3.style.animation = 'spin-animation 0.8s ease-in-out';
  
    // Animación de girar símbolos antes de mostrar el resultado
    let counter = 0;
    const maxCycles = 20;
    const spinInterval = setInterval(() => {
      const tempSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
      resultBox1.textContent = tempSymbol;
      resultBox2.textContent = tempSymbol;
      resultBox3.textContent = tempSymbol;
      resultBox1.style.color = '#00ffee';
      resultBox2.style.color = '#00ffee';
      resultBox3.style.color = '#00ffee';
      counter++;
  
      if (counter >= maxCycles) {
        clearInterval(spinInterval);
  
        // Resultado final: un símbolo del pool
        const wonSymbol1 = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
        const wonSymbol2 = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
        const wonSymbol3 = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
  
        // Mostrar el símbolo ganado en las 3 líneas
        resultBox1.textContent = wonSymbol1;
        resultBox2.textContent = wonSymbol2;
        resultBox3.textContent = wonSymbol3;
  
        resultBox1.style.color = '#fff600';
        resultBox2.style.color = '#fff600';
        resultBox3.style.color = '#fff600';
  
        // Agregar los símbolos ganados al inventario
        ownedSymbols.push(wonSymbol1, wonSymbol2, wonSymbol3);
        localStorage.setItem('ownedSymbols', JSON.stringify(ownedSymbols));
  
        // Actualizar el mensaje en el modal
        resultMessage.textContent = `🎉 ¡Los símbolos ${wonSymbol1}, ${wonSymbol2} y ${wonSymbol3} se encuentran en tu inventario!`;
  
        // ✅ Actualizar todo
        updateInventory();              // Modal de inventario
        updateUniqueSymbolCount();      // Cantidad de símbolos únicos
        updateDuplicateSymbolCount();   // Duplicados
        updateSymbolSidebar();          // Si tenés una barra lateral o box fijo
        loadOwnedSymbols();
        updateShopUI();
        showNotification(`🎰 ¡Ganaste los símbolos ${wonSymbol1}, ${wonSymbol2} y ${wonSymbol3}!`);
      }
    }, 50); // velocidad del giro
  }
  


let manualBetPending = false;
let previousManualBetCost = 0;



function cancelQuickBet() {
  console.log("Cancelando apuesta...");
  resetBetState();
  
  const modalElement = document.getElementById('betModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}




function resetBetState({ refund = true } = {}) {
  let refundAmount = 0;

  // Limpiar botones seleccionados y etiquetas de monto
  selectedNumbers.forEach(num => {
    const button = document.querySelector(`.numero-btn[data-number="${num}"]`);
    if (button) {
      button.classList.remove('selected');
      const label = button.querySelector('.bet-amount-display');
      if (label) label.remove();
    }
  });

  // Calcular el monto a reembolsar
  if (isQuickBet) {
    // Solo se reembolsa el costo de la apuesta rápida si no ha sido reembolsado ya
    if (quickBetPending && !quickBetRefunded) {
      refundAmount += previousQuickBetCost;
      quickBetRefunded = true;
    }
  } else {
    // Se reembolsa lo apostado en cada número
    for (const num in selectedBets) {
      refundAmount += selectedBets[num];
    }
  }

  // Realizar el reembolso
  if (refund && refundAmount > 0) {
    playerBalance += refundAmount;
    updateBalance();
    localStorage.setItem('playerBalance', playerBalance);
    // Llamar a la función que muestra el modal con el mensaje
    showCancelBetModal(refundAmount);
  }

  // Limpiar estado
  selectedNumbers = [];
  selectedBets = {};
  quickBetPending = false;
  wasBetConfirmed = false;
  isQuickBet = false;
  previousQuickBetCost = 0;

  // Reiniciar bandera del reembolso para futuras rondas
  setTimeout(() => {
    quickBetRefunded = false;
  }, 1000);
}

// Función para mostrar el modal con el monto del reembolso
function showCancelBetModal(refundAmount) {
  const refundMessage = document.getElementById('refundMessage');
  refundMessage.textContent = `La apuesta ha sido cancelada. Se devolvieron ${refundAmount.toLocaleString()} pts.`;

  // Mostrar el modal
  const cancelBetModal = new bootstrap.Modal(document.getElementById('cancelBetModal'));
  cancelBetModal.show();
}



function updateAllUniqueSymbolCounts() {
  
  const uniqueCount = new Set(ownedSymbols).size;
  
  const countEls = [
    document.getElementById('uniqueSymbolCount'),
    document.getElementById('uniqueSymbolCountbar')
  ];

  countEls.forEach(el => {
    if (el) el.textContent = uniqueCount;
  });

  const msgEl = document.getElementById('completionMessage');
  if (msgEl) {
    msgEl.textContent = uniqueCount === 36 
      ? '¡Felicitaciones, Completaste los 36 Simbolos! 👏' 
      : '';
  }
}


