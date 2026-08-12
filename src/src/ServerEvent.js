/** Implements a mechanism to react to events from the server.
 * 
 * - This is the client side of a simple client/[server](./ServerEventService.html) mechanism.
 *
 * - The interface is used in HTML page, using a construct of the form:
 *```
 * <script type='text/javascript' src='.../aideweb.js'></script>
 * <script type='text/javascript'>
 *  var serverEvent = New ServerEvent("http://localhost:8080/_event_name"); 
 *
 *  serverEvent.onEvent(function(value) {
 *    console.log("Got this event value: '" + value + "'");
 *  });
 *```
 * @param {string} url The service URL.
 * @class
 */
const ServerEvent = function(url) {
  let self = this;
  var httpQuery = new HttpQuery(url);
  /** Registers and attachs a callback to recieve and process the server events.
   * @param {callback} callback The callback that handles the events when emitted.
   * - Runs the <tt>callback(value: string)</tt> function with the event string value, when the event is recieved.
   * @param {unit} timeout The maximal waiting time in millisecond, 0 means no timeout.
   * - On timeout the event receptions stops.
   * @param {unit} maxcount The maximal number of event to be recieved, 0 means no bound.
   * - On event bound count the event receptions stops.
   */
  this.onEvent = function(callback = function() {}, timeout = 0, maxcount = 0) {
    self.callback = callback;
    self.timeout = timeout;
    self.maxcount = maxcount;
    self.count = 0;
    call();
  }
  const call = function() {
    self.pending = true;
    httpQuery.send("action=call", function(value) {
      self.pending = false;
      self.callback(value);
      self.count++;
      if (value != "{ \"timeout\": true }" && self.count < self.maxcount)
        call();
    }, self.timeout);
  };
  /** Returns true if an event is pending. */
  this.isPending = function() {
    return self.pending;
  }
  /** Stops the process and purges the event queue. 
   * - A pending event will still treated.
   */
  this.clear = function() {
    httpQuery.send("action=clear");
    self.maxcount = 0;
  };
  /** Generates a periodic event (mainly for debugging purpose).
   * - The event value writes `$index`, the occurence index, starting from 0.
   * @param {uint} period The clock period in millisecond, 0 to stop the clock.
   * @param {uint} count The maximal number of event, 0 if no bound.
   */
  this.addClock = function(period = 0, count = 0) {
    httpQuery.send("action=clock&period=" + period + "&count=" + count);
  };
};
