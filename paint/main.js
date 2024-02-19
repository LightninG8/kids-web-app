(() => {
  document.addEventListener("DOMContentLoaded", () => {
    // Safari фикс 1vh
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    const canvas = document.querySelector(".game__canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = 320;
    canvas.height = 420;

    // Добавляем картинку
    const img = new Image();

    // Привязываем функцию к событию onload
    // Это указывает браузеру, что делать, когда изображение загружено
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };

    // Загружаем файл изображения
    img.src = "./image.png";

    // Обработка нажатий
    function fill(e) {
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
      let ex = e.layerX || e.changedTouches[0].pageX - 5 + workspace.scrollLeft,
        ey =
          e.layerY || e.changedTouches[0].pageY - 5 - 92 + workspace.scrollTop;

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let initialColor = rgb2hex(ctx.getImageData(ex, ey, 1, 1).data);

      // Цвет заливки
      let newColor = "#A0D160";

      console.log(initialColor, newColor);

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
            if (rgb2hex(getPixel(x, y)) == iColor) {
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
    }

    canvas.addEventListener("mousedown", fill);
    canvas.addEventListener("touch", fill);
  });
})();
