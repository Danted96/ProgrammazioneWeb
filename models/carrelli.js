
var mongoose = require('mongoose');

var carrelliSchema = mongoose.Schema({

    codice_utente:{
        type:mongoose.Schema.Types.ObjectId
    },
    carrello:{
        type:[mongoose.Schema.Types.Mixed],
        default:[]
    }
});

var carrelli = module.exports = mongoose.model('Carrelli', carrelliSchema,'Carrelli');
