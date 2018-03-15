var mongoose = require('mongoose');

var sessionibackendSchema = mongoose.Schema({

    codice: {
        type: mongoose.Schema.Types.ObjectId
    },
    stato: {
        type: Boolean
    }
});

var sessionibackend = module.exports = mongoose.model('SessioniBackend', sessionibackendSchema,'Backend_sessione');
