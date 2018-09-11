window.document.onload = () => {
  // import SpeechToText from 'speech-to-text';

  const onAnythingSaid = text => console.log(`Intermediate text: ${text}`);
  const onFinalised = text => console.log(`Finalised text: ${text}`);

  try {
    const listener = new SpeechToText(onAnythingSaid, onFinalised);
    listener.startListening();
  } catch (error) {
    console.log(error);
  }

}
