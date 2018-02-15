var express = require('express');
var router = express.Router();

var monGlo = require('../zzCustom/mongoGlobal');
var ObjectID = require("mongodb").ObjectID;
var nodemailer = require('nodemailer');
var fileUpload = require('express-fileupload');





//...

/* HOME da sistemare*/

router.get('/', function(req, res, next) {
    funzione(req, function(dati) {
        console.log(dati);
        monGlo.find('Prodotti', {}, {}, function(search_result) {
            res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati.prodotti, auth: dati.logged });
        });
    });
});
router.post('/login', function(req, res, next) {
    funzione(req, function(dati) {
        var query = { email: req.body.login_email, password: req.body.login_password };
        console.log(query);
        console.log(req.body);
        var uid;
        monGlo.find('Utenti', query, {}, function(data) {
            console.log(data);
            if (data.length == 0) {
                res.redirect('/');
            } else {
                uid = data[0]._id;
                query = { codice: uid };
                monGlo.find('Sessione', query, {}, function(data) {
                    if (data.length == 0) {
                        query = { codice: uid, stato: true };
                        monGlo.insert('Sessione', query, function(data) {
                            req.session.buser = data[0]._id;
                            res.redirect('/');
                        });
                    } else {
                        query = { codice: uid };
                        monGlo.update('Sessione', query, { stato: false }, function(data) {
                            query = { codice: uid, stato: true };
                            monGlo.insert('Sessione', query, function(data) {
                                req.session.buser = data[0]._id;
                                res.redirect('/');
                            });
                        });
                    }
                });
            }
        });
    });
});
router.get('/logout', function(req, res, next) {
    funzione(req, function(dati) {
        var uid = req.session.buser;
        req.session.destroy();
        var query = { _id: ObjectID(uid) };
        monGlo.update('Sessione', query, { stato: false }, function(data) {
            monGlo.remove('Sessione', { stato: false }, function(data) {
                res.redirect('/');
            });
        });
    });
});
/* HOME */


/* REGISTRAZIONE da sistemare, creare collections carrelli e sessione */
router.get('/registrazione', function(req, res) {
    funzione(req, function(dati) {
        if (dati.logged == true)
            res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged });
        else
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: null, auth: dati.logged });
    });
});
router.post('/registrazione', function(req, res, next) {
    if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
        funzione(req, function(dati) {
            res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
        });
    } else {
        console.log(req.body);
        funzione(req, function(dati) {
            monGlo.find('Utenti', {}, { codice: 1 }, function(data) {
                var newCode = 0;
                if (data.length != 0)
                    newCode = data[data.length - 1].codice + 1;
                monGlo.insert('Utenti', { codice: Number(newCode), nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password, amministratore: false }, function(result) {
                    var query = { codice: Number(result[0].codice) };
                    monGlo.insert('Carrelli', { codice_utente: result[0]._id, carrello: '[]' }, function(cartRes) {
                        var uid;
                        monGlo.insert('Ordini', { codice_utente: result[0]._id, ordine: '[]' }, function(ordine) {
                            monGlo.find('Utenti', query, {}, function(data) {
                                if (data.length == 0) {
                                    res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
                                } else {
                                    uid = data[0]._id;
                                    query = { codice: uid };
                                    monGlo.find('Sessione', query, {}, function(data) {
                                        if (data.length == 0) {
                                            query = { codice: uid, stato: true };
                                            monGlo.insert('Sessione', query, function(data) {
                                                req.session.buser = data[0]._id;
                                                res.redirect('/');
                                            });
                                        } else {
                                            query = { codice: uid };
                                            monGlo.update('Sessione', query, { stato: false }, function(data) {
                                                query = { codice: uid, stato: true };
                                                monGlo.insert('Sessione', query, function(data) {
                                                    req.session.buser = data[0]._id;
                                                    res.redirect('/');
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    }
});
/* REGISTRAZIONE */
/* PROFILO */
router.get('/profilo', function(req, res, next) {
    funzione(req, function(dati) {
        if (dati.logged == false)
            res.redirect('/');
        else {
            monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, {}, function(found) {
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'datiutente', auth: dati.logged, dati_utente: found[0] });
            });
        }
    });
});
router.get('/profilo/storicoordini', function(req, res, next) {
    funzione(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            monGlo.find('Ordini', { codice_utente: dati.userID }, {}, function(ordine) {
                console.log('ordine' + (ordine[0].ordine));
                console.log('tipo : ' + typeof ordine[0].ordine);
                res.render('index', { title: 'il mio profilo', contenuto: 'profilo', contenuto_sub: 'storicoordini', ordini: (ordine[0].ordine), auth: dati.logged });

            });
        }
    });
});
router.post('/modificaprofilo', function(req, res, next) {
    funzione(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            if (req.body.nome == '' || req.body.cognome == '' || req.body.email == '' || req.body.indirizzo == '' || req.body.stato == '' || req.body.provincia == '' || req.body.telefono == '' || req.body.password == '') {
                funzione(req, function(dati) {
                    res.render('index', { title: 'registrazione', contenuto: 'registrazione', errore: 'dati non corretti', auth: dati.logged });
                });
            } else {
                console.log('id : ' + dati.userID);
                monGlo.update('Utenti', { _id: ObjectID(dati.userID) }, { nome: req.body.nome, cognome: req.body.cognome, email: req.body.email, indirizzo: req.body.indirizzo, stato: req.body.stato, provincia: req.body.provincia, telefono: req.body.telefono, password: req.body.password }, function(data) {
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
    funzione(req, function(dati) {
        monGlo.find('Prodotti', { _id: ObjectID(codice_prodotto) }, {}, function(dati_prodotto) {
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
    funzione(req, function(dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            monGlo.find('Prodotti', { nome: regex }, {}, function(dati_ricerca) {
                console.log('prodotti ricercati: ' + dati_ricerca[0]);
                res.render('index', { title: 'home', contenuto: 'prodotti', prodotti: dati_ricerca, auth: dati.logged });


            });
        }

    });
});

/* CATEGORIA */
router.get('/categoria', function(req, res, next) {

    var categoria_prodotto = req.query.cat;
    console.log('categoria del prodotto' + req.query.cat);
    funzione(req, function(dati) {
        monGlo.find('Prodotti', { categoria: categoria_prodotto }, {}, function(dati_prodotto) {
            console.log(dati_prodotto[0]);
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
    funzione(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {
            monGlo.find('Prodotti', { _id: ObjectID(codice_prodotto) }, { nome: 1 }, function(search_result) {
                var prodotto = search_result[0];
                var avvertendi = (prodotto.avverti_user == '') ? [] : JSON.parse(prodotto.avverti_user);
                monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, {}, function(utente) {
                    avvertendi.push(utente[0].email);
                    monGlo.update('Prodotti', { _id: ObjectID(codice_prodotto) }, { avverti_user: JSON.stringify(avvertendi) }, function(result) {
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
    funzione(req, function(dati) {
        if (dati.logged == true) {
            monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, {}, function(utente) {
                var codice_utente = utente[0]._id;
                console.log('codice utente : ' + codice_utente);
                var carrello = (req.session.carrello != undefined) ? req.session.carrello : [];
                console.log('carrello : ' + carrello);
                if (carrello.length == 0) {
                    monGlo.find('Carrelli', { codice_utente: codice_utente }, {}, function(carrello_utente) {
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
                                monGlo.find('Prodotti', { _id: ObjectID(aggiungi) }, {}, function(oggetto) {
                                    oggetto[0].quantità = 1;
                                    carrello.push(JSON.stringify(oggetto[0]));
                                    req.session.carrello = carrello;
                                    monGlo.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
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
                        monGlo.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                            res.render('index', { title: 'carrello', contenuto: 'carrello', auth: dati.logged, carrello: carrello });
                        });
                    } else {
                        if (aggiungilo == true)
                            monGlo.find('Prodotti', { _id: ObjectID(aggiungi) }, {}, function(oggetto) {
                                oggetto[0].quantità = 1;
                                carrello.push(JSON.stringify(oggetto[0]));
                                req.session.carrello = carrello;
                                monGlo.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
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
                    monGlo.find('Prodotti', { _id: ObjectID(aggiungi) }, {}, function(oggetto) {
                        oggetto[0].quantità = 1;
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
    funzione(req, function(dati) {
        if (dati.logged == true) {
            monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, {}, function(utente) {
                var codice_utente = utente[0]._id;
                monGlo.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
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
            edit.quantità = req.body.quantity;
            carrello[i] = JSON.stringify(edit);
        }
    }
    res.redirect('/carrello');
});


router.get('/carrello/acquista', function(req, res, next) {
    var carrello = (req.session.carrello != null) ? req.session.carrello : [];
    console.log('carrello : ' + carrello);
    funzione(req, function(dati) {
        if (dati.logged == false) {
            res.redirect('/');
        } else {


            for (var i = 0; i < carrello.length; i++) {
                var singoloProdotto = JSON.parse(carrello[i]);
                console.log('carrello quantità : ' + singoloProdotto.quantità);
                console.log('prodotto id : ' + singoloProdotto._id);
                var quantity;

                monGlo.find('Prodotti', { _id: ObjectID(singoloProdotto._id) }, {}, function(prodotto) {
                    if (singoloProdotto.quantità > prodotto[0].quantità) {
                        function alert() {
                            alert('quantità richiesta superiore a quella disponibile!');
                        }
                        res.redirect('/carrello');
                    }
                    console.log('vecchia quantità : ' + prodotto[0].quantità);
                    quantity = prodotto[0].quantità - singoloProdotto.quantità;
                    monGlo.update('Prodotti', { _id: ObjectID(singoloProdotto._id) }, { quantità: (quantity) }, function(QT) {



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
                                to: 'william.taruschio@studenti.unicam.it , dante.domizi@studenti.unicam.it',
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
                        monGlo.find('Ordini', { codice_utente: ObjectID(dati.userID) }, {}, function(ORDINE) {
                            ordine = JSON.parse(ORDINE[0].ordine);
                            console.log('ordine : ' + ordine);
                            ordine.push({

                                data: data.toUTCString(),
                                nome: singoloProdotto.nome,
                                quantità: singoloProdotto.quantità,
                                prezzo: singoloProdotto.prezzo,

                            });
                            monGlo.update('Ordini', { codice_utente: ObjectID(dati.userID) }, { ordine: (ordine) }, function(ORDINE) {

                            });

                        })


                    });
                });


            }
            carrello = carrello.splice(carrello.length, 0);
            req.session.carrello = carrello;
            console.log('carrello dopo : ' + carrello);
            monGlo.find('Utenti', { _id: ObjectID(dati.userID) }, { nome: 1 }, function(utente) {
                var codice_utente = utente[0]._id;
                monGlo.update('Carrelli', { codice_utente: codice_utente }, { carrello: JSON.stringify(carrello) }, function(result) {
                    res.redirect('/carrello');
                });


            });


        }
    });

});


/* CARRELLO */
router.get('/passwordDimenticata', function(req, res, next) {
    funzione(req, function(dati) {
        res.render('index', { title: 'home', contenuto: 'passwordDimenticata', auth: dati.logged })

    });

});
router.post('/nuovaPassword', function(req, res, next) {
    console.log('corpo : ' + req.body.password1);
    var email = req.body.emailnuovapassword;
    var password = req.body.password1;
    var confermapassword = req.body.password2;
    if (email == '' || password == '' || confermapassword == '') {
        funzione(req, function(dati) {
            res.redirect('/');
        });
    } else if (password == confermapassword) {
        monGlo.update('Utenti', { email: email }, { password: password }, function(result) {
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
    funzione2(req, function(dati) {


        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('Backend_sessione', query, {}, function(data) {
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
    funzione2(req, function(dati) {
        var query = { email: req.body.login_email, password: req.body.login_password, amministratore: true };
        console.log('query : ' + query);
        console.log(req.body);
        var uid;
        monGlo.find('Utenti', query, {}, function(data) {
            console.log(data);
            if (data.length == 0) {
                res.redirect('/');
            } else {
                uid = data[0]._id;
                query = { codice: uid };
                monGlo.find('Backend_sessione', query, {}, function(data) {
                    if (data.length == 0) {
                        query = { codice: uid, stato: true };
                        monGlo.insert('Backend_sessione', query, function(data) {
                            req.session.buser = data[0]._id;
                            res.redirect('/amministrazione');
                        });
                    } else {
                        query = { codice: uid };
                        monGlo.update('Backend_sessione', query, { stato: false }, function(data) {
                            query = { codice: uid, stato: true };
                            monGlo.insert('Backend_sessione', query, function(data) {
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
    var uid = req.session.buser;
    req.session.destroy();
    var query = { _id: ObjectID(uid) };
    monGlo.update('Backend_sessione', query, { stato: false }, function(data) {
        monGlo.remove('Backend_sessione', { stato: false }, function(data) {
            res.redirect('/amministrazione/login');
        });
    });
});

router.get('/amministrazione/cerca', function(req, res, next) {
    funzione(req, function(dati) {
        if (req.query.search) {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            console.log('regex' + regex);
            monGlo.find('Prodotti', { nome: regex }, {}, function(dati_ricerca) {
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
    funzione(req, function(dati) {
        monGlo.find('Prodotti', { _id: ObjectID(codice_prodotto) }, {}, function(dati_prodotto) {
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
    funzione2(req, function(dati) {
        var prodotto = { nome: req.body.nome, quantità: req.body.quantità, prezzo: req.body.prezzo, categoria: req.body.categoria, descrizione: req.body.descrizione };
        if (prodotto.nome == '' || prodotto.quantità == '' || prodotto.prezzo == '' || prodotto.categoria == '' || prodotto.descrizione == '') {
            res.render('backend/aggiungiprodotto', { errore: 'dati non corretti o incompleti', auth: dati.logged });
        }
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('Backend_sessione', query, {}, function(data) {
                if (data.length == 0) {
                    res.redirect('/amministrazione/login');
                } else {
                    if (Number(prodotto.quantità) <= 5) {
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
                            subject: 'immessa quantità scarsa',
                            text: 'Prodotto "' + prodotto.nome + '" (cod. ' + prodotto._id + ')  , immesso solo ' + prodotto.quantità + ' pezzi.'
                        };

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                    monGlo.insert('Prodotti', {
                        nome: prodotto.nome,
                        descrizione: prodotto.descrizione,
                        quantità: Number(prodotto.quantità),
                        prezzo: parseFloat(prodotto.prezzo),
                        categoria: prodotto.categoria,
                        avverti_user: ""
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
    var salva_prodotto = { id: req.body.id, nome: req.body.nome, quantità: req.body.quantità, prezzo: req.body.prezzo, categoria: req.body.categoria, descrizione: req.body.descrizione };

    console.log('id prodotto : ' + salva_prodotto.id);
    console.log('salva prodotto : ' + salva_prodotto);
    if (req.session.buser !== undefined) {
        var query = { _id: ObjectID(req.session.buser), stato: true };
        monGlo.find('Backend_sessione', query, {}, function(data) {
            if (data.length == 0) {
                res.redirect('/amministrazione/login');
            } else {
                if (Number(salva_prodotto.quantità) <= 5) {
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
                        text: 'rimangono solo ' + salva_prodotto.quantità + ' disponibili'
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
                monGlo.update('Prodotti', { _id: ObjectID(salva_prodotto.id) }, {
                    nome: salva_prodotto.nome,
                    descrizione: salva_prodotto.descrizione,
                    quantità: Number(salva_prodotto.quantità),
                    prezzo: parseFloat(salva_prodotto.prezzo),
                    categoria: salva_prodotto.categoria
                }, function() {
                    if (Number(salva_prodotto.quantità) > 0) {
                        monGlo.find('Prodotti', { _id: ObjectID(salva_prodotto.id) }, { nome: 1 }, function(prodotto_da_segnalare) {
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
                            monGlo.update('Prodotti', { _id: ObjectID(salva_prodotto.id) }, { avverti_user: '' }, function() {});
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
        monGlo.find('Backend_sessione', query, {}, function(data) {
            if (data.length == 0) {
                res.redirect('/amministrazione/login');
            } else {
                monGlo.remove('Prodotti', { _id: id_prodotto }, function(data) {
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
        monGlo.find('Backend_sessione', query, {}, function(data) {
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


function funzione2(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    monGlo.find('Prodotti', {}, { codice: 1 }, function(dati_collezione) {
        out.prodotti = dati_collezione;
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('Backend_sessione', query, {}, function(data) {
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

function funzione(req, callback) {
    var out = { prodotti: '', logged: false, userID: '' };
    monGlo.find('Prodotti', {}, { codice: 1 }, function(dati_collezione) {
        out.prodotti = dati_collezione;
        if (req.session.buser !== undefined) {
            var query = { _id: ObjectID(req.session.buser), stato: true };
            monGlo.find('Sessione', query, {}, function(data) {
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
module.exports = router;