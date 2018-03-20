var express = require('express');
let app = express();
var router = express.Router();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var ObjectID = require("mongodb").ObjectID;
var nodemailer = require('nodemailer');
var fileUpload = require('express-fileupload');
var arrayVuoto = [];
var jwt = require('jsonwebtoken');
var Prodotti = require('../models/prodotti');
var Sessione = require('../models/sessioni');
var Utenti = require('../models/utenti');
var Sessione_backend = require('../models/sessioni_backend');
var Ordini = require('../models/ordini');
var Carrelli = require('../models/carrelli');
var config = require('../config');

//...

/* HOME */

router.get('/', function (req, res, next) {
    logging(req, function (dati) {

        Prodotti.find(function (search_result) {
            res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati.prodotti, auth: dati.logged });
        });
    });
});
router.post('/login', function (req, res, next) {
    // logging(req, function(dati) {
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

    // });

});
router.get('/logout', function (req, res, next) {
    console.log(req.cookies.jwt)

    res.clearCookie('jwt');
    console.log(req.cookies.jwt)
    res.redirect('/');

});

/* HOME */


/* REGISTRAZIONE*/
router.get('/registrazione', function (req, res) {
    logging(req, function (dati) {
        if (dati.logged == true)
            res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged });
        else
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: null, auth: dati.logged });
    });
});
router.post('/registrazione', function (req, res, next) {
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
                        if (data.length == 0) {     // utente gia esistente, quindi effettua il login
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
});
/* REGISTRAZIONE */
/* PROFILO */
router.get('/profilo', function (req, res, next) {
    logging(req, function (dati) {
        if (dati.logged == false)
            res.redirect('/');
        else {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function (found) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged, dati_utente: found[0] });
            });
        }
    });
});
router.get('/profilo/storicoordini', function (req, res, next) {
    logging(req, function (dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Ordini.find({ codice_utente: dati.userID }).then(function (ordine) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'storicoordini', ordini: (ordine[0].ordine), auth: dati.logged });

            });
        }
    });
});
router.post('/modificaprofilo', function (req, res, next) {
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

                })
            }
        }
    });
});


/* PROFILO */

/* PRODOTTO */
router.get('/prodotto', function (req, res, next) {

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
});
/* PRODOTTO */

function escapeRegex(text) { //regex per la ricerca del nome dei prodotti
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
router.get('/cerca', function (req, res, next) {
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
});

/* CATEGORIA */
router.get('/categoria', function (req, res, next) {

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
});
router.post('/avvertimi', function (req, res, next) {
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

                    //aggiorna l'array contente le email da avvertire in caso il prodotto ritornasse disponibile

                    Prodotti.update({ _id: ObjectID(codice_prodotto) }, { avverti_user: JSON.stringify(avvertendi) }, function (result) {
                        res.send('OK');
                    });
                });
            });
        }
    });
});

/* CARRELLO */
router.get('/carrello', function (req, res, next) {

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
});

//aggiunge il prodotto selezionato al carrello
router.get('/carrello/aggiungi', function (req, res, next) {
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
});
router.post('/carrello/remove', function (req, res, next) {


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
});
//aggiorna la quantità del prodotto nel carrello
router.post('/carrello/update', function (req, res, next) {
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
});


router.get('/carrello/acquista', function (req, res, next) {
    logging(req, function (dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Carrelli.find({ codice_utente: dati.userID }).then(function (carrello_utente) {
                carrello = JSON.parse(carrello_utente[0].carrello);


                for (var i = 0; i < carrello.length; i++) {
                    var singoloProdotto = JSON.parse(carrello[i]);
                    console.log('carrello quantita : ' + singoloProdotto.quantita);
                    console.log('prodotto id : ' + singoloProdotto._id);
                    var quantity;

                    Prodotti.find({ _id: ObjectID(singoloProdotto._id) }).then(function (prodotto) {
                        if (singoloProdotto.quantita > prodotto[0].quantita) {
                            function alert() {
                                alert('quantita richiesta superiore a quella disponibile!');
                            }
                            res.redirect('/carrello');
                        }
                        console.log('vecchia quantita : ' + prodotto[0].quantita);
                        quantity = prodotto[0].quantita - singoloProdotto.quantita;




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
                        var ordine;
                        Ordini.find({ codice_utente: ObjectID(dati.userID) }).then(function (ORDINE) {
                            ordine = ORDINE[0].ordine;
                            console.log('ordine : ' + ordine);
                            ordine.push({

                                "data": data.toUTCString(),
                                "nome": singoloProdotto.nome,
                                "quantita": singoloProdotto.quantita,
                                "prezzo": singoloProdotto.prezzo,

                            });
                            Ordini.update({ codice_utente: ObjectID(dati.userID) }, { ordine: (ordine) }, function (ORDINE) {

                            });
                            Prodotti.update({ _id: ObjectID(singoloProdotto._id) }, { quantita: (quantity) }, function (QT) {

                            });


                        });
                    });


                }
                carrello = carrello.splice(carrello.length, 0);

                console.log('carrello dopo : ' + carrello);
                Carrelli.update({ codice_utente: dati.userID }, { carrello: JSON.stringify(carrello) }, function (result) {
                    res.redirect('/carrello');
                });




            });
        }
    });
    

});

/* PASSWORD */
router.get('/passwordDimenticata', function (req, res, next) {
    logging(req, function (dati) {
        res.render('index', { title: 'home', contenuto: 'passwordDimenticata', auth: dati.logged })

    });

});
router.post('/nuovaPassword', function (req, res, next) {
    console.log('corpo : ' + req.body.password1);
    var email = req.body.emailnuovapassword;
    var password = req.body.password1;
    var confermapassword = req.body.password2;
    if (email == '' || password == '' || confermapassword == '') {
        logging(req, function (dati) {
            res.redirect('/');
        });
    } else if (password == confermapassword) {
        Utenti.update({ email: email }, { password: password }, function (result) {
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

            transporter.sendMail(mailOptions, function (error, info) {
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
});

/* PARTE AMMINISTRAZIONE */
router.get('/amministrazione', function (req, res, next) {
    logging(req, function (dati) {

        if (dati.logged == true) {
            res.render('backend/index', { title: 'amministrazione', contenuto: 'gestioneprodotti', prodotti: dati.prodotti, auth: dati.logged });
        } else {
            res.redirect('/');
        }

    });
});
router.post('/amministrazione/login', function (req, res, next) {

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
});
router.get('/logout', function (req, res) {

    res.clearCookie('jwt');
    res.redirect('/amministrazione/login');

});

router.get('/amministrazione/cerca', function (req, res, next) {
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
});

router.get('/amministrazione/prodotto', function (req, res, next) {

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
});

router.post('/amministrazione/aggiungi', function (req, res, next) {
    logging(req, function (dati) {
        var prodotto = { nome: req.body.nome, descrizione: req.body.descrizione, quantita: req.body.quantita, prezzo: req.body.prezzo, categoria: req.body.categoria };
        if (prodotto.nome == '' || prodotto.quantita == '' || prodotto.prezzo == '' || prodotto.categoria == '' || prodotto.descrizione == '') {
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
            res.redirect('/amministrazione/login');
    });
});

router.post('/amministrazione/update', function (req, res, next) {
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
            }, { new: true }, function (err, prodottoAggiornato) {  //ritorna il prodotto aggiornato
                if (err) console.log(err);
                if (Number(prodottoAggiornato.quantita) > 5) {  //se la quantita del prodotto aggiornato è maggiore di 5 avverte gli utenti.

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

});

router.post('/amministrazione/delete', function (req, res, next) {
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
});


//upload immagine
router.post('/upload', function (req, res, next) {
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
            res.redirect('/amministrazione/login');
    })
});


/*function loggingAmministratore(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    Prodotti.find({}).then(function(err, dati_collezione) {
        if (err) {
            res.send(err)
        }
        out.prodotti = dati_collezione;
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            Sessione_backend.find(query).then(function(data) {
                console.log('prova amministrazione :  ' + data[0]);
                if (data.length != 0) {
                    out.userID = data[0].codice;
                    out.logged = true;
                }
                callback(out);
            });
        } else
            callback(out);
    });
};*/

/* controlla se il token esiste,se è valido o no;
 inoltre ritorna la lista dei prodotti */

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
module.exports = router;