# ProgrammazioneWeb
Unicam
Progetto Programmazione Web 2016/2017

Link Heroku :
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

## Architettura dei file e delle cartelle:
```
+ ProgrammazioneWeb
	+ .vscode
		launch.json
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
			carrello.js
	+ routes
  		routing.js
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
    + zzCustom
		mongoGlobal.js
		package.json
		socketGlobal.js
 app.js
 package.json
 package-lock.json
 Procfile
 README.md

```
