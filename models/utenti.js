var mongoose = require('mongoose');

var utentiSchema = mongoose.Schema({

    nome: {
        type: String,
        required: true
    },
    cognome: {
        type: String,
        required: true
    },
    indirizzo: {
        type: String,
        required: true
    },
    stato: {
        type: String,
        required: true
    },
    provincia: {
        type: String,
        required: true
    },
    telefono: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    amministratore: {
        type: Boolean,
        default: false,
        required: true

    }
});

var utenti = module.exports = mongoose.model('Utenti', utentiSchema,'Utenti');
