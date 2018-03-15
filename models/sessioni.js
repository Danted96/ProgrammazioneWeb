var mongoose = require('mongoose');

var sessioniSchema = mongoose.Schema({

    codice: {
        type: mongoose.Schema.Types.ObjectId
    },
    stato: {
        type: Boolean
    }
});

var sessioni = module.exports = mongoose.model('Sessioni', sessioniSchema,'Sessione');
