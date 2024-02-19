(async () => {
  window.Telegram && window.Telegram?.WebApp.expand();


  document.addEventListener("DOMContentLoaded", async () => {
    // Safari фикс 1vh
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    const gameWrapperElem = document.querySelector(".game__wrapper");
    const gameWindowElem = document.querySelector(".game__window");
    const gameTrashElem = document.querySelector(".game__trash");

    // Добавляем ответы
    await fetch("./gameConfig.json")
      .then((response) => response.json())
      .then((config) => {
        config.items.forEach((el) => {
          const answerElem = document.createElement("div");

          const answerImgElem = document.createElement("img");

          answerImgElem.setAttribute("src", el.img);
          answerImgElem.setAttribute("alt", el.name);
          answerImgElem.classList.add("game__image");

          answerElem.appendChild(answerImgElem);

          answerElem.classList.add("game__item");
          answerElem.style.left = el.x + "px";
          answerElem.style.top = el.y + "px";

          gameWindowElem.appendChild(answerElem);
        });
      });

    // Финиш
    function onGameFinished() {
      console.log("You win");
    }

    // Drag and Drop
    function dragStart(elem, startPageX, startPageY) {
      if (
        !window.Telegram?.WebApp ? window.Telegram?.WebApp?.isExpanded : true
      ) {
        return;
      }

      const startElemLeft = +elem.style.left.replace("px", "");
      const startElemTop = +elem.style.top.replace("px", "");

      function dragMove(pageX, pageY) {
        const deltaX = pageX - startPageX;
        const deltaY = pageY - startPageY;

        elem.style.left = startElemLeft + deltaX + "px";
        elem.style.top = startElemTop + deltaY + "px";
      }

      function dragEnd(pageX, pageY) {
        // Если за пределами окна
        if (!isCursorInsideTrash(pageX, pageY)) {
          if (!isImageInsideWindow(elem)) {
            elem.style.left = startElemLeft + "px";
            elem.style.top = startElemTop + "px";
          }

          return;
        }
  
        gameWindowElem.removeChild(elem);

        if (isGameFinished()) {
          onGameFinished();
        }

        elem.removeEventListener("mousedown", onMouseDown);
        elem.removeEventListener("touchstart", onTouchStart);
      }

      function onMouseMove(e) {
        const { pageX, pageY } = e;

        dragMove(pageX, pageY);
      }

      function onMouseUp(e) {
        const { pageX, pageY } = e;

        dragEnd(pageX, pageY);

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      }

      function onTouchMove(e) {
        const { pageX, pageY } = e.changedTouches[0];

        dragMove(pageX, pageY);
      }

      function onTouchEnd(e) {
        const { pageX, pageY } = e.changedTouches[0];

        dragEnd(pageX, pageY);

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      }

      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }

    function onMouseDown(e) {
      const { pageX, pageY } = e;

      dragStart(e.target.parentElement, pageX, pageY);
    }

    function onTouchStart(e) {
      const { pageX, pageY } = e.changedTouches[0];

      dragStart(e.target.parentElement, pageX, pageY);
    }

    document.querySelectorAll(".game__window .game__item").forEach((el) => {
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("touchstart", onTouchStart);
    });

    // Если курсор в над корзиной
    function isCursorInsideTrash(x, y) {
      const trashRect = gameTrashElem.getBoundingClientRect();

      if (
        x >= trashRect.left &&
        x <= trashRect.right &&
        y >= trashRect.top &&
        y <= trashRect.bottom
      ) {
        return true;
      }

      return false;
    }

    // Если курсор в над корзиной
    function isImageInsideWindow(elem) {
      const elemRect = elem.getBoundingClientRect();
      const windowRect = gameWindowElem.getBoundingClientRect();

      if (
        elemRect.left >= windowRect.left &&
        elemRect.right <= windowRect.right &&
        elemRect.top >= windowRect.top &&
        elemRect.bottom <= windowRect.bottom
      ) {
        return true;
      }

      return false;
    }

    // Закончилась ли игра
    function isGameFinished() {
      return !document.querySelectorAll('.game__window .game__item').length;
    }
  });
})();
