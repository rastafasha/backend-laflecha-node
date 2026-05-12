//testing
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://localhost:27017/daniel-project');
const conn = mongoose.connection;
//testing
//testing
var personSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var storySchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Person' },
    title: String,
    fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

var Story = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);

var author = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: 'Ian Fleming',
    age: 50
});

var story1 = new Story({
    title: 'Casino Royale',
    author: author._id
});

author.save(function(err) {
    if (err) {
        console.log('error saving author');
        return;
    }

    story1.save(function(err) {
        if (err) {
            console.log('error saving story');
            return;
        }

        Story.findOne({ title: 'Casino Royale' })
            .populate('author').exec((err, doc) => {
                if (err) { return console.error(err); }
                console.log(doc);
                return conn.close();
            })
    });
});

//testing

module.exports = testing;