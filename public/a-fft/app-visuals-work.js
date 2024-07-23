const heading = document.querySelector("h1");
heading.textContent = "CLICK HERE TO START";
document.body.addEventListener("click", init);

async function init() {
  heading.textContent = "Voice-change-O-matic";
  document.body.removeEventListener("click", init);

  const audioCtx = new AudioContext();
  const voiceSelect = document.getElementById("voice");
  let source;
  let stream;

  // Grab the mute button to use below
  const mute = document.querySelector(".mute");

  // Set up the different audio nodes we will use for the app
  const analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  const gainNode = audioCtx.createGain();

  // Set up canvas context for visualizer
  const canvas = document.querySelector(".visualizer");
  const canvasCtx = canvas.getContext("2d");

  const intendedWidth = document.querySelector(".wrapper").clientWidth;
  canvas.setAttribute("width", intendedWidth);
  const visualSelect = document.getElementById("visual");
  let drawVisual;

  // Main block for doing the audio recording
  const constraints = { audio: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(gainNode);
    gainNode.connect(analyser)

      visualize();
      
    })
    .catch(function (err) {
      console.error("The following gUM error occured: " + err);
    });

  function visualize() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const visualSetting = visualSelect.value;
    console.log(visualSetting);

    if (visualSetting === "sinewave") {
      analyser.fftSize = 2048;
      const bufferLength = analyser.fftSize;
      console.log(bufferLength);

      // We can use Float32Array instead of Uint8Array if we want higher precision
      // const dataArray = new Float32Array(bufferLength);
      const dataArray = new Uint8Array(bufferLength);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const draw = () => {
        drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";

        canvasCtx.beginPath();

        const sliceWidth = (WIDTH * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * HEIGHT) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
      };

      draw();
    } else if (visualSetting == "frequencybars") {
      analyser.fftSize = 256;
      const bufferLengthAlt = analyser.frequencyBinCount;
      console.log(bufferLengthAlt);

      // See comment above for Float32Array()
      const dataArrayAlt = new Uint8Array(bufferLengthAlt);

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const drawAlt = () => {
        drawVisual = requestAnimationFrame(drawAlt);

        analyser.getByteFrequencyData(dataArrayAlt);

        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLengthAlt; i++) {
          const barHeight = dataArrayAlt[i];

          canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
          canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }
      };

      drawAlt();
    } else if (visualSetting == "off") {
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "red";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  // Event listeners to change visualize and voice settings
  visualSelect.addEventListener("change", () => {
    cancelAnimationFrame(drawVisual);
    visualize();
  });

  mute.addEventListener("click", () => {
    if (mute.id === "") {
      gainNode.gain.value = 0;
      mute.id = "activated";
      mute.innerHTML = "Unmute";
    } else {
      gainNode.gain.value = 1;
      mute.id = "";
      mute.innerHTML = "Mute";
    }
  });
}