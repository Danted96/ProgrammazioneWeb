# ProgrammazioneWeb
Unicam
Progetto Programmazione Web 2016/2017

Link Heroku : https://stark-journey-36236.herokuapp.com/
Link al video su youtube: https://www.youtube.com/watch?v=MG7enLoEDOE&feature=youtu.be
Link alla presentazione: https://drive.google.com/open?id=1fEhpiPnS0l3tadGLvXEOcA9udcSce4Az

Per avviare il progetto in locale: 
1) Selezionare la cartella del progetto
2) Scrivere da prompt dei comandi il seguente comando: 

```
npm start
```

### Credenziali amministratore 
email: william.taruschio@studenti.unicam.it
password: admin

## User story:
* Come admin voglio poter accedere ad un’area privata tramite username e password
* Come admin voglio gestire le rimanenze e i re-ordini dei prodotti
* Il server deve inviare una email all’admin quando sta per terminare un prodotto
* Come admin voglio poter creare e inserire un nuovo prodotto (con proprietà come nome, descrizione, peso, ecc.)
* Come user voglio essere avvertito quando un prodotto terminato, risulta nuovamente disponibile
* Come admin voglio poter modificare un prodotto inserito precedentemente
* Come user posso visualizzare lo storico dei miei acquisti 
* Come user posso ricercare un prodotto all'interno del sito
* Come user voglio poter reimpostare la mia password se dimenticata 
* Come user voglio gestire il mio ordine dal carello, modificando la quantità e rimuovendo i prodotti
* Come user posso modificare i dati del mio account
* Come user posso visualizzare i prodotti in base alle categorie 

## Architettura dei file e delle cartelle:
```
+ ProgrammazioneWeb
	+ .vscode
		launch.json
	+ API
		apiBackend.js
		apiFrontend.js
	+ models
		carrelli.js
		ordini.js
		prodoti.js
		sessioni.js
		sessioni_backend.js
		utenti.js
	+ node_modules
	+ public
  		+ css
		    bootstrap.css
			  bootstrap.min.css
			  style.css
  	+ images
			+ prodotti
				pc.jpg	
		+ js
			bootstrap.js
			bootstrap.min.js
	+ routes
  		backend.js
		frontend.js
	+ views
		+ backend
			aggiungiprodotto.ejs
			gestioneprodotti.ejs
			index.ejs
		carrello.ejs
		datiutente.ejs
		error.ejs
		index.ejs
		passwordDimenticata.ejs
		prodotti.ejs
		prodotto.ejs
		profilo.ejs
		registrazione.ejs
		storicoordini.ejs
 app.js
 package.json
 package-lock.json
 Procfile
 README.md
 config.js
```

## Autori 
* William Taruschio william.taruschio@studenti.unicam.it 095101
* Dante Domizi dante.domizi@studenti.unicam.it 095800
* Luca Rossi luca02.rossi@studenti.unicam.it 095572
