(function () {
  var activePlayers = [];

  function attachVideo(video) {
    if (!video || video.dataset.ready === "true") {
      return;
    }
    var source = video.getAttribute("data-hls");
    if (!source) {
      return;
    }
    video.dataset.ready = "true";
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      activePlayers.push(hls);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  document.querySelectorAll("[data-video-shell]").forEach(function (shell) {
    var video = shell.querySelector("video[data-hls]");
    var cover = shell.querySelector("[data-play-cover]");
    var button = shell.querySelector("[data-play-button]");
    var start = function () {
      attachVideo(video);
      if (cover) {
        cover.classList.add("hidden");
      }
      if (video) {
        video.play().catch(function () {});
      }
    };
    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        attachVideo(video);
      }, { once: true });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
    }
  });

  window.addEventListener("pagehide", function () {
    activePlayers.forEach(function (hls) {
      hls.destroy();
    });
    activePlayers = [];
  });
})();
