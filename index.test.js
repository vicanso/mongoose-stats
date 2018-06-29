const mongoose = require('mongoose');

const stats = require('.');

const {Schema} = mongoose;

let StatsModel = null;
let statsSchema = null;
const collection = 'Stats';

beforeAll(() => {
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

test('add data', () => {
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
  return doc
    .save()
    .then(() => {
      const statsIns = new StatsModel({
        name: 'test',
      });
      return statsIns.save();
    })
    .then(() => {
      expect(done).toBeTruthy();
    });
});

test('count', () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('count');
    expect(data.size).toBe(2);
    expect(data.use).toBeGreaterThanOrEqual(0);
    done = true;
  });
  return StatsModel.count({}).then(() => {
    expect(done).toBeTruthy();
  });
});

test('update', () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.options.overwrite).toBeUndefined();
    expect(data.size).toBe(1);
    expect(data.update.name).toBe('new name');
    done = true;
  });
  return StatsModel.update(
    {
      name: 'test',
    },
    {
      name: 'new name',
    },
  ).then(() => {
    expect(done).toBeTruthy();
  });
});

test('update(upsert)', () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.options.overwrite).toBeUndefined();
    expect(data.size).toBe(0);
    expect(data.update.name).toBe('my-update-upsert');
    done = true;
  });
  return StatsModel.update(
    {
      name: 'my-update-upsert',
    },
    {
      name: 'my-update-upsert',
    },
    {
      upsert: true,
    },
  ).then(() => {
    expect(done).toBeTruthy();
  });
})

// updateMany: the same as update {multi: true}
test('updateMany', () => {
  let done = false;
  return new StatsModel({
    name: 'new name',
  })
    .save()
    .then(() => {
      const statsIns = new StatsModel({
        name: 'new name',
      });
      return statsIns.save();
    })
    .then(() => {
      statsSchema.once('stats', data => {
        expect(data.collection).toBe(collection);
        expect(data.op).toBe('update');
        expect(data.options.overwrite).toBeUndefined();
        expect(data.conditions.name).toBe('new name');
        expect(data.size).toBe(3);
        expect(data.update.name).toBe('vicanso');
        done = true;
      });
      return StatsModel.updateMany(
        {
          name: 'new name',
        },
        {
          name: 'vicanso',
        },
      );
    })
    .then(() => {
      expect(done).toBeTruthy();
    });
});

test('find', () => {
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
  return StatsModel.find({
    name: 'vicanso',
  })
    .select('name')
    .limit(10)
    .then(() => {
      expect(done).toBeTruthy();
    });
});

test('findOne', () => {
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
  return StatsModel.findOne({
    name: 'vicanso',
  })
    .sort('-createdAt')
    .select('name')
    .then(() => {
      expect(done).toBeTruthy();
    });
});

test('findOneAndRemove', () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('findOneAndRemove');
    expect(data.size).toBe(1);
    expect(data.conditions.name).toBe('vicanso');
    done = true;
  });
  return StatsModel.findOneAndRemove({
    name: 'vicanso',
  }).then(() => {
    expect(done).toBeTruthy();
  });
});

test('findOneAndUpdate', () => {
  let done = false;
  statsSchema.once('stats', data => {
    expect(data.collection).toBe(collection);
    expect(data.op).toBe('update');
    expect(data.size).toBe(1);
    expect(data.conditions.name).toBe('vicanso');
    expect(data.update.name).toBe('new name');
    done = true;
  });
  return StatsModel.findOneAndUpdate(
    {
      name: 'vicanso',
    },
    {
      name: 'new name',
    },
  ).then(() => {
    expect(done).toBeTruthy();
  });
});

test('replaceOne', () => {
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
  return StatsModel.replaceOne(
    {
      name: 'vicanso',
    },
    {
      name: 'tree.xie',
    },
  )
    .then(() =>
      StatsModel.findOne({
        name: 'tree.xie',
      }),
    )
    .then(doc => {
      expect(doc.createdAt).toBeUndefined();
      expect(done).toBeTruthy();
    });
});

test('updateOne', () => {
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
  return StatsModel.updateOne(
    {
      name: 'tree.xie',
    },
    {
      name: 'vicanso',
    },
  ).then(() => {
    expect(done).toBeTruthy();
  });
});

test('findById', () => {
  let done = false;
  return StatsModel.findOne({})
    .then(doc => {
      statsSchema.once('stats', data => {
        expect(data.collection).toBe(collection);
        expect(data.op).toBe('findOne');
        expect(data.size).toBe(1);
        done = true;
      });

      // eslint-disable-next-line
      return StatsModel.findById(doc._id);
    })
    .then(() => {
      expect(done).toBeTruthy();
    });
});
