# mongoose-stats

mongoose stats plugin

[![Build Status](https://travis-ci.org/vicanso/mongoose-stats.svg?branch=master)](https://travis-ci.org/vicanso/mongoose-stats)
[![npm](http://img.shields.io/npm/v/mongoose-stats.svg?style=flat-square)](https://www.npmjs.org/package/mongoose-stats)

## API

stats event data

- `collection` the mongodb collection
- `op` the op function
- `use` the time consuming of function
- `size` the record count of function

```js
const mongoose = require('mongoose');
const mongooseStats = require('mongoose-stats');

const {Schema} = mongoose;
const schema = new Schema({
  name: String,
}, {
  timestamps: true,
});
const Book = mongoose.model('Book', schema);
schema.plugin(mongooseStats, {
  collection: 'Book',
});
schema.on('stats', (data) => {
  // { collection: 'Book', op: 'save', use: 36, size: 1 }
  console.info(data);
});

new Book({
  name: '测试',
}).save().then(() => {

}).catch(console.error);
```