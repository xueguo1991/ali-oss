
import Base from 'sdk-base';
import ready from 'get-ready';
import copy from 'copy-to';

const currentIP = require('address').ip();

const RR = 'roundRobin';
const MS = 'masterSlave';


class Cluster extends Base {
  public clients;
  public availables;
  public schedule;
  public masterOnly;
  public index;
  public _checkAvailableLock;
  public _timerId;
  public _ignoreStatusFile;
  public constructor(OssClient, options: any = {}) {
    super()
    if (!options || !Array.isArray(options.cluster)) {
      throw new Error('require options.cluster to be an array');
    }


    this.clients = [];
    this.availables = {};

    for (let i = 0; i < options.cluster.length; i++) {
      const opt = options.cluster[i];
      copy(options).pick('timeout', 'agent', 'urllib').to(opt);
      this.clients.push(new OssClient(opt));
      this.availables[i] = true;
    }

    this.schedule = options.schedule || RR;
    // only read from master, default is false
    this.masterOnly = !!options.masterOnly;
    this.index = 0;

    const heartbeatInterval = options.heartbeatInterval || 10000;
    this._checkAvailableLock = false;
    this._timerId = this._deferInterval(this._checkAvailable.bind(this, true), heartbeatInterval);
    this._ignoreStatusFile = options.ignoreStatusFile || false;
    this._init();
  }

  signatureUrl(/* name */...args) {
    const client = this.chooseAvailable();
    return client.signatureUrl(...args);
  };

  getObjectUrl(/* name, baseUrl */...args) {
    const client = this.chooseAvailable();
    return client.getObjectUrl(...args);
  };

  _init() {
    const initFn = async () => {
      await this._checkAvailable(this._ignoreStatusFile);
      this.ready(true);
    }
    initFn().catch((err) => {
      this.emit('error', err);
    });
  };

  ready(...args) {
    return super.ready(...args)
  }

  emit(...args) {
    return super.emit(...args)
  }

  async _checkAvailable(ignoreStatusFile) {
    const name = `._ali-oss/check.status.${currentIP}.txt`;
    if (!ignoreStatusFile) {
      // only start will try to write the file
      await (this as any).put(name, Buffer.from(`check available started at ${Date()}`));
    }

    if (this._checkAvailableLock) {
      return;
    }
    this._checkAvailableLock = true;
    const downStatusFiles: any = [];
    for (let i = 0; i < this.clients.length; i++) {
      const client = this.clients[i];
      // check 3 times
      let available = await this._checkStatus(client, name);
      if (!available) {
        // check again
        available = await this._checkStatus(client, name);
      }
      if (!available) {
        // check again
        /* eslint no-await-in-loop: [0] */
        available = await this._checkStatus(client, name);
        if (!available) {
          downStatusFiles.push(client._objectUrl(name));
        }
      }
      this.availables[i] = available;
    }
    this._checkAvailableLock = false;

    if (downStatusFiles.length > 0) {
      const err = new Error(`${downStatusFiles.length} data node down, please check status file: ${downStatusFiles.join(', ')}`);
      err.name = 'CheckAvailableError';
      (this as any).emit('error', err);
    }
  };

  async _checkStatus(client, name) {
    let available = true;
    try {
      await client.head(name);
    } catch (err) {
      // 404 will be available too
      if (!err.status || err.status >= 500 || err.status < 200) {
        available = false;
      }
    }
    return available;
  };

  chooseAvailable() {
    if (this.schedule === MS) {
      // only read from master
      if (this.masterOnly) {
        return this.clients[0];
      }
      for (let i = 0; i < this.clients.length; i++) {
        if (this.availables[i]) {
          return this.clients[i];
        }
      }
      // all down, try to use this first one
      return this.clients[0];
    }

    // RR
    let n = this.clients.length;
    while (n > 0) {
      const i = this._nextRRIndex();
      if (this.availables[i]) {
        return this.clients[i];
      }
      n--;
    }
    // all down, try to use this first one
    return this.clients[0];
  };

  _nextRRIndex() {
    const index = this.index++;
    if (this.index >= this.clients.length) {
      this.index = 0;
    }
    return index;
  };

  _error(err) {
    if (err) throw err;
  };

  _createCallback(ctx, gen, cb) {
    return () => {
      cb = cb || this._error;
      gen.call(ctx).then(() => {
        cb();
      }, cb);
    };
  };

  _deferInterval(gen, timeout, cb?) {
    return setInterval(this._createCallback(this, gen, cb), timeout);
  };

  close() {
    clearInterval(this._timerId);
    this._timerId = null;
  };
}


function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // 拷贝实例属性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // 拷贝静态属性
    copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      const desc = Object.getOwnPropertyDescriptor(source, key) || '';
      Object.defineProperty(target, key, desc);
    }
  }
}