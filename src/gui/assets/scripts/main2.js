let pieces, radius, fft, audio, uploadedAudio;
const colorPalette = ["#e1ebf7", "#2a86dd", "#96c2f7","#00f9d9"];
let uploadLoading = true;
let uploadAnim;

// function preload () {
  // audio = loadSound();
// }

const fi = "../../KIFT/app/public/music/m83-midnight-city.mp3";

function uploaded() {
  // uploadLoading = true;
  uploadedAudio = loadSound(fi, uploadedAudioPlay);
}

document.body.addEventListener('keydown', function (event) {
  if (event.which === 13) {
    uploaded();
  }
  // console.log(event.which);
});

function uploadedAudioPlay(audioFile) {
  uploadLoading = false;

  // if (audio.isPlaying()) {
  audio.stop();
  // }

  audio = audioFile;
  audio.play();
  fft.setInput(audio);
}

function setup () {
  uploadAnim = document.getElementById("p5_loading");

  createCanvas(windowWidth, windowHeight);

  audio = new p5.AudioIn();
  audio.start();
  fft = new p5.FFT();

  fft.setInput(audio);
  // audio.loop();

  pieces = 4;
  radius = windowHeight / 4;
}

function draw () {
  // // Add a loading animation for the uploaded track
  // if (uploadLoading) {
  //   // uploadAnim.addClass('is-visible');
  //   uploadAnim.style.display = 'block';
  // } else {
  //   uploadAnim.style.display = "none";
  //   // uploadAnim.removeClass('is-visible');
  // }

  setTimeout(() => {
    uploadAnim.style.display = 'none';
  }, 3200);

  background(colorPalette[0]);

  fft.analyze();
  const bass = fft.getEnergy("bass");
  const treble = fft.getEnergy(100, 150);
  const mid = fft.getEnergy("mid");

  const mapbass = map(bass, 0, 255, -100, 800);
  const scalebass = map(bass, 0, 255, 0.5, 1.2);

  const mapMid = map(mid, 0, 255, -radius / 4, radius * 4);
  const scaleMid = map(mid, 0, 255, 1, 1.5);

  const mapTreble = map(treble, 0, 255, -radius / 4, radius * 4);
  const scaleTreble = map(treble, 0, 255, 1, 1.5);

  pieces = 1.0234567;
  radius = 44.5;

  // console.log("pieces:", pieces, "radius:", radius)

  translate(width / 2, height / 2);

  for (i = 0; i < pieces; i += 0.01) {

    rotate(TWO_PI / pieces);

    /*----------  BASS  ----------*/
    push();
    strokeWeight(1);
    stroke(colorPalette[1]);
    scale(scalebass);
    rotate(frameCount * -0.1);
    line(mapbass, radius / 2, radius, radius);
    line(-mapbass, -radius / 2, radius, radius);
    pop();


    /*----------  MID  ----------*/
    push();
    strokeWeight(1);
    stroke(colorPalette[2]);
    line(mapMid, radius, radius * 2, radius * 2);
    pop();


    /*----------  TREMBLE  ----------*/
    push();
    stroke(colorPalette[3]);
    scale(scaleTreble);
    rotate(frameCount * 0.1);
    line(mapTreble, radius / 2, radius, radius);
    pop();
  }

}

// function toggleAudio () {
//   if (audio.isPlaying()) {
//     audio.pause();
//   } else {
//     audio.play();
//   }
// }

function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}
