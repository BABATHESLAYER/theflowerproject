const wrapperColors = ['pink', 'purple', 'orange', 'yellow'];
const flowerNames = ['clover', 'daisies', 'lily', 'poppy', 'primroses', 'sunflower', 'tulip', 'violets'];
const tieNames = ['fat_pink', 'long_pink', 'small_tie', 'thin_string'];

const wrapperControlsEl = document.getElementById('wrapper-controls');
const flowerLibraryEl = document.getElementById('flower-library');
const tieLibraryEl = document.getElementById('tie-library');
const flowerLayerEl = document.getElementById('flower-layer');
const backWrapperEl = document.getElementById('back-wrapper');
const frontWrapperEl = document.getElementById('front-wrapper');
const tieLayerEl = document.getElementById('tie-layer');
const layerPanelEl = document.getElementById('layer-panel');
const layerUpBtn = document.getElementById('layer-up');
const layerDownBtn = document.getElementById('layer-down');
const layerSelect = document.getElementById('layer-select');
const flowerSelect = document.getElementById('flower-select');
const posXEl = document.getElementById('knob-x');
const posYEl = document.getElementById('knob-y');
const scaleEl = document.getElementById('knob-scale');
const knobXVal = document.getElementById('knob-x-val');
const knobYVal = document.getElementById('knob-y-val');
const knobScaleVal = document.getElementById('knob-scale-val');
const layerUpRightBtn = document.getElementById('layer-up-right');
const layerDownRightBtn = document.getElementById('layer-down-right');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');

let selectedWrapper = 'pink';
let selectedTie = null;
let selectedLayer = 'back-wrapper';
let selectedFlowerIndex = -1;
let dragState = null;

const state = {
  backWrapper: { x: 50, y: 0, scale: 1 },
  frontWrapper: { x: 50, y: 0, scale: 1 },
  tie: { x: 50, y: 52, scale: 1 },
  flowers: [],
  layerOrder: ['back-wrapper', 'flowers', 'tie', 'front-wrapper']
};

function createWrapperSwatches() {
  wrapperColors.forEach(color => {
    const button = document.createElement('button');
    button.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    button.className = 'swatch';
    button.dataset.color = color;
    if (color === selectedWrapper) button.classList.add('active');
    button.addEventListener('click', () => setWrapperColor(color));
    wrapperControlsEl.appendChild(button);
  });
}

function setWrapperColor(color) {
  selectedWrapper = color;
  backWrapperEl.src = `assets/wrappers/wrappers_back/${color}back.svg`;
  frontWrapperEl.src = `assets/wrappers/wrapers_front/${color}front.svg`;

  wrapperControlsEl.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === color);
  });
}

function createFlowerLibrary() {
  flowerNames.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'thumbnail';
    btn.title = name;
    const img = document.createElement('img');
    img.src = `assets/flowers/${name}.svg`;
    img.alt = name;
    img.style.width = '100%';
    img.style.height = 'auto';
    btn.appendChild(img);

    btn.addEventListener('click', () => toggleFlowerSelection(name, btn));
    flowerLibraryEl.appendChild(btn);
  });
}

function toggleFlowerSelection(name, button) {
  const existingIndex = state.flowers.findIndex(item => item.name === name);
  if (existingIndex === -1) {
    state.flowers.push({ name, x: 27.5, y: 0, scale: 0.45, rotate: 0 });
    button.classList.add('active');
    selectedFlowerIndex = state.flowers.length - 1;
    selectedLayer = 'flower';
    layerSelect.value = 'flower';
  } else {
    state.flowers.splice(existingIndex, 1);
    button.classList.remove('active');
    selectedFlowerIndex = -1;
  }

  refreshFlowerSelect();
  renderFlowerLayer();
  syncControlInputs();
}

function refreshFlowerSelect() {
  flowerSelect.innerHTML = '<option value="-1">-- Choose Flower --</option>';
  state.flowers.forEach((flower, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${index + 1}. ${flower.name}`;
    flowerSelect.appendChild(option);
  });
  if (selectedFlowerIndex >= 0) {
    flowerSelect.value = selectedFlowerIndex;
  }
}

function renderFlowerLayer() {
  flowerLayerEl.innerHTML = '';

  state.flowers.forEach((flower, index) => {
    const img = document.createElement('img');
    img.src = `assets/flowers/${flower.name}.svg`;
    img.alt = flower.name;
    img.dataset.flowerIndex = index;
    img.style.width = `${flower.scale * 100}%`;
    img.style.left = `${flower.x}%`;
    img.style.top = `${flower.y}%`;
    img.style.transform = `translateX(-50%) rotate(${flower.rotate}deg)`;
    img.title = `Click to remove ${flower.name}`;
    img.style.pointerEvents = 'auto';
    img.style.cursor = 'move';

    img.addEventListener('click', (event) => {
      if (event.shiftKey) {
        state.flowers.splice(index, 1);
        selectedFlowerIndex = -1;
        const flowerBtn = [...flowerLibraryEl.children].find(btn => btn.title === flower.name);
        if (flowerBtn) flowerBtn.classList.remove('active');
        refreshFlowerSelect();
        renderFlowerLayer();
      } else {
        selectedLayer = 'flower';
        selectedFlowerIndex = index;
        layerSelect.value = 'flower';
        syncControlInputs();
        renderLayerPanel();
      }
    });

    img.addEventListener('mousedown', (event) => {
      dragState = {
        type: 'flower',
        index,
        lastX: event.clientX,
        lastY: event.clientY
      };
      selectedLayer = 'flower';
      selectedFlowerIndex = index;
      layerSelect.value = 'flower';
      syncControlInputs();
      renderLayerPanel();
      event.preventDefault();
    });

    flowerLayerEl.appendChild(img);
  });
}


function createTieLibrary() {
  tieNames.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'thumbnail';
    btn.title = name;
    const img = document.createElement('img');
    img.src = `assets/wrapper_ties/${name}.svg`;
    img.alt = name;
    img.style.width = '100%';
    img.style.height = 'auto';
    btn.appendChild(img);

    btn.addEventListener('click', () => setTie(name, btn));
    tieLibraryEl.appendChild(btn);
  });
}

function renderLayerPanel() {
  layerPanelEl.innerHTML = '';
  state.layerOrder.forEach(layerId => {
    const div = document.createElement('div');
    div.className = 'layer-item';
    const label = {
      'back-wrapper': 'Back Wrapper',
      'flowers': `Flowers (${state.flowers.length})`,
      'tie': 'Tie',
      'front-wrapper': 'Front Wrapper'
    }[layerId];
    div.textContent = label;
    if ((selectedLayer === layerId) || (selectedLayer === 'flower' && layerId === 'flowers')) {
      div.classList.add('active');
    }
    div.addEventListener('click', () => {
      selectedLayer = layerId === 'flowers' ? 'flower' : layerId;
      layerSelect.value = selectedLayer === 'flower' ? 'flower' : selectedLayer;
      if (selectedLayer === 'flower') {
        if (state.flowers.length > 0) selectedFlowerIndex = 0;
        refreshFlowerSelect();
      }
      syncControlInputs();
      renderLayerPanel();
    });
    layerPanelEl.appendChild(div);
  });
}

function moveLayer(direction) {
  const currentIndex = state.layerOrder.indexOf(selectedLayer === 'flower' ? 'flowers' : selectedLayer);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
  if (targetIndex < 0 || targetIndex >= state.layerOrder.length) return;

  const temp = state.layerOrder[currentIndex];
  state.layerOrder[currentIndex] = state.layerOrder[targetIndex];
  state.layerOrder[targetIndex] = temp;
  renderLayerPanel();
  renderLayerTransforms();
}


function setTie(name, button) {
  const allButtons = tieLibraryEl.querySelectorAll('button');
  allButtons.forEach(btn => btn.classList.remove('active'));
  if (selectedTie === name) {
    selectedTie = null;
    tieLayerEl.src = '';
    return;
  }

  selectedTie = name;
  tieLayerEl.src = `assets/wrapper_ties/${name}.svg`;
  button.classList.add('active');
}

function applyTransform(el, data) {
  el.style.left = `${data.x}%`;
  el.style.top = `${data.y}%`;
  el.style.transform = `translateX(-50%) scale(${data.scale})`;
}

function makeDraggable(el, stateKey) {
  el.style.cursor = 'grab';

  el.addEventListener('mousedown', (event) => {
    dragState = {
      type: stateKey,
      lastX: event.clientX,
      lastY: event.clientY
    };
    selectedLayer = stateKey;
    layerSelect.value = stateKey;
    syncControlInputs();
    renderLayerPanel();
    el.style.cursor = 'grabbing';
    event.preventDefault();
  });
}

function updateZIndexes() {
  const baseOrder = state.layerOrder;
  backWrapperEl.style.zIndex = baseOrder.indexOf('back-wrapper') + 1;
  tieLayerEl.style.zIndex = baseOrder.indexOf('tie') + 1;
  frontWrapperEl.style.zIndex = baseOrder.indexOf('front-wrapper') + 1;
  flowerLayerEl.style.zIndex = baseOrder.indexOf('flowers') + 1;

  // Flowers inside layer are ordered by array index to preserve manual ordering
  state.flowers.forEach((flower, index) => {
    const flowerElements = flowerLayerEl.querySelectorAll('img');
    if (flowerElements[index]) {
      flowerElements[index].style.zIndex = index + 1;
    }
  });
}

function renderLayerTransforms() {
  applyTransform(backWrapperEl, state.backWrapper);
  applyTransform(frontWrapperEl, state.frontWrapper);
  applyTransform(tieLayerEl, state.tie);
  renderFlowerLayer();
  updateZIndexes();
}

function syncControlInputs() {
  let currentState;
  if (layerSelect.value === 'back-wrapper') currentState = state.backWrapper;
  else if (layerSelect.value === 'front-wrapper') currentState = state.frontWrapper;
  else if (layerSelect.value === 'tie') currentState = state.tie;
  else if (layerSelect.value === 'flower' && selectedFlowerIndex >= 0) currentState = state.flowers[selectedFlowerIndex];

  if (!currentState) {
    return;
  }

  posXEl.value = currentState.x;
  posYEl.value = currentState.y;
  scaleEl.value = currentState.scale * 100;
  knobXVal.textContent = currentState.x;
  knobYVal.textContent = currentState.y;
  knobScaleVal.textContent = Math.round(currentState.scale * 100);
}

function updateCurrentLayerFromSliders() {
  const x = Number(posXEl.value);
  const y = Number(posYEl.value);
  const scale = Number(scaleEl.value) / 100;

  if (layerSelect.value === 'back-wrapper') state.backWrapper = { ...state.backWrapper, x, y, scale };
  else if (layerSelect.value === 'front-wrapper') state.frontWrapper = { ...state.frontWrapper, x, y, scale };
  else if (layerSelect.value === 'tie') state.tie = { ...state.tie, x, y, scale };
  else if (layerSelect.value === 'flower' && selectedFlowerIndex >= 0) {
    const flower = state.flowers[selectedFlowerIndex];
    if (flower) state.flowers[selectedFlowerIndex] = { ...flower, x, y, scale };
  }

  renderLayerTransforms();
}

function updateLayerDisplay() {
  selectedLayer = layerSelect.value;
  flowerSelect.style.display = selectedLayer === 'flower' ? 'block' : 'none';
  if (selectedLayer !== 'flower') {
    selectedFlowerIndex = -1;
  }
  renderLayerPanel();
  syncControlInputs();
}

function initDownloadBtn() {
  downloadBtn.addEventListener('click', () => {
    html2canvas(document.getElementById('canvas'), { backgroundColor: '#F9F6F0', scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'flower-bouquet.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });
}

function resetBouquet() {
  selectedWrapper = 'pink';
  selectedTie = null;
  selectedLayer = 'back-wrapper';
  selectedFlowerIndex = -1;

  state.backWrapper = { x: 50, y: 0, scale: 1 };
  state.frontWrapper = { x: 50, y: 0, scale: 1 };
  state.tie = { x: 50, y: 52, scale: 1 };
  state.flowers = [];
  state.layerOrder = ['back-wrapper', 'flowers', 'tie', 'front-wrapper'];

  setWrapperColor(selectedWrapper);
  renderFlowerLayer();
  renderLayerPanel();
  updateLayerDisplay();
  renderLayerTransforms();

  tieLayerEl.src = '';
  tieLibraryEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
  flowerLibraryEl.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
}

layerSelect.addEventListener('change', () => {
  selectedLayer = layerSelect.value;
  updateLayerDisplay();
});

layerUpBtn.addEventListener('click', () => moveLayer('up'));
layerDownBtn.addEventListener('click', () => moveLayer('down'));

resetBtn.addEventListener('click', resetBouquet);

flowerSelect.addEventListener('change', () => {
  selectedFlowerIndex = Number(flowerSelect.value);
  syncControlInputs();
});

[posXEl, posYEl, scaleEl].forEach(input => input.addEventListener('input', () => {
  updateCurrentLayerFromSliders();
  syncControlInputs();
}));

layerUpRightBtn.addEventListener('click', () => moveLayer('up'));
layerDownRightBtn.addEventListener('click', () => moveLayer('down'));

window.addEventListener('mousemove', (event) => {
  if (!dragState) return;
  const dx = event.clientX - dragState.lastX;
  const dy = event.clientY - dragState.lastY;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;

  const deltaX = dx / 5;
  const deltaY = dy / 5;

  if (dragState.type === 'flower' && dragState.index >= 0) {
    const flower = state.flowers[dragState.index];
    if (flower) {
      flower.x = Math.min(120, Math.max(0, flower.x + deltaX));
      flower.y = Math.min(120, Math.max(0, flower.y + deltaY));
      renderLayerTransforms();
      syncControlInputs();
    }
    return;
  }

  const key = dragState.type;
  if (!key || !state[key]) return;

  state[key].x = Math.min(120, Math.max(0, state[key].x + deltaX));
  state[key].y = Math.min(120, Math.max(0, state[key].y + deltaY));
  renderLayerTransforms();
  syncControlInputs();
});

window.addEventListener('mouseup', () => {
  dragState = null;
  [backWrapperEl, frontWrapperEl, tieLayerEl].forEach(el => {
    el.style.cursor = 'grab';
  });
});

createWrapperSwatches();
createFlowerLibrary();
createTieLibrary();
setWrapperColor(selectedWrapper);
makeDraggable(backWrapperEl, 'back-wrapper');
makeDraggable(frontWrapperEl, 'front-wrapper');
makeDraggable(tieLayerEl, 'tie');
refreshFlowerSelect();
renderLayerPanel();
updateLayerDisplay();
renderLayerTransforms();
initDownloadBtn();
