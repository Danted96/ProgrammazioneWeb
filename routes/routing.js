var express = require('express');
let app = express();
var router = express.Router();
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var monGlo = require('../zzCustom/mongoGlobal');
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

/* HOME da sistemare*/

router.get('/', function(req, res, next) {
    logging(req, function(dati) {
        // console.log(dati);

        Prodotti.find(function(search_result) {
            res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati.prodotti, auth: dati.logged });
        });
    });
});
router.post('/login', function(req, res, next) {
    // logging(req, function(dati) {
    var query = { email: req.body.login_email, password: req.body.login_password };
    console.log(query);
    console.log(req.body);
    var uid;
    Utenti.find(query).then(function(data) {
        console.log('utente :' + data);

        if (data.length == 0) {
            res.redirect('/');
        } else {
            uid = data[0]._id;
            console.log('nome utente ' + data[0].nome)
            var uname = data[0].name;
            query = { codice: uid };
            var token = jwt.sign({ uid, admin: false }, config.secret);
            res.cookie('jwt', token);
            res.redirect('/');
            /*     Sessione.find(query).then(function(data) {
                     console.log('dati sessione  ' + data);
                     console.log('stato sessione  ' + data[0].stato);
                     if (data[0].stato == false) {
                         Sessione.update({ codice: uid }, { stato: true }, function(raw) {
                             console.log('raw message from mongo:  ' + raw);
                             req.session.buser = data[0]._id;
                             console.log('buser  ' + req.session.buser);
                             res.redirect('/');
                         });


                     } else {
                         req.session.buser = data[0]._id;
                         console.log('loggato??  ' + dati.logged);
                         res.redirect('/');
                     }
                 });*/
        }
    });

    // });

});
router.get('/logout', function(req, res, next) {
    console.log(req.cookies.jwt)

    res.clearCookie('jwt');
    console.log(req.cookies.jwt)
    res.redirect('/');
    /*logging(req, function(dati) {
        var id = req.session.buser;
        req.session.destroy();
        var query = { _id: ObjectID(id) };
        Sessione.update(query, { stato: false }, function(data) {
            res.redirect('/');
        });
    });*/
});

/* HOME */


/* REGISTRAZIONE*/
router.get('/registrazione', function(req, res) {
    logging(req, function(dati) {
        if (dati.logged == true)
            res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged });
        else
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: null, auth: dati.logged });
    });
});
router.post('/registrazione', function(req, res, next) {
    if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
        logging(req, function(dati) {
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
        });
    } else {
        console.log(req.body);
        //logging(req, function(dati) {
        //  Utenti.find({}).then(function(data) {
        console.log('------------------------------------');
        console.log('1 step');
        console.log('------------------------------------');
        /* var newCode = 0;
         if (data.length != 0)
             newCode = data[data.length - 1].codice + 1;*/
        Utenti.create({ nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password, amministratore: false }).then(function(result) {
            console.log('------------------------------------' + result._id);
            console.log('2 step');
            //console.log('------------------------------------' + result[0]._id);
            var query = { _id: result._id };
            console.log('------------------------------------');
            console.log('3 step');
            console.log('------------------------------------');
            Carrelli.create({ _id: result._id }).then(function(cartRes) {
                var uid;
                Ordini.create({ _id: result._id /*, ordine: arrayVuoto*/ }).then(function(ordine) {
                    Utenti.find(query).then(function(data) {

                        if (data.length == 0) {
                            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
                        } else {
                            uid = data[0]._id;
                            query = { codice: uid };
                            var token = jwt.sign({ uid, admin: false }, config.secret);
                            res.cookie('jwt', token);
                            /*  Sessione.find(query).then(function(data) {
                                  query = { codice: uid, stato: true };
                                  Sessione.create(query, function(data) {
                                      req.session.buser = data[0]._id;
                                      res.redirect('/');
                                  });
                              });*/
                            res.redirect('/');
                        }
                    });
                });
            });
        });
        //});
        //});
    }
});
/* REGISTRAZIONE */
/* PROFILO */
router.get('/profilo', function(req, res, next) {
    logging(req, function(dati) {
        if (dati.logged == false)
            res.redirect('/');
        else {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function(found) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged, dati_utente: found[0] });
            });
        }
    });
});
router.get('/profilo/storicoordini', function(req, res, next) {
    logging(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Ordini.find({ codice_utente: dati.userID }).then(function(ordine) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'storicoordini', ordini: (ordine[0].ordine), auth: dati.logged });

            });
        }
    });
});
router.post('/modificaprofilo', function(req, res, next) {
    logging(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
                res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
            } else {
                console.log('id : ' + dati.userID);
                Utenti.update({ _id: ObjectID(dati.userID) }, { nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password }, function(data) {
                    console.log('profilo modificato');
                    res.redirect('/profilo');

                })
            }
        }
    });
});


/* PROFILO */

/* PRODOTTO */
router.get('/prodotto', function(req, res, next) {
    //Titolo = nome del prodotto
    var codice_prodotto = req.query.pro;
    console.log('codice del prodotto' + req.query.pro);
    logging(req, function(dati) {
        Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function(dati_prodotto) {
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
router.get('/cerca', function(req, res, next) {
    logging(req, function(dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            Prodotti.find({ nome: regex }).then(function(dati_ricerca) {
                console.log('prodotti ricercati: ' + dati_ricerca[0]);
                res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati_ricerca, auth: dati.logged });


            });
        }

    });
});

/* CATEGORIA */
router.get('/categoria', function(req, res, next) {

    var categoria_prodotto = req.query.cat;
    console.log('categoria del prodotto ' + req.query.cat);
    logging(req, function(dati) {
        Prodotti.find({ categoria: req.query.cat }).then(function(dati_prodotto) {
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
router.post('/avvertimi', function(req, res, next) {
    var codice_prodotto = req.body.codice;
    logging(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function(search_result) {
                var prodotto = search_result[0];
                var avvertendi = (prodotto.avverti_user == '') ? [] : JSON.parse(prodotto.avverti_user);
                Utenti.find({ _id: ObjectID(dati.userID) }).then(function(utente) {
                    avvertendi.push(utente[0].email);
                    Prodotti.update({ _id: ObjectID(codice_prodotto) }, { avverti_user: JSON.stringify(avvertendi) }, function(result) {
                        res.send('OK');
                    });
                });
            });
        }
    });
});

/* CARRELLO */
router.get('/carrello', function(req, res, next) {
    var aggiungi = req.query.add;

    console.log('aggiungi : ' + aggiungi);
    logging(req, function(dati) {
        if (dati.logged == true) {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function(utente) {
                var codice_utente = utente[0]._id;
                console.log('codice utente : ' + codice_utente);
                var carrello = (req.session.carrello != undefined) ? req.session.carrello : [];
                console.log('carrello : ' + carrello);
                if (carrello.length == 0) {
                    Carrelli.find({ codice_utente: codice_utente }).then(function(carrello_utente) {
                        console.log('carrello utente : ' + JSON.stringify(carrello_utente[0]));
                        carrello = JSON.parse(carrello_utente[0].carrello);
                        req.session.carrello = carrello;
                        if (aggiungi == undefined) {
                            res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                        } else {

                            var aggiungilo = true;
                            if (carrello != []) {
                                for (var i = 0; i < carrello.length; i++) {
                                    if (JSON.parse(carrello[i]).codice == aggiungi)
                                        aggiungilo = false;
                                }
                            }

                            if (aggiungilo == true)
                                Prodotti.find({ _id: ObjectID(aggiungi) }).then(function(oggetto) {
                                    oggetto[0].quantita = 1;
                                    carrello.push(JSON.stringify(oggetto[0]));
                                    req.session.carrello = carrello;
                                    Carrelli.update({ codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                                        res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                                    });
                                });
                            else
                                res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                        }
                    });
                } else {
                    var aggiungilo = true;
                    if (carrello != []) {
                        for (var i = 0; i < carrello.length; i++) {
                            if (JSON.parse(carrello[i]).codice == aggiungi)
                                aggiungilo = false;
                        }
                    }
                    if (aggiungi == undefined) {
                        Carrelli.update({ codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                            res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                        });
                    } else {
                        if (aggiungilo == true)
                            Prodotti.find({ _id: ObjectID(aggiungi) }).then(function(oggetto) {
                                oggetto[0].quantita = 1;
                                carrello.push(JSON.stringify(oggetto[0]));
                                req.session.carrello = carrello;
                                Carrelli.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                                    res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                                });
                            });
                        else
                            res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                    }
                }
            });
        } else {
            var carrello = (req.session.carrello != null) ? req.session.carrello : [];
            var aggiungilo = true;
            if (req.session.carrello != []) {
                for (var i = 0; i < carrello.length; i++) {
                    if (JSON.parse(carrello[i]).codice == aggiungi)
                        aggiungilo = false;
                }
            }
            if (aggiungi == undefined) {
                res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
            } else {
                if (aggiungilo == true)
                    Prodotti.find({ _id: ObjectID(aggiungi) }).then(function(oggetto) {
                        oggetto[0].quantita = 1;
                        carrello.push(JSON.stringify(oggetto[0]));
                        req.session.carrello = carrello;
                        res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                    });
                else
                    res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
            }
        }
    });
});
router.post('/carrello/remove', function(req, res, next) {
    var carrello = (req.session.carrello != undefined) ? req.session.carrello : [];
    carrello.splice(req.body.index, 1);
    req.session.carrello = carrello;
    console.log('indice : ' + req.body.index);
    logging(req, function(dati) {
        if (dati.logged == true) {
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function(utente) {
                var codice_utente = utente[0]._id;
                Carrelli.update({ codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                    res.send('ok');
                });
            });
        } else {
            res.send('ok');
        }
    });
});
router.post('/carrello/update', function(req, res, next) {
    var carrello = (req.session.carrello != null) ? req.session.carrello : [];
    console.log('carrello : ' + carrello);
    for (var i = 0; i < carrello.length; i++) {
        if (i == req.body.index) {
            console.log('index : ' + i);
            var edit = JSON.parse(carrello[i]);
            console.log('carrello : ' + edit);
            edit.quantita = req.body.quantity;
            carrello[i] = JSON.stringify(edit);
        }
    }
    res.redirect('/carrello');
});


router.get('/carrello/acquista', function(req, res, next) {
    var carrello = (req.session.carrello != null) ? req.session.carrello : [];
    console.log('carrello : ' + carrello);
    logging(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {


            for (var i = 0; i < carrello.length; i++) {
                var singoloProdotto = JSON.parse(carrello[i]);
                console.log('carrello quantita : ' + singoloProdotto.quantita);
                console.log('prodotto id : ' + singoloProdotto._id);
                var quantity;

                Prodotti.find({ _id: ObjectID(singoloProdotto._id) }).then(function(prodotto) {
                    if (singoloProdotto.quantita > prodotto[0].quantita) {
                        function alert() {
                            alert('quantita richiesta superiore a quella disponibile!');
                        }
                        res.redirect('/carrello');
                    }
                    console.log('vecchia quantita : ' + prodotto[0].quantita);
                    quantity = prodotto[0].quantita - singoloProdotto.quantita;
                    Prodotti.update({ _id: ObjectID(singoloProdotto._id) }, { quantita: (quantity) }, function(QT) {



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

                            transporter.sendMail(mailOptions, function(error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                        }


                        var data = new Date();
                        var ordine;
                        Ordini.find({ codice_utente: ObjectID(dati.userID) }).then(function(ORDINE) {
                            ordine = ORDINE[0].ordine;
                            console.log('ordine : ' + ordine);
                            ordine.push({

                                "data": data.toUTCString(),
                                "nome": singoloProdotto.nome,
                                "quantita": singoloProdotto.quantita,
                                "prezzo": singoloProdotto.prezzo,

                            });
                            Ordini.update({ codice_utente: ObjectID(dati.userID) }, { ordine: (ordine) }, function(ORDINE) {

                            });

                        })


                    });
                });


            }
            carrello = carrello.splice(carrello.length, 0);
            req.session.carrello = carrello;
            console.log('carrello dopo : ' + carrello);
            Utenti.find({ _id: ObjectID(dati.userID) }).then(function(utente) {
                var codice_utente = utente[0]._id;
                Carrelli.update({ codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                    res.redirect('/carrello');
                });


            });


        }
    });

});


/* CARRELLO */
router.get('/passwordDimenticata', function(req, res, next) {
    logging(req, function(dati) {
        res.render('index', { title: 'home', contenuto: 'passwordDimenticata', auth: dati.logged })

    });

});
router.post('/nuovaPassword', function(req, res, next) {
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
});

/* PARTE AMMINISTRAZIONE */
router.get('/amministrazione', function(req, res, next) {
    loggingAmministratore(req, function(dati) {


        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            Sessione_backend.find(query, function(data) {
                if (data.length == 0) {
                    req.session.destroy();
                    res.redirect('/');
                } else {
                    res.render('backend/index', { title: 'amministrazione', contenuto: 'gestioneprodotti', prodotti: dati.prodotti, auth: dati.logged });
                }
            });
        } else {
            res.redirect('/');
        }
    });
});
router.post('/amministrazione/login', function(req, res, next) {
    loggingAmministratore(req, function(dati) {
        var query = { email: req.body.login_email, password: req.body.login_password, amministratore: true };
        console.log('query : ' + query);
        console.log(req.body);
        var uid;
        Utenti.find(query).then(function(data) {
            console.log(data);
            if (data.length == 0) {
                res.redirect('/');
            } else {
                uid = data[0]._id;
                query = { codice: uid };
                Sessione_backend.find(query, function(data) {
                    if (data.length == 0) {
                        query = { codice: uid, stato: true };
                        Sessione_backend.create(query, function(data) {
                            req.session.buser = data[0]._id;
                            res.redirect('/amministrazione');
                        });
                    } else {
                        query = { codice: uid };
                        Sessione_backend.update(query, { stato: false }, function(data) {
                            query = { codice: uid, stato: true };
                            Sessione_backend.create(query, function(data) {
                                req.session.buser = data[0]._id;
                                res.redirect('/amministrazione');
                            });
                        });
                    }
                });
            }
        });
    });
});
router.get('/logout', function(req, res) {

    res.clearCookie('jwt');
    res.redirect('/amministrazione/login');
    /*  var uid = req.session.buser;
      req.session.destroy();
      var query = { _id: ObjectID(uid) };
      Sessione_backend.update(query, { stato: false }, function(data) {
          Sessione_backend.remove({ stato: false }, function(data) {
              res.redirect('/amministrazione/login');
          });
      });*/
});

router.get('/amministrazione/cerca', function(req, res, next) {
    logging(req, function(dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            Prodotti.find({ nome: regex }).then(function(dati_ricerca) {
                console.log('prodotti ricercati: ' + dati_ricerca[0]);
                res.render('backend/index', { title: 'amministrazione', contenuto: 'gestioneprodotti', prodotti: dati_ricerca, auth: dati.logged });


            });
        }

    });
});

router.get('/amministrazione/prodotto', function(req, res, next) {

    var codice_prodotto = req.query.pro;
    console.log('codice del prodotto' + req.query.pro);
    var _id = (codice_prodotto);
    console.log('id  ' + _id);
    logging(req, function(dati) {
        Prodotti.find({ _id: ObjectID(codice_prodotto) }).then(function(dati_prodotto) {
            res.render('backend/index', {
                title: 'prodotto',
                contenuto: 'aggiungiprodotto',
                dati_prodotto: dati_prodotto[0],
                auth: dati.logged,
                errore: null
            });
        });
    });
});

router.post('/amministrazione/aggiungi', function(req, res, next) {
    loggingAmministratore(req, function(dati) {
        var prodotto = { nome: req.body.nome, quantita: req.body.quantita, prezzo: req.body.prezzo, categoria: req.body.categoria, descrizione: req.body.descrizione };
        if (prodotto.nome == '' || prodotto.quantita == '' || prodotto.prezzo == '' || prodotto.categoria == '' || prodotto.descrizione == '') {
            res.render('backend/aggiungiprodotto', { errore: 'dati non corretti o incompleti', auth: dati.logged });
        }
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            Sessione_backend.find(query, function(data) {
                if (data.length == 0) {
                    res.redirect('/amministrazione/login');
                } else {
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

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                    Prodotti.create({
                        nome: prodotto.nome,
                        descrizione: prodotto.descrizione,
                        quantita: Number(prodotto.quantita),
                        prezzo: parseFloat(prodotto.prezzo),
                        categoria: prodotto.categoria,
                        avverti_user: []
                    }, function(data) {
                        res.redirect('/amministrazione');
                    });

                }
            });
        } else
            res.redirect('/amministrazione/login');
    });
});

router.post('/amministrazione/update', function(req, res, next) {
    var salva_prodotto = { id: req.body.id, nome: req.body.nome, quantita: req.body.quantita, prezzo: req.body.prezzo, categoria: req.body.categoria, descrizione: req.body.descrizione };

    console.log('id prodotto : ' + salva_prodotto.id);
    console.log('salva prodotto : ' + salva_prodotto);
    if (req.session.buser !== undefined) {
        var query = { _id: ObjectID(req.session.buser), stato: true };
        Sessione_backend.find(query, function(data) {
            if (data.length == 0) {
                res.redirect('/amministrazione/login');
            } else {
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

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
                Prodotti.update({ _id: ObjectID(salva_prodotto.id) }, {
                    nome: salva_prodotto.nome,
                    descrizione: salva_prodotto.descrizione,
                    quantita: Number(salva_prodotto.quantita),
                    prezzo: parseFloat(salva_prodotto.prezzo),
                    categoria: salva_prodotto.categoria
                }, function() {
                    if (Number(salva_prodotto.quantita) > 0) {
                        Prodotti.find({ _id: ObjectID(salva_prodotto.id) }).then(function(prodotto_da_segnalare) {
                            var avvertendi = (prodotto_da_segnalare[0].avverti_user == '') ? [] : JSON.parse(prodotto_da_segnalare[0].avverti_user);
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

                                transporter.sendMail(mailOptions, function(error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                });
                            }
                            Prodotti.update({ _id: ObjectID(salva_prodotto.id) }, { avverti_user: [] }, function() {});
                            res.redirect('/amministrazione');
                        });
                    } else {
                        res.redirect('/amministrazione');
                    }
                });
            }
        });
    } else
        res.redirect('/amministrazione/login');
});

router.post('/amministrazione/delete', function(req, res, next) {
    var id_prodotto = ObjectID(req.query.id);
    console.log('id da eliminare : ' + id_prodotto);
    if (req.session.buser !== undefined) {
        var query = { _id: ObjectID(req.session.buser), stato: true };
        Sessione_backend.find(query).then(function(data) {
            if (data.length == 0) {
                res.redirect('/amministrazione/login');
            } else {
                Prodotti.remove({ _id: id_prodotto }, function(data) {
                    res.redirect('/amministrazione');
                });
            }
        });
    } else
        res.redirect('/amministrazione/login');

});

router.post('/upload', function(req, res, next) {
    if (req.session.buser !== undefined) {
        var query = { _id: ObjectID(req.session.buser), stato: true };
        Sessione_backend.find(query, function(data) {
            if (data.length == 0) {
                res.redirect('/amministrazione/login');
            } else {
                console.log(req.files.file1);
                var file_1 = req.files.file1;

                file_1.mv('./public/images/prodotti/' + file_1.name, function(err) {
                    if (err) {
                        console.log(err);
                        return res.send(err);
                        //return res.status(500).send(err);
                    }

                });
                res.redirect('/amministrazione/prodotto');
            }
        });
    } else
        res.redirect('/amministrazione/login');
});


function loggingAmministratore(req, callback) {
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
};

function logging(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    Prodotti.find({}, (function(err, dati_collezione) {
        if (err) {
            res.send(err)
        }
        // console.log('dati collezione logging  ' + dati_collezione);
        out.prodotti = dati_collezione;

        if (req.cookies.jwt == undefined || req.cookies.jwt == null) {
            console.log('Token non presente');
            out.logged = false;
            callback(out);

        } else {
            //console.log('token info ' + req.cookies.jwt);
            jwt.verify(req.cookies.jwt, config.secret, function(err, decoded) {
                if (err) {
                    console.log('Token non valido');
                    out.logged = false;
                } else {
                    console.log('Token valido');
                    out.logged = true;
                    out.userID = decoded.uid;
                }
            })
        }


        callback(out);

        /* if (req.session.buser != undefined) {
             //dovrebbe trovare la sessione relativa all'utente in base alla sessione
             var query = { _id: ObjectID(req.session.buser), stato: true };
             Sessione.find(query).then(function(data) {
                 if (data.length != 0) {
                     out.userID = data[0].codice;
                     out.logged = true;
                 }
                 callback(out);
             });
         } else */

    }))
};
module.exports = router;