(async () => {
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

    let config = {};

    await fetch("./gameConfig.json")
      .then((res) => res.json())
      .then((json) => {
        config = json;
      });

    let currentQuestionIdx = 0;
    let hasWrongAnswers = false;

    let isClickAvailable = true;

    const gameWindowElem = document.querySelector(".game__window");
    const gameAnswersElems = document.querySelectorAll(".answer");

    function finishGame() {
      console.log("finish", hasWrongAnswers);
    }

    function clearAnswersState() {
      gameAnswersElems.forEach((el) => {
        el.classList.remove("right");
        el.classList.remove("wrong");
      });
    }

    function renderQuestion(index) {
      isClickAvailable = true;

      const currentQuestion = config.questions[index];

      gameWindowElem.textContent = currentQuestion.question;

      clearAnswersState();
    }

    renderQuestion(currentQuestionIdx);

    gameAnswersElems.forEach((el) => {
      el.addEventListener("click", (e) => {
        if (!isClickAvailable) {
          return;
        }
    
        if (
          +e.target.dataset.value == config.questions[currentQuestionIdx].answer
        ) {
          e.target.classList.add("right");
        } else {
          e.target.classList.add("wrong");

          hasWrongAnswers = true;
        }

        isClickAvailable = false;

        setTimeout(() => {
          if (currentQuestionIdx == config.questions.length - 1) {
            clearAnswersState();

            finishGame();

            return;
          }

          renderQuestion(++currentQuestionIdx);
        }, 1500);
      });
    });
  });
})();
