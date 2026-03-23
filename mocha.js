const mongoose = require('mongoose');
mongoose.Promise =  global.Promise; 

before(() => {
    mongoose.connect('mongodb://192.168.100.100:27020');
    mongoose.connection
    .once('open', () => {})
    .on('error', (error) => {
        console.warn('Warning', error);
    });
});
//User.js
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    npm_pol: String,
    lati: Number,
    long: Number,
    mag: Number
});
const User = mongoose.model('user', UserSchema);
module.exports = User;


//Create Tests
const assert = require('assert');
describe('Reading Crime Records out of the database', () => {
    beforeEach((done) => {
        const lati = new User({ npm_pol: 'lati' });
        const long = new User({ npm_pol: 'long' });
        Promise.all([lati.save(), long.save()])
            .then(() => done());
    });

    it('finds the tuple with the name of city', (done) => {
        const city = 'lati'; // or set this to the city you want to test
        User.findOne({ npm_pol: city })
            .then((user) => {
                assert(user.npm_pol === city);
                done();
            });
    });
});

beforeEach((done) => {
    mongoose.connection.collections.users.drop(() => {
        done();
    });
})