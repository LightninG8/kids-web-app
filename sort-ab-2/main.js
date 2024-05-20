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
    let currentQuestion = 0;
    let currentPart = 0;

    const regex = new RegExp("[\\?&]cid=([^&#]+)");
    const match = regex.exec(window.location.href);

    let cid;
    if (match && match.length) {
      cid = decodeURIComponent(match[1]).toString();
    }

    // Читаем конфиг
    await fetch(`./configs/gameConfig_${cid || 11}.json`)
      .then((response) => response.json())
      .then((data) => {
        config = data;
      });

    // Функция сохранения
    function onGameSave() {
      sendScreenshot();

      // Если последняя часть
      if (currentPart == config.parts.length - 1) {
        onFinish();
      } else {
        onBetweenParts();
      }
    }

    function sendScreenshot() {
      html2canvas(document.body).then(async (canvas) => {
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

    function nextPart() {
      currentPart += 1;
      currentQuestion = 0;

      gameFrame.classList.remove("active");
      gameQuiz.classList.add("active");
      gameWindowGood.innerHTML = "";
      gameWindowBad.innerHTML = "";

      showQuestion(0);
    }

    // Между частями
    function onBetweenParts() {
      console.log("between");
      nextPart();
    }

    // Конец игры (после последней части)
    function onFinish() {
      console.log("finish");
    }

    // =============
    const gameQuiz = document.querySelector(".game__quiz");
    const gameFrame = document.querySelector(".game__frame");
    const gameQuestionText = document.querySelector(".game__question .text");
    const gameAnswerGood = document.querySelector(".game__variant.good");
    const gameAnswerBad = document.querySelector(".game__variant.bad");
    const gameWindowGood = document.querySelector(".game__window.good");
    const gameWindowBad = document.querySelector(".game__window.bad");

    const saveButton = document.querySelector(".game__save");
    // ============
    gameAnswerGood.dataset.text = config.goodText;
    gameAnswerBad.dataset.text = config.badText;
    gameWindowGood.dataset.text = config.goodText;
    gameWindowBad.dataset.text = config.badText;

    gameQuestionText.textContent =
      config.parts[currentPart].questions[currentQuestion][0];

    gameAnswerGood.querySelector("img").src = config.goodImg;
    gameAnswerBad.querySelector("img").src = config.badImg;
    document.querySelector(".game__header.good img").src = config.goodImg;
    document.querySelector(".game__header.bad img").src = config.badImg;

    function showQuestion(i) {
      const question = config.parts[currentPart].questions[i][0];

      gameQuestionText.classList.add("opacity");

      setTimeout(() => {
        gameQuestionText.textContent = question;

        gameQuestionText.classList.remove("opacity");
      }, 200);
    }

    // ============
    let prevAudio;

    const onVariantClick = (e) => {
      const question = config.parts[currentPart].questions[currentQuestion];
      const gameAnswer = document.createElement("div");
      gameAnswer.textContent = question[0];
      gameAnswer.classList.add("game__answer");

      document
        .querySelector(`.game__window[data-text="${question[1]}"]`)
        .append(gameAnswer);
      
      let audioPath = ''

      if (e.target.dataset.text == question[1]) {
        e.target.classList.add("true");
        audioPath = './audio/верно.wav';
      } else {
        e.target.classList.add("false");
        audioPath = './audio/ошибка.wav';
      }

      if (audioPath) {
        prevAudio?.pause();

        const audio = new Audio(audioPath);
        audio.play();

        prevAudio = audio;
      }

      setTimeout(() => {
        e.target.classList.remove("true");
        e.target.classList.remove("false");

      }, 300);

      if (currentQuestion != config.parts[currentPart].questions.length - 1) {
        showQuestion(++currentQuestion);
      } else {
        setTimeout(() => {
          gameQuiz.classList.remove("active");
          gameFrame.classList.add("active");
        }, 200);
      }
    };

    gameAnswerGood.addEventListener("click", onVariantClick);
    gameAnswerBad.addEventListener("click", onVariantClick);
    saveButton.addEventListener("click", onGameSave);
  });
})();
