#!/usr/bin/env node

const fs = require('fs');
const path = require('path')
const ps = require('../builds').ps;

const audioFile = process.argv[2] || null;
const modeldir = path.join('models', '/en-us/')
const config = new ps.Decoder.defaultConfig();

config.setString('-hmm', modeldir + 'en-us');
config.setString('-dict', modeldir + 'cmudict-en-us.dict');
config.setString('-lm', modeldir + 'en-us.lm.bin');

const decoder = new ps.Decoder(config);

fs.readFile(audioFile, (err, data) => {
    if (err) throw err;

    decoder.startUtt();
    decoder.processRaw(data, false, false);
    decoder.endUtt();

    console.log('Recognized! The hypothesis is:', decoder.hyp());
});

