var mongoose = require('mongoose');

var prodottiSchema = mongoose.Schema({

    nome: {
        type: String,
        required: true
    },
   descrizione: {
        type: String,
        
    },
    quantita: {
        type: Number,
        required: true,
        min:0
    },
    prezzo: {
        type: Number,
        required: true,
        min:0
    },
    categoria:{
        type:String,
        required:true
    },
    avverti_user:{
        type:[String]
    }
});

var prodotti = module.exports = mongoose.model('Prodotti', prodottiSchema,'Prodotti');
