const mongoose = require('mongoose');

const stats = require('.');

const {Schema} = mongoose;

let StatsModel = null;
let statsSchema = null;
const collection = 'Stats';

beforeAll(async () => {
  const schema = new Schema(
    {
      name: String,
    },
    {
      timestamps: true,
    },
  );
  schema.plugin(stats, {
    collection,
  });

  StatsModel = mongoose.model('Stats', schema);
  statsSchema = schema;
  mongoose.connect('mongodb://localhost/mongoose-stats');
  return StatsModel.remove({});
});

afterAll(() => {
  mongoose.disconnect();
});

test('add data', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('save');
    expect(data.size).toBe(1);
    expect(data.use).toBeGreaterThanOrEqual(0);
    done = true;
  });
  const doc = new StatsModel({
    name: 'test',
  });
  await doc.save();
  await new StatsModel({
    name: 'test',
  }).save();
  expect(done).toBeTruthy();
});

test('count', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('count');
    expect(data.size).toBe(2);
    expect(data.use).toBeGreaterThanOrEqual(0);
    done = true;
  });
  await StatsModel.count({});
  expect(done).toBeTruthy();
});

test('update', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.options.overwrite).toBeUndefined();
    expect(data.size).toBe(1);
    expect(data.update.name).toBe('new name');
    done = true;
  });
  await StatsModel.update(
    {
      name: 'test',
    },
    {
      name: 'new name',
    },
  );
  expect(done).toBeTruthy();
});

// updateMany: the same as update {multi: true}
test('updateMany', async () => {
  let done = false;
  await new StatsModel({
    name: 'new name',
  }).save();
  await new StatsModel({
    name: 'new name',
  }).save();

  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.options.overwrite).toBeUndefined();
    expect(data.conditions.name).toBe('new name');
    expect(data.size).toBe(3);
    expect(data.update.name).toBe('vicanso');
    done = true;
  });
  await StatsModel.updateMany(
    {
      name: 'new name',
    },
    {
      name: 'vicanso',
    },
  );
  expect(done).toBeTruthy();
});

test('find', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('find');
    expect(data.size).toBe(3);
    expect(data.options.limit).toBe(10);
    expect(data.conditions.name).toBe('vicanso');
    expect(data.fields.name).toBe(1);
    done = true;
  });
  await StatsModel.find({
    name: 'vicanso',
  })
    .select('name')
    .limit(10);
  expect(done).toBeTruthy();
});

test('findOne', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('findOne');
    expect(data.size).toBe(1);
    expect(data.conditions.name).toBe('vicanso');
    expect(data.fields.name).toBe(1);
    expect(data.options.sort.createdAt).toBe(-1);
    done = true;
  });
  await StatsModel.findOne({
    name: 'vicanso',
  })
    .sort('-createdAt')
    .select('name');
  expect(done).toBeTruthy();
});

test('findOneAndRemove', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('findOneAndRemove');
    expect(data.size).toBe(1);
    expect(data.conditions.name).toBe('vicanso');
    done = true;
  });
  await StatsModel.findOneAndRemove({
    name: 'vicanso',
  });
  expect(done).toBeTruthy();
});

test('findOneAndUpdate', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.size).toBe(1);
    expect(data.conditions.name).toBe('vicanso');
    expect(data.update.name).toBe('new name');
    done = true;
  });
  await StatsModel.findOneAndUpdate(
    {
      name: 'vicanso',
    },
    {
      name: 'new name',
    },
  );
  expect(done).toBeTruthy();
});

test('replaceOne', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('replaceOne');
    expect(data.size).toBe(1);
    expect(data.options.overwrite).toBeTruthy();
    expect(data.conditions.name).toBe('vicanso');
    expect(data.update.name).toBe('tree.xie');
    done = true;
  });
  await StatsModel.replaceOne(
    {
      name: 'vicanso',
    },
    {
      name: 'tree.xie',
    },
  );
  const doc = await StatsModel.findOne({
    name: 'tree.xie',
  });
  expect(doc.createdAt).toBeUndefined();
  expect(done).toBeTruthy();
});

test('updateOne', async () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.size).toBe(1);
    expect(data.options.overwrite).toBeUndefined();
    expect(data.conditions.name).toBe('tree.xie');
    expect(data.update.name).toBe('vicanso');
    done = true;
  });
  await StatsModel.updateOne(
    {
      name: 'tree.xie',
    },
    {
      name: 'vicanso',
    },
  );
  expect(done).toBeTruthy();
});

test('findById', async () => {
  let done = false;
  const doc = await StatsModel.findOne({});
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('findOne');
    expect(data.size).toBe(1);
    done = true;
  });
  // eslint-disable-next-line
  await StatsModel.findById(doc._id);
  expect(done).toBeTruthy();
});
