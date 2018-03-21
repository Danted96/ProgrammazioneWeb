


module.exports = function (app, db) {
    var apiFrontend = require('../API/apiFrontend.js');
    apiFrontend.setDb(db);
    var apiBackend = require('../API/apiBackend.js');
    // Api frontend
    app.route('/')
        .get(apiFrontend.home);

    app.route('/login')
        .post(apiFrontend.login_utente);

    app.route('/logout')
        .get(apiFrontend.logout);

    app.route('/registrazione')
        .get(apiFrontend.registrazione_utente);

    app.route('/registrazione')
        .post(apiFrontend.registrazione_utentePost);

    app.route('/profilo')
        .get(apiFrontend.profilo);

    app.route('/profilo/storicoordini')
        .get(apiFrontend.storicoordini);

    app.route('/modificaprofilo')
        .post(apiFrontend.modificaprofilo);

    app.route('/prodotto')
        .get(apiFrontend.mostra_prodotto);

    app.route('/cerca')
        .get(apiFrontend.ricerca_prodotto);

    app.route('/categoria')
        .get(apiFrontend.categoria);

    app.route('/avvertimi')
        .post(apiFrontend.avverti_utente);

    app.route('/carrello')
        .get(apiFrontend.carrello);

    app.route('/carrello/aggiungi')
        .get(apiFrontend.carrello_aggiungi);

    app.route('/carrello/remove')
        .post(apiFrontend.carrello_rimuovi);

    app.route('/carrello/update')
        .post(apiFrontend.carrello_aggiorna);

    app.route('/carrello/acquista')
        .get(apiFrontend.carrello_acquista);

    app.route('/passwordDimenticata')
        .get(apiFrontend.password_dimenticata);

    app.route('/nuovaPassword')
        .post(apiFrontend.nuova_password);

    app.route('/amministrazione/login')
        .post(apiBackend.login_amministratore);

};








