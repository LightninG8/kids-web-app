(async () => {
  document.addEventListener("DOMContentLoaded", async () => {
    // Safari фикс 1vh
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    const WebApp = window.Telegram?.WebApp;

    const gameWrapperElem = document.querySelector(".game__wrapper");
    const gameWindowElem = document.querySelector(".game__window");
    const gameFrameElem = document.querySelector(".game__frame");
    const gameAnswersElem = document.querySelector(".game__answers");
    const gameSaveButtonElem = document.querySelector(".game__save");

    // Добавляем ответы
    await fetch("./gameConfig.json")
      .then((response) => response.json())
      .then((config) => {
        config.answers.forEach((el) => {
          const answerElem = document.createElement("div");

          answerElem.classList.add("game__answer");
          answerElem.textContent = el;
          answerElem.style.top = "0px";

          gameAnswersElem.appendChild(answerElem);
        });
      });

    // Фиксим отступ сверху
    function fixAnswersOffsetTop() {
      let lastTopOffset = 0;

      document
        .querySelectorAll(".game__answers .game__answer")
        .forEach((el) => {
          el.style.top = lastTopOffset + 8 + "px";
          el.style.left = "0px";

          lastTopOffset = lastTopOffset + el.clientHeight + 8;
        });

      document.querySelectorAll(".game__window .game__answer").forEach((el) => {
        el.style.removeProperty("top");
        el.style.removeProperty("left");
      });
    }

    fixAnswersOffsetTop();
    fixAnswersOffsetTop();
    window.addEventListener("resize", fixAnswersOffsetTop);

    // Функция сохранения (финиш)
    function onGameSave() {
      console.log("You win");
    }

    // Drag and Drop
    function dragStart(elem, startPageX, startPageY) {
      if (! WebApp ? WebApp?.isExpanded : true) {
        return;
      }

      const startElemLeft = +elem.style.left.replace("px", "");
      const startElemTop = +elem.style.top.replace("px", "");

      elem.classList.add("drag");
      gameWrapperElem.classList.add("isDragging");

      function dragMove(pageX, pageY) {
        const deltaX = pageX - startPageX;
        const deltaY = pageY - startPageY;

        elem.style.left = startElemLeft + deltaX + "px";
        elem.style.top = startElemTop + deltaY + "px";
      }

      function dragEnd(pageX, pageY) {
        // Если за пределами окна
        if (!isCursorInsideGameWindow(pageX, pageY)) {
          fixAnswersOffsetTop();

          elem.classList.remove("drag");
          gameWrapperElem.classList.remove("isDragging");

          return;
        }

        gameWindowElem.append(elem);

        elem.removeEventListener("mousedown", onMouseDown);
        elem.removeEventListener("touchstart", onTouchStart);

        gameWrapperElem.classList.remove("isDragging");

        fixAnswersOffsetTop();

        if (document.querySelectorAll(".game__window .game__answer").length) {
          gameSaveButtonElem.classList.remove("disable");
        }
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

    // Если курсор в над "окном"
    function isCursorInsideGameWindow(x, y) {
      const windowRect = gameFrameElem.getBoundingClientRect();

      if (
        x >= windowRect.left &&
        x <= windowRect.right &&
        y >= windowRect.top &&
        y <= windowRect.bottom
      ) {
        return true;
      }

      return false;
    }

    function onMouseDown(e) { 
      const { pageX, pageY } = e;

      dragStart(e.target, pageX, pageY);
    }

    function onTouchStart(e) {
      const { pageX, pageY } = e.changedTouches[0];

      dragStart(e.target, pageX, pageY);
    }

    document.querySelectorAll(".game__answers .game__answer").forEach((el) => {
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("touchstart", onTouchStart);
    });

    gameSaveButtonElem.addEventListener("click", onGameSave);
  });
})();
