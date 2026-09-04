// The linked-list node implementation contains a value and a reference to the next node. 
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
};
 /** Implements a First In, First out (FIFO) queue.
 * - It is implemented using a linked-list, each element (node).
 * - It follows the FIFO principle, enqueue operations adding to the rear and dequeue operations removing from the front.
 * - All operations, but the array conversion, is in O(1), without transient overload.
 * - The variable size management stands on the JavaScriot memory management.
 */
Queue = {
  /** Gets the current queue size. */
  getSize: function() {
    return this.size;
  },
  /** Sets the maximal queue size.
   * @param {unit} [size=0] The maximal size above which an "overflow" error is thrown, unbounded if equal to 0.
   */
  setMaximalSize(size = 0) {
    this.max_size = size;
  },
  /** Adds (enqueues) a data to the queue rear.
   * @param data The data to add.
   * @return This Queue.
   */
  push: function(data) {
    const n = new Node(data);
    if (this.size == 0) {
      this.front = n;
      this.rear = n;
    } else {
      this.rear.next = n;
      this.rear = n;
    }
    if (this.max_size > 0 && this.size == this.max_size)
      throw new Error("Queue overflow, size > " + this.max_size);
    else 
      this.size++;
    setTimeout(this.handle());
    return this;
  },
  /** Peeks the data at the front, without removing it.
   * @return The data at the front.
   */
  front: function() {
    return this.front == null ? null : this.front.data;
  },
  /** Peeks (dequeues) the data at the front, thus removing it.
   * @return The data at the front.
   */
  pop: function() {
    const n = this.front;
    if (this.front == null) {
      return null;
    } else {
      d = this.front.data;
      this.front = this.front.next;
      if (this.front == null)
        this.rear = null;
      this.size--;
      return d;
    }
  },
  /** Defines a handler treating queue input.
   * - The handler handles the front data and return when done.
   * - The front data is removed at the end of its handling.
   * - Hndling is done in parrallel to all queue operations, thus never blocked.
   * @param {callback} handler A `handler(data)` called for each queued data.
   * - With the `null` value it stops handling the queue data.
   */
  def: function(handler) {
    this.handler = handler;
  },
  /** Checks if the handler is active.
   * @return {bool} True if the front data is currently handled by the handler, else false.
   */
  isHandling : function() {
    return this.ing;
  },
  handler = null;
  handle: function() {
    if (this.handler != null && this.size > 0) {
      this.handler(this.front);
      this.pop();
      setTimeout(this.handle);
    }
  }
  /** Returns the present queue as an array.
   * @return An array with the front data first and the rear data at last.
   */
  toArray: function() {
    let datas = [];
    for(let current = this.front; current != null; current = this.next)
      datas.push(current.data);
    return datas;
  },
  // Internal references, do not use.
  front: null, rear: null, size: 0, max_size = 0;
};

module.exports = Queue;
