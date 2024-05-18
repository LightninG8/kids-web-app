(async () => {
  let config = {};
  let currentTab = 0;

  const regex = new RegExp("[\\?&]cid=([^&#]+)");
  const match = regex.exec(window.location.href);

  let cid;
  if (match && match.length) {
    cid = decodeURIComponent(match[1]).toString();
  }

  console.log(cid);
  // Читаем конфиг
  await fetch(`./configs/gameConfig_${cid || 1}.json`)
    .then((response) => response.json())
    .then((gameConfig) => {
      config = gameConfig;
    });

  // ====================
  // Функция сохранения (финиш)
  function onGameSave() {
    console.log("1");
    html2canvas(document.querySelector("#screenshot")).then(async (canvas) => {
      const dataURL = canvas.toDataURL("image/jpeg");

      const regex = new RegExp("[\\?&]sid=([^&#]+)");
      const match = regex.exec(window.location.href);

      let sid;
      if (match && match.length) {
        sid = decodeURIComponent(match[1]).toString();
      }

      await fetch(
        "https://notifications.mamamoonkids.ru/send_bot_notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            message: 'Скриншот игры "Сортировка"',
            client_id: sid,
            imade_data: dataURL,
          }),
        }
      );
    });
  }
  // ====================
  const gameWindow = document.querySelector(".game__window");
  const gameTitle = document.querySelector(".game__title");
  const gameOptionsHeadersWrapper = document.querySelector(".options__headers");
  const gameOptionsTabsWrapper = document.querySelector(".options__tabs");
  const gameSave = document.querySelector(".game__save");

  // ====================
  gameTitle.textContent = config.title;

  const gameWindowBaseImage = document.createElement("img");
  gameWindowBaseImage.src = config.baseImage;
  gameWindowBaseImage.alt = "";
  gameWindowBaseImage.classList.add("game__image");

  gameWindow.append(gameWindowBaseImage);

  config.tabs.forEach((tab, i) => {
    const tabHeader = document.createElement("div");
    tabHeader.classList.add("options__header");
    tabHeader.innerText = tab.title;
    tabHeader.dataset.id = i;

    const tabBody = document.createElement("div");
    config.isTextPreview && tabBody.classList.add("text-preview")
    tabBody.classList.add("options__tab", "tab");
    tabBody.dataset.id = i;

    tab.images.forEach((image, idx) => {
      const tabOption = document.createElement("div");
      tabOption.classList.add("tab__option");
      if (config.isTextPreview) {
        tabOption.classList.add("text-preview");
        tabOption.innerHTML = `<span>${image.preview}</span>`;
      } else {
        tabOption.style.backgroundImage = `url("${image.preview}")`;
      }
      tabOption.dataset.id = `${i}-${idx}`;

      if (!idx) {
        tabOption.classList.add("active");
      }

      tabBody.append(tabOption);
    });

    const gameLayer = document.createElement("div");
    gameLayer.classList.add("game__layer");
    gameLayer.dataset.id = i;
    gameLayer.innerHTML = `<img class="game__image" src="${tab.images[0].main}" alt=""/>`;

    if (!i) {
      tabBody.classList.add("active");
      tabHeader.classList.add("active");
    }

    gameOptionsHeadersWrapper.append(tabHeader);
    gameOptionsTabsWrapper.append(tabBody);
    gameWindow.append(gameLayer);
  });

  // ====================
  const gameOptionsHeaders = document.querySelectorAll(".options__header");
  const gameOptionsTabs = document.querySelectorAll(".options__tab");
  const gameOptions = document.querySelectorAll(".tab__option");

  gameOptionsHeaders.forEach((el) => {
    el.addEventListener("click", (e) => {
      currentTab = e.target.dataset.id;

      gameOptionsHeaders.forEach((el) => el.classList.remove("active"));
      e.target.classList.add("active");

      gameOptionsTabs.forEach((el) => el.classList.remove("active"));
      document
        .querySelector(`.options__tab[data-id="${currentTab}"]`)
        .classList.add("active");
    });
  });

  let prevAudio;

  gameOptions.forEach((el) => {
    el.addEventListener("click", (e) => {
      document
        .querySelectorAll(`.options__tab[data-id="${currentTab}"] .tab__option`)
        .forEach((el) => el.classList.remove("active"));
      e.target.classList.add("active");

      const id = e.target.dataset.id.split("-");
      const image = config.tabs[id[0]].images[id[1]];

      document.querySelector(
        `.game__layer[data-id="${id[0]}"]`
      ).innerHTML = `<img class="game__image" src="${image.main}" alt=""/>`;

      if (image.audio) {
        prevAudio?.pause();
  
        const audio = new Audio(image.audio);
        audio.play();

        prevAudio = audio;
      }
    });
  });

  gameSave.addEventListener("click", onGameSave);
})();
