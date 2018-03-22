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


var db;
exports.setDb = function (extdb) {
    db = extdb;
};

//home per l'amministratore GET
exports.amministrazione = function (req, res) {
    logging(req, function (dati) {

        if (dati.logged == true) {
            res.render('backend/index', { title: 'amministrazione', contenuto: 'gestioneprodotti', prodotti: dati.prodotti, auth: dati.logged });
        } else {
            res.redirect('/');
        }

    });
}

//login amministratore POST
exports.login_amministratore = function (req, res) {

    logging(req, function (dati) {
        var query = { email: req.body.login_email, password: req.body.login_password, amministratore: true };
        console.log('query : ' + query);
        console.log(req.body);
        var uid;
        Utenti.find(query).then(function (data) {
            console.log(data);
            if (data.length == 0) {
                res.redirect('/');
            } else {
                uid = data[0]._id;
                console.log('nome utente ' + data[0].nome)
                var uname = data[0].name;
                query = { codice: uid };
                var token = jwt.sign({ uid, admin: true }, config.secret);
                res.cookie('jwt', token);
                res.redirect('/amministrazione');
            }
        });
    });
};

//logout amministratore GET
exports.logout_amministratore = function (req, res) {

    res.clearCookie('jwt');
    res.redirect('/amministrazione');
}
//funzione ricerca GET
exports.cerca_amministrazione = function (req, res) {
    logging(req, function (dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            Prodotti.find({ nome: regex }).then(function (dati_ricerca) {
                console.log('prodotti ricercati: ' + dati_ricerca[0]);
                res.render('backend/index', { title: 'amministrazione', contenuto: 'gestioneprodotti', prodotti: dati_ricerca, auth: dati.logged });


            });
        }

    });
}
//apre la pagina per inserire un nuovo prodotto GET
exports.nuovoProdotto = function (req, res) {

    var codice_prodotto = req.query.pro;
    console.log('codice del prodotto' + req.query.pro);
    var _id = (codice_prodotto);
    console.log('id  ' + _id);
    logging(req, function (dati) {
        if (dati.logged == true) {
            Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function (dati_prodotto) {
                res.render('backend/index', {
                    title: 'prodotto',
                    contenuto: 'aggiungiprodotto',
                    dati_prodotto: dati_prodotto[0],
                    auth: dati.logged,
                    errore: null
                });
            });
        } else {
            res.redirect('/amministrazione');
        }
    });
}
//aggiunge un nuovo prodotto tra quelli disponibili POST
exports.aggiungi_prodotto = function (req, res) {
    logging(req, function (dati) {
        var prodotto = { nome: req.body.nome, descrizione: req.body.descrizione, quantita: req.body.quantita, prezzo: req.body.prezzo, categoria: req.body.categoria };
        if (prodotto.nome == '' || prodotto.quantita == '' || prodotto.prezzo == '' || prodotto.categoria == '' || prodotto.descrizione == '') {
            res.render('backend/aggiungiprodotto', { errore: 'dati non corretti o incompleti', auth: dati.logged });
        }
        if (prodotto.quantita < 0 || prodotto.prezzo < 0) {
            res.render('backend/aggiungiprodotto', { errore: 'dati non corretti o incompleti', auth: dati.logged });
        }
        if (prodotto.nome != undefined || prodotto.quantita != undefined || prodotto.prezzo != undefined || prodotto.descrizione != undefined || prodotto.categoria != undefined) {
            res.render('backend/aggiungiprodotto', { errore: 'dati non corretti o incompleti', auth: dati.logged });
        }
        if (dati.logged == true) {

            if (Number(prodotto.quantita) <= 5) {
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'Noreplay.ProgettoPW@gmail.com',
                        pass: 'Noreplayprogrammazioneweb'
                    }
                });

                var mailOptions = {
                    from: 'Noreplay.ProgettoPW@gmail.com',
                    to: 'dante.domizi@studenti.unicam.it , william.taruschio@studenti.unicam.it',
                    subject: 'immessa quantita scarsa',
                    text: 'Prodotto "' + prodotto.nome + '" (cod. ' + prodotto._id + ')  , immesso solo ' + prodotto.quantita + ' pezzi.'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            //creo il nuovo prodotto in base allo schema Prodotti
            var nuovoProdotto = new Prodotti({
                nome: prodotto.nome,
                descrizione: prodotto.descrizione,
                quantita: Number(prodotto.quantita),
                prezzo: parseFloat(prodotto.prezzo),
                categoria: prodotto.categoria,
                avverti_user: []

            })
            console.log('nuovo prodotto ' + nuovoProdotto);
            Prodotti.create(nuovoProdotto).then(function (data) {
                res.redirect('/amministrazione');
            });


        } else
            res.redirect('/amministrazione');
    });
}

//modifica il prodotto POST
exports.modifica_prodotto = function (req, res) {
    var salva_prodotto = { id: req.body.id, nome: req.body.nome, quantita: req.body.quantita, prezzo: req.body.prezzo, categoria: req.body.categoria, descrizione: req.body.descrizione };


    console.log('id prodotto : ' + salva_prodotto.id);
    console.log('salva prodotto : ' + JSON.stringify(salva_prodotto));

    logging(req, function (dati) {
        if (dati.logged == true) {
            if (Number(salva_prodotto.quantita) <= 5) {
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'Noreplay.ProgettoPW@gmail.com',
                        pass: 'Noreplayprogrammazioneweb'
                    }
                });

                var mailOptions = {
                    from: 'Noreplay.ProgettoPW@gmail.com',
                    to: 'dante.domizi@studenti.unicam.it',
                    subject: 'Prodotto "' + salva_prodotto.nome + '" (cod. ' + salva_prodotto.id + ') in esaurimento',
                    text: 'rimangono solo ' + salva_prodotto.quantita + ' disponibili'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            Prodotti.findByIdAndUpdate({ _id: ObjectID(salva_prodotto.id) }, {
                nome: salva_prodotto.nome,
                descrizione: salva_prodotto.descrizione,
                quantita: Number(salva_prodotto.quantita),
                prezzo: parseFloat(salva_prodotto.prezzo),
                categoria: salva_prodotto.categoria
            }, { new: true }, function (err, prodottoAggiornato) { //ritorna il prodotto aggiornato
                if (err) console.log(err);
                if (Number(prodottoAggiornato.quantita) > 5) { //se la quantita del prodotto aggiornato è maggiore di 5 avverte gli utenti.

                    var avvertendi = (prodottoAggiornato.avverti_user == '') ? [] : JSON.parse(prodottoAggiornato.avverti_user);
                    for (var i = 0; i < avvertendi.length; i++) {
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'Noreplay.ProgettoPW@gmail.com',
                                pass: 'Noreplayprogrammazioneweb'
                            }
                        });

                        var mailOptions = {
                            from: 'Noreplay.ProgettoPW@gmail.com',
                            to: avvertendi[i],
                            subject: 'Prodotto "' + salva_prodotto.nome + '" (cod. ' + salva_prodotto.id + ') disponibile',
                            text: 'Il prodotto ' + salva_prodotto.nome + ' è nuovamente disponibile'
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                    Prodotti.update({ _id: ObjectID(salva_prodotto.id) }, { avverti_user: [] });
                    res.redirect('/amministrazione');

                } else {
                    res.redirect('/amministrazione');
                }
            });
        }
    });

}

//rimuove il prodotto tra quelli disponibili POST
exports.rimuovi_prodotto = function (req, res) {
    logging(req, function (dati) {
        var id_prodotto = ObjectID(req.query.id);
        console.log('id da eliminare : ' + id_prodotto);
        if (dati.logged == true) {

            Prodotti.remove({ _id: id_prodotto }, function (data) {
                res.redirect('/amministrazione');
            });


        } else
            res.redirect('/amministrazione/login');
    })
}

//fa l'upload dell'immagine POST
exports.upload_immagine = function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == true) {


            console.log(req.files.file1);
            var file_1 = req.files.file1;

            file_1.mv('./public/images/prodotti/' + file_1.name, function (err) {
                if (err) {
                    console.log(err);
                    return res.send(err);

                }

            });
            res.redirect('/amministrazione/prodotto');


        } else
            res.redirect('/amministrazione');
    })
}

function logging(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    Prodotti.find({}, function (err, dati_collezione) {
        if (err) {
            res.send(err)
        }
        out.prodotti = dati_collezione;

        if (req.cookies.jwt == undefined || req.cookies.jwt == null) {
            console.log('Token non presente');
            out.logged = false;
            callback(out);

        } else {

            jwt.verify(req.cookies.jwt, config.secret, function (err, decoded) {
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