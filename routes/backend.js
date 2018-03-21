

module.exports = function (app, db) {
    var apiBackend = require('../API/apiBackend.js');
    apiBackend.setDb(db);

    // Api degli utenti
    app.route('/amministrazione')
        .get(apiBackend.amministrazione);

    app.route('/amministrazione/login')
        .post(apiBackend.login_amministratore);

    app.route('/logout')
        .get(apiBackend.logout_amministratore);

    app.route('/amministrazione/cerca')
        .get(apiBackend.cerca_amministrazione);
    app.route('/amministrazione/prodotto')
        .get(apiBackend.nuovoProdotto);

    app.route('/amministrazione/aggiungi')
        .post(apiBackend.aggiungi_prodotto);

    app.route('/amministrazione/update')
        .post(apiBackend.modifica_prodotto);

    app.route('/amministrazione/delete')
        .post(apiBackend.rimuovi_prodotto);

    app.route('/upload')
        .post(apiBackend.upload_immagine);



};



