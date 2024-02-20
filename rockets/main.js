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

    const gameAnswersElem = document.querySelector(".game__answers");
    const leftRocketElem = document.querySelector(".rocket-left");
    const rightRocketElem = document.querySelector(".rocket-right");

    let answersLength = 0;

    // Добавляем ответы
    await fetch("./gameConfig.json")
      .then((response) => response.json())
      .then((config) => {
        answersLength = config.answers.length;

        config.answers.forEach((el) => {
          const answerElem = document.createElement("div");

          answerElem.classList.add("game__answer");
          answerElem.textContent = el;

          gameAnswersElem.appendChild(answerElem);
        });
      });

    // Финиш игры
    function onGameFinish() {
      console.log("finish");
    }

    function insertFakeAnswer(elem) {
      const answerElem = document.createElement("div");

      answerElem.classList.add("fake-answer");
      answerElem.classList.add("animate");

      answerElem.style.width = elem.offsetWidth + "px";
      answerElem.style.height = elem.offsetHeight + "px";

      elem.after(answerElem);
    }

    // Drag and Drop
    function dragStart(elem, startPageX, startPageY) {
      if (
        !window.Telegram?.WebApp ? window.Telegram?.WebApp?.isExpanded : true
      ) {
        return;
      }

      const dragStartElem = elem;

      elem.classList.add("drag");

      function dragMove(pageX, pageY) {
        const deltaX = pageX - startPageX;
        const deltaY = pageY - startPageY;

        elem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      }

      function dragEnd(pageX, pageY) {
        function doRocketCheck(elem) {
          const thumbElem = elem.querySelector(".rocket-fill-thumb");

          if (isCursorInsideElem(elem, pageX, pageY)) {
            thumbElem.dataset.value = +thumbElem.dataset.value + 1;
            const fillValue = (+thumbElem.dataset.value / answersLength) * 100;
            thumbElem.style.height = fillValue + "%";
            thumbElem.classList.remove("empty");

            insertFakeAnswer(dragStartElem);

            gameAnswersElem.removeChild(dragStartElem);
          }
        }

        // Если левая ракета
        doRocketCheck(leftRocketElem);

        // Если правая ракета
        doRocketCheck(rightRocketElem);

        elem.classList.remove("drag");
        elem.classList.remove("drag");
        elem.style.transform = `translate(0px, 0px)`;

        if (document.querySelectorAll(".game__window .game__answer").length) {
          onGameFinish();
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

    // Если курсор над элементом
    function isCursorInsideElem(elem, x, y) {
      const windowRect = elem.getBoundingClientRect();

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

    document.querySelectorAll(".game__answer").forEach((el) => {
      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("touchstart", onTouchStart);
    });
  });
})();
