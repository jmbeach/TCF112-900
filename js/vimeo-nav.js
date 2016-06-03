function AudioNavigator(opts) {
  var self = this;
  self.videoId = opts.videoId;
  $.AudioNavigator = this;
  var iframe = $("<iframe />")
		.attr("style", "position:fixed;bottom:1em;right:1em;")
    .attr("id", "player")
    .attr("width", "440px")
    .attr("height", "200px")
    .attr("webkitallowfullscreen", "")
    .attr("mozallowfullscreen", "")
    .attr("allowfullscreen", "")
    .attr("frameborder", "0")
    .attr("src", "https://player.vimeo.com/video/" + self.videoId + "?api=1")
    .appendTo("body")
    .vimeoLoad() //call this function after appending your iframe
    .vimeo("play");
  self.player = iframe;
  iframe.time = function(callback) {
    $.AudioNavigator.player.vimeo("getCurrentTime", function(data) {
      callback(data);
    })
  }

  function AudioTag(tag) {
    var self = this;
    self.element = tag;
    self.tag = tag.html().trim();
    self.toSeconds = function() {
      var justNumbers = self.tag.substring(self.tag.indexOf("Audio") + 5);
      var toReturn = 0;
      var timeParts = justNumbers.split(":");
      toReturn += parseInt(timeParts[0]) * 3600;
      toReturn += parseInt(timeParts[1]) * 60;
      toReturn += parseInt(timeParts[2]);
      return toReturn;
    }
  }

  var audioTags;
  self.currentTag = -1;
  var findAudioTag = function(callback) {
    var nextTag = self.tags[self.currentTag + 1];
    var previousTag = self.tags[self.currentTag - 1];
    self.player.time(function(currentTime) {
      if (nextTag && currentTime > self.tags[self.currentTag + 1].toSeconds()) {
        self.currentTag++;
        nextTag = self.tags[self.currentTag + 1];
        // look ahead
        if (nextTag && self.currentTag < self.tags.length &&
          currentTime > self.tags[self.currentTag + 1].toSeconds()) {
          findAudioTag(callback);
        } else {
          callback(true);
        }
      } else if (previousTag && self.currentTag > 0 &&
        currentTime < previousTag.toSeconds()) {
        self.currentTag--;
        previousTag = self.tags[self.currentTag - 1];
        if (self.currentTag > 0 &&
          currentTime < self.tags[self.currentTag - 1].toSeconds()) {
          findAudioTag(callback);
        } else {
          callback(true);
        }
      } else {
        callback(false);
      }
    });
  }
  $(function() {
    var filter = function(i, p) {
      if ($(p).children().length > 0) {
        return false;
      }
      return $(p).html().indexOf("Audio") > -1;
    }
    audioTags = $("p, span, li").filter(filter);
    self.tags = [];
    for (var i = 0; i < audioTags.length; i++) {
      var tag = audioTags[i];
      self.tags.push(new AudioTag($(tag)));
    }
    setInterval(function() {
      var previousAudioTag = self.currentTag;
      findAudioTag(function(didChange) {
        if (didChange) {
          $("html, body").animate({
            scrollTop: self.tags[self.currentTag].element.offset().top - 100
          }, 500);
          self.tags[self.currentTag].element.effect("highlight", {
            color: "#669966"
          }, 3000);
        }
			});
		}, 500);
  });
  $.AudioNavigator = this;
}

