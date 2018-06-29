function isEmpty(data) {
  if (data && Object.keys(data).length !== 0) {
    return false;
  }
  return true;
}

module.exports = function stats(schema, options) {
  const collection = (options && options.collection) || 'unknown';
  function addStartedAt(next) {
    // eslint-disable-next-line
    if (!this.__startedAt) {
      // eslint-disable-next-line
      this.__startedAt = Date.now();
    }
    next();
  }

  function addQueryStats(data) {
    // eslint-disable-next-line
    const use = Date.now() - this.__startedAt;
    // 该操作修改(查询)的数量
    let size = data ? 1 : 0;
    const {op} = this;
    switch (op) {
      case 'count':
        size = data;
        break;
      case 'update':
        // 有可能做的是findAndUpdte，如果无数据时insert，则返回的data为空
        if (data && data.result) {
          size = data.result.nModified;
        }
        break;
      default:
        if (Array.isArray(data)) {
          size = data.length;
        }
        break;
    }
    const result = {
      op,
      collection,
      use,
      size,
    };
    if (!isEmpty(this.options)) {
      result.options = this.options;
    }
    ['_conditions', '_fields', '_update'].forEach(key => {
      const value = this[key];
      if (!isEmpty(value)) {
        result[key.substring(1)] = value;
      }
    });
    schema.emit('stats', result, this);
  }

  const fns = [
    'count',
    'update',
    'find',
    'findOne',
    'findOneAndRemove',
    'findOneAndUpdate',
    'replaceOne',
    'updateMany',
    'updateOne',
  ];
  fns.forEach(fn => {
    schema.pre(fn, addStartedAt);
    schema.post(fn, addQueryStats);
  });

  schema.pre('save', addStartedAt);
  schema.post('save', function postSave() {
    // eslint-disable-next-line
    const use = Date.now() - this.__startedAt;
    const result = {
      collection,
      op: 'save',
      use,
      size: 1,
    };
    schema.emit('stats', result, this);
  });
};
