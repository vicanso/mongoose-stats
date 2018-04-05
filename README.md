# mongoose-stats

mongoose stats plugin

## API

stats event

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
  console.info(data);
});

new Book({
  name: '测试',
}).save().then(() => {

}).catch(console.error);
```