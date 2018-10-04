window.onload = () => {
  const exec = require('child_process').exec;

  // console.log(process)

  const dir = exec("whoami", function (err, stdout, stderr) {
    if (err) {
      console.log(err);
    }

    // const user = stdout // Will be equal to unix username
    // for demo purpose
    const user = "Sergio"

    require('./assets/scripts/ours/record');

    artyom.say(`Welcome ${user}! How may I help you?`);
  });
}
