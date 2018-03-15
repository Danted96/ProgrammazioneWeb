var mongoose = require('mongoose');

var ordiniSchema = mongoose.Schema({

    codice_utente:{
        type:mongoose.Schema.Types.ObjectId
    },
    ordine:{
        type:[mongoose.Schema.Types.Mixed],
        default:[]
    }
});

var ordini = module.exports = mongoose.model('Ordini', ordiniSchema,'Ordini');
