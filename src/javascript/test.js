$.fn.extend({
  makeColor: function(options) {
    var settings;
    settings = {
      option1: "red"
    };
    settings = $.extend(settings, options);
    return this.each(function() {
      return $(this).css({
        color: settings.color
      });
    });
  }
});
