const EventEmitter = require('events');

export class AbortController {
	constructor() {
    const emitter = this.emitter = new EventEmitter();
    this.signal = {
      addEventListener: emitter.addListener.bind(emitter),
      removeEventListener: emitter.removeListener.bind(emitter),
      on: emitter.addListener.bind(emitter),
      off: emitter.removeListener.bind(emitter),
    };
  }
  abort(e) {
    this.emitter.emit('abort', e);
  }
}


export default function makeAbortable(promise, controller = new AbortController()) {
  const abortablePromise = new Promise((ok, fail) => {
    let hasCompleted = false;
    const cancelHandling = () => {
      if (hasCompleted) return true;
      hasCompleted = true;
      controller.signal.off('abort', handleAbort);
      return false;
    };
    function handleAbort(e) {
      if (cancelHandling()) {
        return;
      }
      const err = new Error('Aborted');
      err.abortEvent = e;
      fail(err);
    }

    controller.signal.on('abort', handleAbort);

    promise.then((result) => {
      if (cancelHandling()) return;
      ok(result);
    }, (err) => {
      if (cancelHandling()) return;
      fail(err);
    });
  });
  abortablePromise.controller = controller;
  return abortablePromise;
}
