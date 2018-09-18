# Wokiee
Voice User Coding Interface

# Speech to Text (STT) with PocketSphinx

To get started, use the [CMUSphinx tutorial](https://cmusphinx.github.io/wiki/tutorialadapt/)

# Useful comands and tools for work with sound (sox, pocketsphinx training, etc.)
```sh
# compilation
gcc -o kift kift2.c get_hyp.c -DMODELDIR=\"`pkg-config --variable=modeldir pocketsphinx`\" \
    `pkg-config --cflags --libs pocketsphinx sphinxbase`


# Generating acoustic feature files
sphinx_fe -argfile models/feat.params -samprate 16000 -c arctic20.fileids -di . -do . -ei wav -eo mfc -mswav yes


# tutorial based bw adaptation (doesn't work)
./bw \
 -hmmdir models \
 -moddeffn models/mdef.txt \
 -ts2cbfn .ptm. \
 -lda models/feature_transform \
 -feat 1s_c_d_dd \
 -svspec 0-12/13-25/26-38 \
 -cmn current \
 -agc none \
 -dictfn cmudict-en-us.dict \
 -ctlfn arctic20.fileids \
 -lsnfn arctic20.transcription \
 -accumdir .


# bw with removed -svspec and -ts2cbfn .cont.
# it works !!!
# from here https://sourceforge.net/p/cmusphinx/discussion/help/thread/0c127638/
./bw \
 -hmmdir models \
 -moddeffn models/mdef.txt \
 -ts2cbfn .cont. \
 -lda models/feature_transform \
 -feat 1s_c_d_dd \
 -cmn current \
 -agc none \
 -dictfn cmudict-en-us.dict \
 -ctlfn arctic20.fileids \
 -lsnfn arctic20.transcription \
 -accumdir .


# cheap model adaptation
 ./mllr_solve \
    -meanfn models/means \
    -varfn models/variances \
    -outmllrfn mllr_matrix -accumdir .


# converts the sample rate of all .wav files in the folder (dangerous)
for i in *.wav; do sox $i -r 16k -b 16 -e signed-integer $i channels 1; done


# records with needed sample rate
rec -c 1 -r 16000 -b 16 -e signed-integer sergii.wav


# splits file by silence
# from here https://unix.stackexchange.com/questions/318164/sox-split-audio-on-silence-but-keep-silence
sox -V3 sergii.wav sergii_.wav \
silence 1 0.5 0.1% 1 0.5 0.1% : newfile : restart


# plays all .wav files
for i in *.wav; do play $i; done


# recognize text from the microphone
pocketsphinx_continuous -hmm models -lm en-us.lm.bin -dict cmudict-en-us.dict -inmic yes


# recognize text from
pocketsphinx_continuous -hmm models -lm en-us.lm.bin -dict cmudict-en-us.dict -infile <filename>
```
