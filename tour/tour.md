!SLIDE

![tower](/img/tower.jpg)

!SLIDE

    jobPublisher.publish(Message.fromCallableString(
      new Callable<String>() {
        public String call() throws Exception {
          return jsonize(rsvp, mem, chapter, event);
        }
      }
    ));

!SLIDE

    object Server {
      lazy val consumer: MessageQueue.MessageConsumer =
        queue.getAsyncConsumer(
          new MessageReceivedListener {
            def messageReceived(msg: MessageQueue.Message)={
              val charset = "utf-8";
              val body = msg.getPayload.
                  asInstanceOf[String].getBytes(charset)
              channels.foreach { _.write(body) }
              ...

!SLIDE
              ...
              val js = JsonParser.parse(new String(body, charset))
              for (JField("mtime", JInt(mtime)) <- js)
                buffer.synchronized { 
                  buffer = buffer.enqueue((mtime.toLong, body))
                  if (buffer.length > BUFFER_SIZE)
                    buffer = buffer.tail
                }

!SLIDE

    import scala.collection.immutable.Queue
    private var buffer = Queue.empty[(Long, Array[Byte])]

!SLIDE

    def main(args: Array[String]) {
      ...
      consumer // touch lazy value, try to connect
      unfiltered.netty.Http(port)
        .handler(plan.WebSockets.Rsvps)
        .handler(plan.Http)
        .beforeStop {
          shutdown()
        }
        .run()

!SLIDE

    object Http extends unfiltered.netty.channel.Plan {
      def intent = {
        case req @ GET(Path("/2/rsvps") & 
                   Params(params) & RemoteAddr(client_ip)) =>

!SLIDE

    val expected = for {
      since_id <- lookup("since_mtime") is 
        long { _ + " is not an integer" } is 
        optional
    } yield {


!SLIDE

    } yield {
      val initial = req.underlying.defaultResponse(
        Connection(HttpHeaders.Values.CLOSE) ~>
        TransferEncoding(HttpHeaders.Values.CHUNKED) ~> 
        JsonContent
      )

!SLIDE

      val ch = req.underlying.event.getChannel
      ch.write(initial).addListener { () =>
        Server.addRsvpClient(group, 
                             ch, 
                             ip_addr = client_ip, 
                             user_agent = user_agent)
        since_id.get.foreach { id => backfillRsvps(ch, id) }
      }

!SLIDE

    def backfillRsvps(ch: Channel, since_mtime: Long) {
      Server.bufferSince(since_mtime).foreach { 
        case (_, body) =>
          ch.write(new DefaultHttpChunk(
            ChannelBuffers.copiedBuffer(body))
          )
      }
    }

!SLIDE

    def bufferSince(atime: Long) = buffer.dropWhile { 
      case (mtime, _) => mtime <= atime 
    }

!SLIDE

    $(function() {
      var socket = new WebSocket(
        "ws://stream.meetup.com/2/rsvps");

      var ticker = $('<div id="ticker"/>');
      $(document.body).append(ticker);

      socket.onmessage = function(event) {
        var rsvp = JSON.parse(event.data);

!SLIDE

        if (rsvp.response != "yes")
          return;
        var span = $("<div><span>" 
          + rsvp.group.group_name 
          + "</span></div>");
        ticker.append(span);
        span.animate({ width: 'show' }, 1000);
      };
    });

!SLIDE

![after](/img/after.svg) ![meetup](/img/meetupapi.png)
