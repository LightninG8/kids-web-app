(async () => {
  window.Telegram && window.Telegram?.WebApp.expand();

  document.addEventListener("DOMContentLoaded", async () => {
    // Safari фикс 1vh
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    document.addEventListener("resize", () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    });

    // Сохранение
    function onGameSave() {
      console.log("Finish");
    }

    const gamePopupElem = document.querySelector(".game__popup");
    const popupImageElem = document.querySelector(".popup__image");
    const popupTitleElem = document.querySelector(".popup__title");
    const popupDescriptionElem = document.querySelector(".popup__description");
    const popupButtonElem = document.querySelector(".popup__button");
    const gameVariantElems = document.querySelectorAll(".game__variant");

    gameVariantElems.forEach((el) => {
      el.addEventListener("click", (e) => {
        console.log(e);

        const { name, description, image } = e.target.dataset;

        popupImageElem.src = image;
        popupTitleElem.textContent = name;
        popupDescriptionElem.textContent = description;

        gamePopupElem.classList.add("active");
      });
    });

    popupButtonElem.addEventListener("click", () => {
      onGameSave();
    });
  });
})();
