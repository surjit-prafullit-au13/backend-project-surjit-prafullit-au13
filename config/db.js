const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://surjit:surjit@cluster0.0k5cr.mongodb.net/Project?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
