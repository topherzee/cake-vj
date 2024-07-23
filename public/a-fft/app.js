
document.body.addEventListener("click", init);

async function init() {
  document.body.removeEventListener("click", init);

  const audioCtx = new AudioContext();
  const voiceSelect = document.getElementById("voice");
  let source;

  // Set up the different audio nodes we will use for the app
  const analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.50;//.85

  const gainNode = audioCtx.createGain();

  // Set up canvas context for visualizer
  const canvas = document.getElementById("music_canvas");
  const canvasCtx = canvas.getContext("2d");

  const intendedWidth = document.querySelector(".wrapper").clientWidth;
  canvas.setAttribute("width", intendedWidth);

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
    const HEIGHT = canvas.height / 2;

    analyser.fftSize = 256;
    const bufferLengthAlt = analyser.frequencyBinCount;
    console.log("bufferLengthAlt", bufferLengthAlt);

    // See comment above for Float32Array()
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    let bins = [
        {min: 0.02, max: 0.05},
        {min: 0.2, max: 0.25},
        {min: 0.5, max: 0.99},
    ]

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


        //LOW MID HIGH
        for (let b=0; b<bins.length; b++){
            bins[b].total = 0;
            bins[b].count = 0;
        }

        for (let i = 0; i < bufferLengthAlt; i++) {
            const ratio = i / bufferLengthAlt;

            for (let b=0; b<bins.length; b++){
                if (ratio >= bins[b].min && ratio <= bins[b].max){
                    bins[b].total = bins[b].total + dataArrayAlt[i];
                    bins[b].count++;
                }
            }
        }
        for (let b=0; b<bins.length; b++){

            const barHeight = bins[b].total / bins[b].count;
            // const barHeight = bins[b].total ;
            const barWidth = (bins[b].max - bins[b].min) * WIDTH;
            x = bins[b].min * WIDTH ;

            canvasCtx.fillStyle = "rgb(50," + (barHeight + 100) + ",50)";
            canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
            );
        }
    };

    drawAlt();
    
  }

}