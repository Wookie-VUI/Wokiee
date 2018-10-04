/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
  realAudioInput = null,
  inputPoint = null,
  audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var volume;

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
  // audioRecorder.exportWAV( doneEncoding );
  // could get mono instead bgetByteFrequencyDatay saying
  audioRecorder.exportMonoWAV(doneEncoding);
}

function gotBuffers(buffers) {
  var canvas = document.getElementById("wavedisplay");

  drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

  // the ONLY time gotBuffers is called is right after a new recording is completed -
  // so here's where we should set up the download.
  audioRecorder.exportMonoWAV(doneEncoding);
}

function handlePlayCommand(data) {
  artyom.say('Playing a random song, press enter when you are done listening.', {
    onEnd: function() {
      var audio = new Audio('/music/' + data.song.path);
      audio.play();

      $(audio).on("ended", function(){
           audio.currentTime = 0;
           $('#info-msg').html('<p>Hold down the space bar to send a command.</p>');
      });

      $('#info-msg').html('<p>Playing ' + data.song.name + '</p>Press Enter to stop');

      $("body").keydown(function(event) {
        if (event.which == 13 && !audio.paused) {
          audio.pause();
          $('#info-msg').html('<p>Hold down the space bar to send a command.</p>');
        }
      });
    }
  });
}

function handleLightCommand(data) {
  if (data.state === 'off') {
    $('.dark-bg').show();
  } else {
    $('.dark-bg').hide();
  }
}

function doneEncoding(blob) {
  if (userName !== '') {
    var filename = userName + '_' + Date.now() + ".wav";
    var fd = new FormData();

    fd.append('username', userName);
    fd.append('fname', filename);
    fd.append('data', blob);

    var request = $.ajax({
      method: 'POST',
      url: '/upload',
      data: fd,
      processData: false,
      contentType: false
    });

    request.done(function(data) {
      if (typeof data === 'object') {
        if (data.cmd) {
          if (data.cmd === 'play' && data.song.path) {
            handlePlayCommand(data);
          } else if (data.cmd === 'light') {
            handleLightCommand(data);
          }
        } else {
          window.location.replace(data.path);
        }
      } else {
        artyom.say(data);
      }
    });

    request.fail(function(jqXHR, textStatus) {
      console.log('Something wrong happened while sending the audio file');
    });

  }
}

function toggleRecording(e) {
  if (e.classList.contains("recording")) {
    // stop recording
    audioRecorder.stop();
    e.classList.remove("recording");
    audioRecorder.exportMonoWAV(doneEncoding);
  } else {
    // start recording
    if (!audioRecorder)
      return;
    e.classList.add("recording");
    audioRecorder.clear();
    audioRecorder.record();
  }
}

function convertToMono(input) {
  var splitter = audioContext.createChannelSplitter(2);
  var merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 0, 1);
  return merger;
}

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame(rafID);
  rafID = null;
}

var sampleAudioStream = function(freqByteData) {
  // calculate an overall volume value
  var total = 0;
  for (var i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
    total += freqByteData[i];
  }
  volume = total;
};

function updateAnalysers(time) {
  var canvas;
  if (!analyserContext) {
    canvas = document.getElementById('analyser');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    analyserContext = canvas.getContext('2d');
  }

  // analyzer draw code here
  {
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData);

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBg();
    makePolygonArray(analyserContext);
    resizeCanvas(canvas, analyserContext);
    tiles.forEach(function(tile) {
      tile.drawPolygon();
    });

    tiles.forEach(function(tile) {
      if (tile.highlight > 0) {
        tile.drawHighlight();
      }
    });
    setInterval(rotateForeground, 20);
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', this.resizeCanvas, false);
  }

  rafID = window.requestAnimationFrame(updateAnalysers);
}

function toggleMono() {
  if (audioInput != realAudioInput) {
    audioInput.disconnect();
    realAudioInput.disconnect();
    audioInput = realAudioInput;
  } else {
    realAudioInput.disconnect();
    audioInput = convertToMono(realAudioInput);
  }

  audioInput.connect(inputPoint);
}

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  audioInput.connect(inputPoint);

  //    audioInput = convertToMono( input );

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  inputPoint.connect(analyserNode);

  audioRecorder = new Recorder(inputPoint);

  zeroGain = audioContext.createGain();
  zeroGain.gain.value = 0.0;
  inputPoint.connect(zeroGain);
  zeroGain.connect(audioContext.destination);
  updateAnalysers();
}

function initAudio() {
  if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!navigator.cancelAnimationFrame)
    navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
  if (!navigator.requestAnimationFrame)
    navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

  navigator.getUserMedia({
    "audio": {
      "mandatory": {
        "googEchoCancellation": "false",
        "googAutoGainControl": "false",
        "googNoiseSuppression": "false",
        "googHighpassFilter": "false"
      },
      "optional": []
    },
  }, gotStream, function(e) {
    alert('Error getting audio');
    console.log(e);
  });
}

window.addEventListener('load', initAudio);
