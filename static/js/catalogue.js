(() => {
  const catalogue = document.querySelector(".catalogue");
  if (!catalogue) return;
  const grid = catalogue.querySelector(".catalogue-grid");
  const empty = catalogue.querySelector(".catalogue-empty");
  const error = catalogue.querySelector(".catalogue-error");
  const dialog = document.querySelector(".product-dialog");
  const dialogImage = dialog.querySelector("img");
  const dialogCode = dialog.querySelector(".dialog-code");
  const dialogPrice = dialog.querySelector(".dialog-price");
  const dialogCount = dialog.querySelector(".dialog-count");
  const productName = catalogue.dataset.productName;
  let activeProduct, activeColor = 0;

  const price = value => "₹" + String(value);
  const renderDialog = () => {
    const color = activeProduct.colors[activeColor];
    dialogImage.src = color.image;
    dialogImage.alt = activeProduct.code + " in " + color.color;
    dialogCode.textContent = activeProduct.code;
    dialogPrice.textContent = price(activeProduct.price);
    dialogCount.textContent = (activeColor + 1) + " / " + activeProduct.colors.length;
  };
  const shiftDialog = amount => {
    activeColor = (activeColor + amount + activeProduct.colors.length) % activeProduct.colors.length;
    renderDialog();
  };
  const addSwipe = (element, previous, next) => {
    let x = 0, y = 0;
    element.addEventListener("touchstart", event => {
      const touch = event.changedTouches[0]; x = touch.screenX; y = touch.screenY;
    }, { passive: true });
    element.addEventListener("touchend", event => {
      const touch = event.changedTouches[0], dx = touch.screenX - x, dy = touch.screenY - y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : previous();
    }, { passive: true });
  };
  const open = (product, index) => {
    activeProduct = product; activeColor = index; renderDialog();
    if (!dialog.open) dialog.showModal();
  };
  const createCard = product => {
    let index = 0;
    const column = document.createElement("div");
    column.className = "col";
    column.innerHTML = `<article class="collection-card h-100">
      <button class="collection-image-button" type="button"><img class="collection-image" src="" alt=""><span class="image-hint">Tap to view larger</span></button>
      <div class="collection-details"><h2 class="product-code-main"></h2><p class="product-price"></p>
        <div class="collection-controls"><button class="collection-arrow previous" type="button" aria-label="Previous colour">&larr;</button><span class="collection-count"></span><button class="collection-arrow next" type="button" aria-label="Next colour">&rarr;</button></div>
      </div>
    </article>`;
    const image = column.querySelector(".collection-image");
    const code = column.querySelector(".product-code-main");
    const amount = column.querySelector(".product-price");
    const count = column.querySelector(".collection-count");
    const show = next => {
      index = (next + product.colors.length) % product.colors.length;
      const color = product.colors[index];
      image.src = color.image; image.alt = product.code + " in " + color.color;
      code.textContent = product.code;
      amount.textContent = price(product.price); count.textContent = (index + 1) + " / " + product.colors.length;
    };
    column.querySelector(".previous").onclick = () => show(index - 1);
    column.querySelector(".next").onclick = () => show(index + 1);
    column.querySelector(".collection-image-button").onclick = () => open(product, index);
    addSwipe(column.querySelector(".collection-image-button"), () => show(index - 1), () => show(index + 1));
    show(0); return column;
  };
  fetch(catalogue.dataset.catalogue).then(response => {
    if (!response.ok) throw new Error("Data unavailable");
    return response.json();
  }).then(products => {
    if (!products.length) { empty.classList.remove("d-none"); return; }
    products.forEach(product => grid.append(createCard(product)));
  }).catch(() => error.classList.remove("d-none"));

  dialog.querySelector(".dialog-close").onclick = () => dialog.close();
  dialog.querySelector(".dialog-previous").onclick = () => shiftDialog(-1);
  dialog.querySelector(".dialog-next").onclick = () => shiftDialog(1);
  addSwipe(dialog.querySelector(".product-dialog-image"), () => shiftDialog(-1), () => shiftDialog(1));
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
})();