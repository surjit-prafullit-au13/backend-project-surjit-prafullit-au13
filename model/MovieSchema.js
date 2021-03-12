const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    year: Number,
    genre: String,
    numVotes: Number
})

const Movie = new mongoose.model('Movie', movieSchema)
module.exports = Movie