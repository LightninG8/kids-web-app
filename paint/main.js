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

    // ---------- КНОПКИ ----------
    const arrowLeftElem = document.querySelector(".arrow-left");
    const arrowRightElem = document.querySelector(".arrow-right");
    const gameColorsElem = document.querySelector(".game__colors");

    arrowLeftElem.addEventListener('click', () => {
      config.historyStep = Math.min(config.history.length - 1, config.historyStep + 1);

      renderHistoryFrame();
    });

    arrowRightElem.addEventListener('click', () => {
      config.historyStep = Math.max(0, config.historyStep - 1);

      renderHistoryFrame();
    });

    function renderHistoryFrame() {
      console.log(config.historyStep);
      ctx.putImageData(config.history[config.history.length - config.historyStep - 1], 0, 0);
    }

    config.colors.forEach((el) => {
      const colorElem = document.createElement("div");

      colorElem.classList.add("game__color");
      if (el == config.activeColor) {
        colorElem.classList.add("active");
      }
      colorElem.style.backgroundColor = el;
      colorElem.dataset.color = el;

      gameColorsElem.appendChild(colorElem);
    });

    document.querySelectorAll(".game__color").forEach((el) => {
      el.addEventListener("click", (e) => {
        const color = e.target.dataset.color;

        document
          .querySelectorAll(".game__color")
          .forEach((el) => el.classList.remove("active"));

        config.activeColor = color;
        document
          .querySelector(`.game__color[data-color="${color}"]`)
          .classList.add("active");
      });
    });

    // ---------- CANVAS ----------
    const canvas = document.querySelector(".game__canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = 762;
    canvas.height = 1000;

    // Добавляем картинку
    const img = new Image();

    // Привязываем функцию к событию onload
    // Это указывает браузеру, что делать, когда изображение загружено
    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      config.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };

    // Загружаем файл изображения
    img.src = config.image;
    document.documentElement.style.setProperty(
      "--image-cover",
      `url(${config.imageCover})`
    );

    function rgb2hex(rgb) {
      return (
        "#" +
        ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2])
          .toString(16)
          .slice(1)
      );
    }
    function hex2rgb(c) {
      var bigint = parseInt(c.split("#")[1], 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;

      return [r, g, b, 255];
    }

    // Получение списка оттенков серого
    const grayscaleColors = [];

    for (let i = 150; i < 255; i++) {
      grayscaleColors.push(rgb2hex([i, i, i]));
    }

    // Обработка нажатий
    function fill(e) {
      // Получаем координаты события клика или касания
      let canvasRect = canvas.getBoundingClientRect();
      let ex = Math.round(e.layerX * canvas.width / canvasRect.width),
          ey = Math.round(e.layerY * canvas.height / canvasRect.height);
  
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let initialColor = rgb2hex(ctx.getImageData(ex, ey, 1, 1).data);

      // Цвет заливки
      let newColor = config.activeColor;

      function getPixel(x, y) {
        let pixel = [];
        for (let i = 0; i <= 3; i++) {
          pixel.push(imageData.data[y * (imageData.width * 4) + x * 4 + i]);
        }
        return pixel;
      }

      // Функция окрашивания клеток
      function drawPixels(pixel, iColor, nColor) {
        // Объявить пустую очередь Q
        let queue = [];

        // Если цвет элемента - не заменяемый цвет, возврат.

        // if (iColor.toLowerCase() == nColor.toLowerCase()) {
        //   return;
        // }

        if (iColor.toLowerCase() == nColor.toLowerCase()) {
          return;
        }

        // Поместить элемент в конец Q.
        queue.push(pixel);

        // До тех пор, пока Q не пуста:
        while (queue.length != 0) {
          // Присвоить n первый элемент Q
          let curPixel = queue[0].slice(0);

          // Если цвет n - заменяемый цвет, установить его в цвет заливки.
          if (rgb2hex(getPixel(curPixel[0], curPixel[1])) == iColor) {
            for (let i = 0; i <= 3; i++) {
              imageData.data[
                curPixel[1] * (imageData.width * 4) + curPixel[0] * 4 + i
              ] = hex2rgb(nColor)[i];
            }
          }

          // Вытолкнуть первый элемент из Q
          queue.shift();

          function fillPixel(x, y) {
            if ((x >= canvas.width || x < 0 || y >= canvas.height || y < 0)) {
              return;
            }
            if (
              rgb2hex(getPixel(x, y)) == iColor ||
              grayscaleColors.includes(rgb2hex(getPixel(x, y)))
            ) {
              // Установить цветом этого элемента цвет заливки
              for (let i = 0; i < 3; i++) {
                imageData.data[y * (imageData.width * 4) + x * 4 + i] =
                  hex2rgb(nColor)[i];
              }
              queue.push([x, y]);
            }
          }

          // Проверка по сторонам
          fillPixel(curPixel[0] - 1, curPixel[1]);
          fillPixel(curPixel[0] + 1, curPixel[1]);
          fillPixel(curPixel[0], curPixel[1] - 1);
          fillPixel(curPixel[0], curPixel[1] + 1);
        }

        ctx.putImageData(imageData, 0, 0);

        return;
      }
      drawPixels([ex, ey], initialColor, newColor);

      if (config.historyStep) {
        config.history = config.history.slice(0, config.history.length - config.historyStep);

        config.historyStep = 0;
      }

      config.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    canvas.addEventListener("mousedown", fill);
    canvas.addEventListener("touchstart", fill);
  });
})();
