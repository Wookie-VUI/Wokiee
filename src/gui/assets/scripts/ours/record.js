const mic = require('mic');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');

// const sysDir = path.join(__dirname, '../../../../', 'sys/')
// const recsPath = path.join(__dirname, '../../../../../', 'samples/records/');

function gStreamer() {
  const client = new speech.SpeechClient();
  song = 'flume-insane-feat-moon-holiday.mp3';
  

  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US' // BCP-47 language code
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      // process.stdout.write(
      console.log(
        data.results[0] && data.results[0].alternatives[0] ?
        `Transcription: ${data.results[0].alternatives[0].transcript}\n` :
        `\n\nReached transcription time limit\n`
      );
      // process.exit(0);

      const recognizedText = data.results[0].alternatives[0].transcript.toLowerCase();

      if (recognizedText.search('music') > 0) {
        // play music
        exec('play song', function(err, stdout) {
          if (err) {
            console.log(err);
          }
        })
      } else if (recognizedText.search('google') > 0) {
        // search google
        exec('open http://google.com', function (err, stdout) {
          if (err) {
            console.log(err);
          }
        })
      } else if (recognizedText.search('slack') > 0) {
        // open slack
        exec('open https://holberton-students.slack.com', function (err, stdout) {
          if (err) {
            console.log(err);
          }
        })
      } else if (recognizedText.search('sublime') > 0) {
        // open Sublime
        exec('open -a "Sublime Text"', function (err, stdout) {
          if (err) {
            console.log(err);
          }
        })
      } else {
        // comand wasn't recognized
      }

    });

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: 16000,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream);
}

// function initMic() {
//   console.log('recsPath:', recsPath);
//   const time = new Date();

//   const filename = 'rec_' +
//     time.getUTCMonth() +
//     time.getUTCDate() +
//     time.getUTCFullYear() +
//     time.getUTCHours() +
//     time.getUTCMinutes() +
//     time.getUTCSeconds() +
//     time.getUTCMilliseconds() +
//     '.wav';

//   console.log('filename:', filename);

//   const micInstance = mic({
//     rate: 16000,
//     bitwidth: 16,
//     encoding: 'signed-integer',
//     channels: 1,
//     fileType: 'WAV',
//     // debug: true
//   });

//   const file = recsPath + filename;
//   const micInputStream = micInstance.getAudioStream();
//   const outputFileStream = fs.WriteStream(file);

//   micInputStream.pipe(outputFileStream);

//   micInputStream.on('data', function (data) {
//     // console.log("Recieved Input Stream: " + data.length);
//   });

//   micInputStream.on('stopComplete', function () {
//     console.log("Got SIGNAL stopComplete");

//     exec(`cd ${sysDir} && ./run_google-speech.sh ${file}`, function (err, stdout) {
//       if (err) {
//         console.log(err);
//       }

//       console.log(stdout);

//       process.exit(0);
//     });
//   });

//   micInputStream.on('processExitComplete', function () {
//     console.log("Got SIGNAL processExitComplete");
//   });

//   return micInstance;
// }

let allowed = true;
let mikki;

document.body.addEventListener('keydown', function (event) {
  if (event.repeat != undefined) {
    allowed = !event.repeat;
  }

  if (allowed && event.which == 32) {
    // artyom.shutUp();
    console.log("recording");
    // mikki = initMic();
    // mikki.start();
    gStreamer();
    allowed = false;
  }
});

document.body.addEventListener('keyup', function (event) {
  if (event.which == 32) {
    console.log("Done recording");
    // mikki.stop();
    record.stop();
    allowed = true;
  }
});
