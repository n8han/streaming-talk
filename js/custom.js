/* custom behavior */

$(function() {
    var socket = new WebSocket("ws://stream.meetup.com/2/rsvps");

    var ticker = $('<div id="ticker"/>');
    $(document.body).append(ticker);
  
    socket.onmessage = function(event) {
        var rsvp = JSON.parse(event.data);
        var span = $(["<div><span>", rsvp.group.group_name, "</span></div>"].join(""));
        ticker.append(span);
        span.animate({ width: 'show' }, 2000);
    };
});