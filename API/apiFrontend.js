var config = require('../config');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var ObjectID = require("mongodb").ObjectID;


var cookieParser = require('cookie-parser');
//app.use(cookieParser());

//richiamo mongoose e i vari modelli che andrò ad utilizzare
var mongoose = require('mongoose');
var Prodotti = require('../models/prodotti');
var Utenti = require('../models/utenti');
var Ordini = require('../models/ordini');
var Carrelli = require('../models/carrelli');

var db;
exports.setDb = function(extdb) {
    db = extdb;
};



exports.home = function (req, res) {
    logging(req, function (dati) {

        Prodotti.find(function (search_result) {
            res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati.prodotti, auth: dati.logged });
        });
    });
};

//login dell'utente POST
exports.login_utente = function (req, res) {
    var query = { email: req.body.login_email, password: req.body.login_password };
    console.log(query);
    console.log(req.body);
    var uid;
    Utenti.find(query).then(function (data) {
        console.log('utente :' + data);

        if (data.length == 0) {
            res.redirect('/');
        } else {
            uid = data[0]._id;
            console.log('nome utente ' + data[0].nome)

            query = { codice: uid };

            // creazione del token
            var token = jwt.sign({ uid, admin: false }, config.secret);
            res.cookie('jwt', token);

            res.redirect('/');

        }
    });

};
//logout utente GET
exports.logout = function (req, res) {
    console.log(req.cookies.jwt)

    res.clearCookie('jwt');
    console.log(req.cookies.jwt)
    res.redirect('/');
};

//registrazione utente GET
exports.registrazione_utente = function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == true)
            res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged });
        else
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: null, auth: dati.logged });
    });

};
//registrazione utente POST
exports.registrazione_utentePost = function (req, res) {
    if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
        logging(req, function (dati) {
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
        });
    } else {
        console.log(req.body);
        console.log('------------------------------------');
        console.log('1 step');
        console.log('------------------------------------');
        Utenti.create({ nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password, amministratore: false }).then(function (result) {
            console.log('------------------------------------' + result._id);
            console.log('2 step');
            //console.log('------------------------------------' + result[0]._id);
            var query = { _id: result._id };
            console.log('------------------------------------');
            console.log('3 step');
            console.log('------------------------------------');
            Carrelli.create({ _id: result._id }).then(function (cartRes) {
                var uid;
                Ordini.create({ _id: result._id }).then(function (ordine) {
                    Utenti.find(query).then(function (data) {
                        if (data.length == 0) { // utente gia esistente, quindi effettua il login
                            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
                        } else {
                            uid = data[0]._id;
                            query = { codice: uid };

                            //creazione del token

                            var token = jwt.sign({ uid, admin: false }, config.secret);
                            res.cookie('jwt', token);

                            res.redirect('/');
                        }
                    });
                });
            });
        });

    }
};

//mostra il profilo dell'utente una volta loggato GET
exports.profilo = function (req, res) {

    logging(req, function (dati) {
        if (dati.logged == false)
            res.redirect('/');
        else {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function (found) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged, dati_utente: found[0] });
            });
        }
    });
};

//mostra lo storico ordini GET
exports.storicoordini = function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Ordini.find({ codice_utente: dati.userID }).then(function (ordine) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'storicoordini', ordini: (ordine[0].ordine), auth: dati.logged });

            });
        }
    });
};

//modifica i dati relativi al proprio profilo POST
exports.modificaprofilo = function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
                res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
            } else {
                console.log('id : ' + dati.userID);
                Utenti.update({ _id: ObjectID(dati.userID) }, { nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password }, function (data) {
                    console.log('profilo modificato');
                    res.redirect('/profilo');

                });
            }
        }
    });
};

//mostra il prodotto richiesto GET
exports.mostra_prodotto = function (req, res) {

    var codice_prodotto = req.query.pro;
    console.log('codice del prodotto' + req.query.pro);


    /*esegue la funzione logging per vedere se è loggato o no,
     in quanto se è loggato cambiano alcune cose nella visione del prodotto */

    logging(req, function (dati) {
        Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function (dati_prodotto) {
            res.render('index', {
                title: 'prodotto',
                contenuto: 'prodotto',
                dati_prodotto: dati_prodotto[0],
                auth: dati.logged

            });
        });
    });
}

//regex per la ricerca del nome dei prodotti
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
//funzione per la ricerca del prodotto GET
exports.ricerca_prodotto = function (req, res) {
    logging(req, function (dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            Prodotti.find({ nome: regex }).then(function (dati_ricerca) {
                console.log('prodotti ricercati: ' + dati_ricerca[0]);
                res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati_ricerca, auth: dati.logged });


            });
        }

    });
}


//mostra i prodotti in base alla categoria GET
exports.categoria = function (req, res) {
    var categoria_prodotto = req.query.cat;
    console.log('categoria del prodotto ' + req.query.cat);
    logging(req, function (dati) {
        Prodotti.find({ categoria: req.query.cat }).then(function (dati_prodotto) {
            console.log('dati prodotto categoria' + dati_prodotto);
            res.render('index', {
                title: 'prodotto',
                contenuto: 'prodotti',
                prodotti: dati_prodotto,
                auth: dati.logged
            });
        });
    });
}

//aggiorna l'array contente le email da avvertire in caso il prodotto esaurito ritornasse disponibile POST
exports.avverti_utente = function (req, res) {
    var codice_prodotto = req.body.codice;
    logging(req, function (dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function (search_result) {
                var prodotto = search_result[0];
                var avvertendi = (prodotto.avverti_user == '') ? [] : JSON.parse(prodotto.avverti_user);
                Utenti.find({ _id: ObjectID(dati.userID) }).then(function (utente) {
                    avvertendi.push(utente[0].email);

                    Prodotti.update({ _id: ObjectID(codice_prodotto) }, { avverti_user: JSON.stringify(avvertendi) }, function (result) {
                        res.send('OK');
                    });
                });
            });
        }
    });
}

//mostra il carrello GET
exports.carrello = function (req, res) {

    logging(req, function (dati) {
        if (dati.logged == true) {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function (utente) {
                var codice_utente = utente[0]._id;
                Carrelli.find({ codice_utente: codice_utente }).then(function (carrello_utente) {
                    carrello = JSON.parse(carrello_utente[0].carrello);
                    console.log('carrello ---------- ' + JSON.parse(carrello_utente[0].carrello));
                    res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                });
            });
        } else {

            res.redirect('/');

        }
    });
}

//aggiunge il prodotto selezionato al carrello GET
exports.carrello_aggiungi = function (req, res) {
    var aggiungi = req.query.add;
    console.log('aggiungi : ' + req.query.add);
    logging(req, function (dati) {
        if (dati.logged == true) {
            Carrelli.find({ codice_utente: dati.userID }).then(function (carrello_utente) {
                carrello = JSON.parse(carrello_utente[0].carrello);

                if (aggiungi == undefined) {
                    res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                } else {
                    Prodotti.find({ _id: ObjectID(aggiungi) }).then(function (oggetto) {
                        oggetto[0].quantita = 1;
                        carrello.push(JSON.stringify(oggetto[0]));
                        console.log('carrello +++++++++++ : ' + (oggetto[0]));
                        Carrelli.update({ codice_utente: dati.userID }, { carrello: JSON.stringify(carrello) }, function (result) {
                            res.redirect('/');
                        });
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    });
}

//rimuove il prodotto dal carrello POST
exports.carrello_rimuovi = function (req, res) {

    console.log('indice : ' + req.body.index);
    logging(req, function (dati) {
        if (dati.logged == true) {
            Carrelli.find({ codice_utente: dati.userID }).then(function (carrello_utente) {
                carrello = JSON.parse(carrello_utente[0].carrello);
                carrello.splice(req.body.index, 1);
                Utenti.find({ _id: ObjectID(dati.userID) }).then(function (utente) {
                    var codice_utente = utente[0]._id;
                    Carrelli.update({ codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function (result) {
                        res.send('ok');
                    });
                });
            });
        } else {
            res.send('ok');
        }
    });
}

//aggiorna la quantità del prodotto nel carrello POST
exports.carrello_aggiorna = function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == true) {
            Carrelli.find({ codice_utente: dati.userID }).then(function (carrello_utente) {
                carrello = JSON.parse(carrello_utente[0].carrello);
                console.log('carrello  3: ' + carrello);
                for (var i = 0; i < carrello.length; i++) {
                    if (i == req.body.index) {
                        console.log('index : ' + i);
                        var edit = JSON.parse(carrello[i]);
                        console.log('carrello : ' + JSON.stringify(edit));
                        edit.quantita = req.body.quantity;
                        carrello[i] = JSON.stringify(edit);
                        console.log('carrello : ' + carrello[i]);
                    }
                }
                Carrelli.update({ codice_utente: dati.userID }, { carrello: JSON.stringify(carrello) }, function (result) {
                    res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                });
            });
        } else {
            res.redirect('/carrello');
        }
    });
}

//acquista i prodotti dal carrello GET
exports.carrello_acquista =function(req,res){


var prodottinelcarrello = [];

logging(req, function (dati) {
    if (dati.logged == false) {
        res.redirect('/');
    } else {
        Carrelli.find({ codice_utente: dati.userID }).then(function (carrello_utente) {
            carrello = JSON.parse(carrello_utente[0].carrello);

            for (var i = 0; i < carrello.length; i++) {
                var singoloProdotto = JSON.parse(carrello[i]);
                prodottinelcarrello[i] = singoloProdotto
                console.log('------------------------------------');
                console.log(prodottinelcarrello[i]._id);
                console.log('------------------------------------');
            }
            console.log('------------------------------------');
            console.log(prodottinelcarrello.length);
            console.log('------------------------------------');
            var quantity;
            // res.redirect('/carrello');
            prodottinelcarrello.forEach(function (singoloProdotto) {
                var ordini = [];
                console.log('------------------------------------');
                console.log(singoloProdotto._id);
                console.log('------------------------------------');
                Prodotti.find({ _id: ObjectID(singoloProdotto._id) }).then(function (prodotto) {
                    quantity = prodotto[0].quantita - singoloProdotto.quantita;
                    Prodotti.update({ _id: ObjectID(singoloProdotto._id) }, { quantita: (quantity) }, function (QT) {
                        console.log('------------------------------------');
                        console.log('okkkk');
                        console.log('------------------------------------');

                        if (Number(quantity) <= 5) {
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'Noreplay.ProgettoPW@gmail.com',
                                    pass: 'Noreplayprogrammazioneweb'
                                }
                            });

                            var mailOptions = {
                                from: 'Noreplay.ProgettoPW@gmail.com',
                                to: ['william.taruschio@studenti.unicam.it', 'dante.domizi@studenti.unicam.it'],
                                subject: 'Prodotto in esaurimento',
                                text: 'Prodotto "' + singoloProdotto.nome + '" (cod. ' + singoloProdotto._id + ') in esaurimento' + 'rimangono solo ' + quantity + ' disponibili.'
                            }

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                        }
                        var data = new Date();
                        ordini.push({

                            "data": data.toUTCString(),
                            "nome": singoloProdotto.nome,
                            "quantita": Number(singoloProdotto.quantita),
                            "prezzo": parseFloat(singoloProdotto.prezzo),

                        });

                        console.log('------------------------------------');
                        console.log('ordini  ' + JSON.stringify(ordini));
                        console.log('------------------------------------');
                        Ordini.findOneAndUpdate({ codice_utente: ObjectID(dati.userID) }, { $push: { ordine: ordini } }, function (err, nuovoOrdine) {
                            if (err) {
                                console.log('------------------------------------');
                                console.log('errore' + err);
                                console.log('------------------------------------');
                            }
                            console.log('------------------------------------');
                            console.log('ordine aggiunto  ' + JSON.stringify(ordini));
                            console.log('------------------------------------');
                            console.log('------------------------------------');
                            console.log('nuovoOrdine     ' + JSON.stringify(nuovoOrdine.ordine));
                            console.log('------------------------------------');
                        });

                    });
                })
            }

            )


            carrello = carrello.splice(carrello.length, 0);

            console.log('carrello dopo : ' + carrello);
            Carrelli.update({ codice_utente: dati.userID }, { carrello: JSON.stringify(carrello) }, function (result) {
                res.redirect('/carrello');
            });




        });
    }
});
}
//mostra la pagina per reimpostare la password GET
exports.password_dimenticata = function (req, res) {
    logging(req, function (dati) {
        res.render('index', { title: 'home', contenuto: 'passwordDimenticata', auth: dati.logged })

    });
}

//reimposta la password POST
exports.nuova_password=function(req,res){
    console.log('corpo : ' + req.body.password1);
    var email = req.body.emailnuovapassword;
    var password = req.body.password1;
    var confermapassword = req.body.password2;
    if (email == '' || password == '' || confermapassword == '') {
        logging(req, function(dati) {
            res.redirect('/');
        });
    } else if (password == confermapassword) {
        Utenti.update({ email: email }, { password: password }, function(result) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'Noreplay.ProgettoPW@gmail.com',
                    pass: 'Noreplayprogrammazioneweb'
                }
            });

            var mailOptions = {
                from: 'Noreplay.ProgettoPW@gmail.com',
                to: email,
                subject: 'Nuova password',
                text: 'La tua nuova password è ' + password
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.redirect('/');
        });

    } else {
        res.redirect('/passwordDimenticata');
    }
}
//verifica se l'utente è loggato
function logging(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    Prodotti.find({}, function(err, dati_collezione) {
        if (err) {
            res.send(err)
        }
        out.prodotti = dati_collezione;

        if (req.cookies.jwt == undefined || req.cookies.jwt == null) {
            console.log('Token non presente');
            out.logged = false;
            callback(out);

        } else {

            jwt.verify(req.cookies.jwt, config.secret, function(err, decoded) {
                if (err) {
                    console.log('Token non valido');
                    out.logged = false;
                } else {
                    console.log('Token valido');
                    out.logged = true;
                    out.userID = decoded.uid;
                }
            });
            callback(out);
        }




    });
};