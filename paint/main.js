(() => {
  document.addEventListener("DOMContentLoaded", () => {
    // Safari фикс 1vh
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    const canvas1 = document.querySelector(".game__canvas_1");
    const canvas2 = document.querySelector(".game__canvas_2");
    const canvas3 = document.querySelector(".game__canvas_3");
    const ctx1 = canvas1.getContext("2d", { willReadFrequently: true });
    const ctx2 = canvas2.getContext("2d", { willReadFrequently: true });
    const ctx3 = canvas3.getContext("2d", { willReadFrequently: true });

    canvas1.width = 320;
    canvas1.height = 420;

    canvas2.width = 320;
    canvas2.height = 420;

    canvas3.width = 320;
    canvas3.height = 420;

    // Добавляем картинку
    const img1 = new Image();
    const img2 = new Image();
    const img3 = new Image();

    // Привязываем функцию к событию onload
    // Это указывает браузеру, что делать, когда изображение загружено
    img1.onload = function () {
      ctx1.drawImage(img1, 0, 0);
    };

    img2.onload = function () {
      ctx2.drawImage(img2, 0, 0);
    };

    img3.onload = function () {
      ctx3.drawImage(img3, 0, 0);
    };

    // Загружаем файл изображения
    img1.src = "./image.png";
    img2.src = "./image_bw.png";
    img3.src = "./image_bw_paint.png";

    // Обработка нажатий
    function fill(e, canvas, ctx) {
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
      let ex = e.offsetX || e.changedTouches[0].offsetX,
        ey =
          e.offsetY || e.changedTouches[0].offsetY;

          console.log(e);

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

    canvas1.addEventListener("mousedown", (e) => fill(e, canvas1, ctx1));
    canvas1.addEventListener("touch", (e) => fill(e, canvas1, ctx1));

    canvas2.addEventListener("mousedown", (e) => fill(e, canvas2, ctx2));
    canvas2.addEventListener("touch", (e) => fill(e, canvas2, ctx2));

    canvas3.addEventListener("mousedown", (e) => fill(e, canvas3, ctx3));
    canvas3.addEventListener("touch", (e) => fill(e, canvas3, ctx3));
  });
})();
