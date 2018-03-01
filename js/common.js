function trace(arg) {
  var now = (window.performance.now() / 1000).toFixed(3);
  console.log(now + ': ', arg);
}

function updateCanvas(cb) {
  var loop = function() {
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle
    cb();
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

function openCamera() {
  navigator.getUserMedia({ video: true }, function(stream) {
    self.video.src = window.URL.createObjectURL(stream)
  }, function(err) {
    throw err
  })
}