
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
  enableAllBets();    // ← Restaurar los montos bloqueados si hubo apuesta rápida

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

let quickBetUsed = false;  // Bandera para controlar si ya se hizo una apuesta rápida

function quickBet() {
  // Verificar si ya se ha utilizado una apuesta rápida
  if (quickBetUsed) {
    showResultModal('😢 Ya se ha realizado una apuesta rápida, puedes seguir apostando unitariamente', 0);
    return;
  }

  const montoRapido = 1000; // Fijo o puedes leerlo de una config
  const countdown = document.getElementById('countdown')?.innerText;

  if (countdown === '00:00') return;

  const allButtons = Array.from(document.querySelectorAll('.numero-btn'));
  const chosen = shuffleArray(allButtons).slice(0, 20);
  const totalCost = montoRapido * chosen.length;

  if (playerBalance < totalCost) {
    showResultModal('😢 Saldo insuficiente para apuesta rápida.');
    return;
  }

  // Guardar el costo de la apuesta para referencia futura
  previousQuickBetCost = totalCost;

  selectedNumbers = chosen.map(btn => parseInt(btn.dataset.number));
  selectedBets = {};
  isQuickBet = true;
  wasBetConfirmed = true;
  quickBetPending = true;

  playerBalance -= totalCost;
  updateBalance();

  // Resaltar los números seleccionados
  selectedNumbers.forEach(num => {
    const button = document.querySelector(`.numero-btn[data-number="${num}"]`);
    if (button) {
      button.classList.add('selected');
      selectedBets[num] = montoRapido;
      let label = button.querySelector('.bet-amount-display');
      if (!label) {
        label = document.createElement('div');
        label.classList.add('bet-amount-display');
        button.appendChild(label);
      }
      label.innerText = `${montoRapido} pts`;
    }
  });

  // Marcar que se ha realizado una apuesta rápida
  quickBetUsed = true;

  // Mostrar el modal de resultado
  showResultModal('✅ ¡Apuesta rápida realizada!', totalCost);
}



// Función para manejar el reembolso si el jugador abandona o cierra el modal sin confirmar la apuesta
function refundQuickBetIfNeeded() {
  if (quickBetPending && !wasBetConfirmed && !quickBetRefunded) {
    playerBalance += previousQuickBetCost;
    updateBalance();
    quickBetRefunded = true;
    quickBetPending = false; // Marcar como no pendiente
    selectedNumbers = [];
    selectedBets = {};
    console.log('💸 Apuesta rápida reembolsada.');
  }
}

// Escuchar el evento de cierre del modal para reembolsar si es necesario
$('#betModal').on('hidden.bs.modal', function () {
  refundQuickBetIfNeeded();
});


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
  

  let partidasJugadas = 0; // Contador de partidas global
  let simbolosJugador = []; // Si ya usas ownedSymbols, este puede omitirse
  
  function finishGame(winningNumber) {
    const gridButtons = document.querySelectorAll('#grid-container button');
    gridButtons.forEach(btn => {
      if (parseInt(btn.dataset.number) === winningNumber) {
        btn.classList.add('winner');
      }
    });
  
    const totalBet = Object.values(selectedBets).reduce((acc, val) => acc + val, 0);
    if (playerBalance < 0) playerBalance = 0;
    updateBalance();
  
    const winSound = document.getElementById('click-sound');
    const loseSound = document.getElementById('lose-sound');
  
    if (selectedBets[winningNumber]) {
      const winAmount = selectedBets[winningNumber] * 100;
      totalWon += winAmount;
      playerBalance += winAmount;
      updateBalance();
      saveToStorage();
  
      winSound.currentTime = 0;
      winSound.play();
  
      showResultModal(`🎉 ¡Ganaste!<br>
                       Número: ${winningNumber}<br>
                       Premio: ${winAmount.toLocaleString()} pts<br>
                       Apostado: ${totalBet.toLocaleString()} pts<br>
                       Saldo actual: ${playerBalance.toLocaleString()} pts`, winAmount);
    } else {
      totalLost += totalBet;
      saveToStorage();
  
      loseSound.currentTime = 0;
      loseSound.play();
  
      showResultModal(`😢 Perdiste.<br>
                       Número ganador: ${winningNumber}<br>
                       Apostado: ${totalBet.toLocaleString()} pts<br>
                       Perdido: ${totalBet.toLocaleString()} pts<br>
                       Saldo actual: ${playerBalance.toLocaleString()} pts`, 0);
    }
  
    // Reactivar botones después de la animación
    setTimeout(() => {
      ['spinButton', 'cancelQuickBetBtn', 'quickBetButton'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('disabled');
        }
      });
    }, 3500);
  
    // Resetear estado de apuesta
    quickBetUsed = false;
    quickBetPending = false;
    wasBetConfirmed = false;
    previousQuickBetCost = 0;
    selectedNumbers = [];
    isQuickBet = false;
    selectedBets = {};
  
    // 🎁 SISTEMA DE REGALO CADA 10 PARTIDAS
    partidasJugadas++;
    updateGiftProgressBar();
  
    if (partidasJugadas % 10 === 0) {
      const simbolos = Object.keys(symbolValues);
      const simboloRegalado = simbolos[Math.floor(Math.random() * simbolos.length)];
      const valor = symbolValues[simboloRegalado];
  
      ownedSymbols.push(simboloRegalado); // Añadir al inventario
      saveToStorage();                   // Guardar
      updateInventory();                // Mostrar en pantalla

      
  
      showPrizeModal(
        `🎁 ¡Has jugado 10 partidas!<br>Te regalamos el símbolo <strong>${simboloRegalado}</strong><br>Valor: ${valor.toLocaleString()} pts`,
        simboloRegalado
      );
    }
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
    partidasJugadas = parseInt(localStorage.getItem('partidasJugadas')) || 0;
    updateGiftProgressBar();
  }

  function saveToStorage() {
    localStorage.setItem('playerBalance', playerBalance);
    localStorage.setItem('totalWon', totalWon);
    localStorage.setItem('totalLost', totalLost);
    localStorage.setItem('partidasJugadas', partidasJugadas);
    localStorage.setItem('ownedSymbols', JSON.stringify(ownedSymbols)); // importante
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
    updateInventory();
    loadOwnedSymbols(); // Recarga visual de repetidos
   
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

 // Limpiar estado de apuestas previas
 selectedNumbers = [];  // Limpiar los números seleccionados
 selectedBets = {};  // Limpiar las apuestas previas
 quickBetPending = false;  // Apuesta rápida no pendiente
 wasBetConfirmed = false;  // No ha sido confirmada la apuesta
 isQuickBet = false;  // No estamos en apuesta rápida
 previousQuickBetCost = 0;  // Reiniciar el costo de la apuesta rápida
  // Reiniciar bandera del reembolso para futuras rondas
   // Limpiar la interfaz visual de los botones
   document.querySelectorAll('.numero-btn').forEach(button => {
    button.classList.remove('selected');  // Quitar la clase de selección
    const label = button.querySelector('.bet-amount-display');
    if (label) {
      label.remove();  // Limpiar la cantidad de apuesta
    }
  });

  console.log("Estado de la apuesta limpiado, listo para nueva apuesta.");
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



document.querySelectorAll('.bet-btn').forEach(button => {
  button.addEventListener('click', () => {
    const betAmount = parseInt(button.getAttribute('data-bet'));

    // Bloquear montos no válidos en apuesta rápida
    if (isQuickBet && [100000, 500000, 1000000].includes(betAmount)) {
      alert('Este monto no está disponible para apuestas rápidas.');
      return;
    }

    selectedBet = betAmount;

    // Resaltar el botón seleccionado
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
  });
});


function disableInvalidQuickBets() {
  document.querySelectorAll('.bet-btn').forEach(button => {
    const betAmount = parseInt(button.getAttribute('data-bet'));
    if ([100000, 500000, 1000000].includes(betAmount)) {
      button.disabled = true;
      button.classList.add('disabled'); // Agrega una clase visual (si tienes CSS)
    }
  });
}

function enableAllBets() {
  document.querySelectorAll('.bet-btn').forEach(button => {
    button.disabled = false;
    button.classList.remove('disabled');
  });
}


document.querySelectorAll('.bet-btn').forEach(button => {
  button.addEventListener('click', () => {
    const betAmount = parseInt(button.getAttribute('data-bet'));

    if (playerBalance < betAmount) {
      showResultModal('😢 Saldo insuficiente.', 0);
      return;
    }

    selectedBet = betAmount;

    // Descontar saldo
    playerBalance -= selectedBet;
    updateBalance();

    // Resaltar visualmente el botón
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    // Marcar número como seleccionado (si es apuesta manual)
    if (!isQuickBet && selectedNumbers.length) {
      selectedNumbers.forEach(num => {
        const btn = document.querySelector(`.numero-btn[data-number="${num}"]`);
        if (btn) {
          btn.classList.add('selected');
          let label = btn.querySelector('.bet-amount-display');
          if (!label) {
            label = document.createElement('div');
            label.classList.add('bet-amount-display');
            btn.appendChild(label);
          }
          label.innerText = selectedBet + ' pts';
          selectedBets[num] = selectedBet;
        }
      });
    }

    wasBetConfirmed = true;

    // Cerrar modal después de apostar
    const betModal = bootstrap.Modal.getInstance(document.getElementById('betModal'));
    if (betModal) betModal.hide();
  });
});



function updateGiftProgressBar() {
  const bar = document.getElementById('giftProgressBar');
  const current = partidasJugadas % 10;
  const percent = (current / 10) * 100;

  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', current);
  bar.textContent = `${current} / 10`;

  // Opcional: cambia color si llega a 10
  if (current === 0 && partidasJugadas !== 0) {
    bar.classList.remove('bg-success');
    bar.classList.add('bg-warning');
    bar.textContent = `¡Símbolo obtenido!`;
  } else {
    bar.classList.remove('bg-warning');
    bar.classList.add('bg-success');
  }
}



// Función para actualizar la barra de progreso
function updateGiftProgress() {
  const progressBar = document.getElementById('giftProgressBar');
  const progressPercentage = (partidasJugadas % 10) * 10; // Cada 10 partidas, la barra se llena al 100%
  progressBar.style.width = `${progressPercentage}%`;
  progressBar.setAttribute('aria-valuenow', partidasJugadas % 10);

  // Actualiza el texto dentro de la barra
  progressBar.textContent = `${partidasJugadas % 10} / 10`;

  // Verificar si llegó a 10 partidas
  if (partidasJugadas % 10 === 0 && partidasJugadas !== 0) {
    const regalo = "🎁"; // Símbolo de regalo
    ownedSymbols.push(regalo); // Agregarlo al inventario
    saveToStorage(); // Guardar en el almacenamiento local
    updateInventory(); // Actualizar la visualización del inventario
    showResultModal(`🎁 ¡Símbolo de regalo obtenido por jugar 10 partidas!`, regalo);

    // 🌟 Animación de barra
    progressBar.classList.add('gift-earned');

    // ✨ Efecto sparkle visual
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    document.getElementById('giftProgressContainer').appendChild(sparkle);

    // Eliminar el efecto después de 1 segundo
    setTimeout(() => {
      sparkle.remove();
      progressBar.classList.remove('gift-earned');
    }, 1000);
  }
}



function showPrizeModal(message, simboloRegalado) {
  const modalTitle = document.getElementById('prizeModalLabel');
  const prizeIcon = document.querySelector('.prize-icon');
  const modalBody = document.querySelector('.modal-body');
  const sellButton = document.getElementById('sellPrizeButton');

  const valor = symbolValues[simboloRegalado] || 0;

  // Cambiar título
  modalTitle.textContent = `¡Símbolo de Premio Obtenido!`;

  // Mostrar el símbolo en el div correcto
  prizeIcon.textContent = simboloRegalado;

  // Cambiar el texto restante (sin tocar prize-icon)
  const paragraphs = modalBody.querySelectorAll('p');
  if (paragraphs.length >= 2) {
    paragraphs[0].innerHTML = `¡Felicidades! Has ganado el símbolo <strong>${simboloRegalado}</strong>.`;
    paragraphs[1].innerHTML = `Valor: ${valor.toLocaleString()} pts<br>¿Qué te gustaría hacer con este símbolo?`;
  }

  // Mostrar modal
  const prizeModal = new bootstrap.Modal(document.getElementById('prizeModal'));
  prizeModal.show();

  // Reemplazar botón para evitar múltiples eventos
  sellButton.replaceWith(sellButton.cloneNode(true));
  const newSellButton = document.getElementById('sellPrizeButton');

  newSellButton.addEventListener('click', () => {
    alert(`¡Has vendido el símbolo ${simboloRegalado} por ${valor.toLocaleString()} pts!`);

    const index = ownedSymbols.indexOf(simboloRegalado);
    if (index !== -1) {
      ownedSymbols.splice(index, 1);
      playerBalance += valor;
      updateInventory();
      updateBalance();
      saveToStorage();
    }

    prizeModal.hide();
  });
}

