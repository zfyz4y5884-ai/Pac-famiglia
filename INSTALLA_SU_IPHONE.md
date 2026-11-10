# PAC Famiglia 1.4: aggiornamento e installazione su iPhone

## Novità
- Crea persone diverse, come **Ginevra**, **Marco** e altri familiari.
- Ogni persona può avere più piani (es. PAC VWCE e PAC VUAA).
- Ogni piano ha il proprio ETF, importo mensile, giorno di esecuzione, storico dei versamenti, quote, prezzo e rendimento.
- Riepilogo familiare con capitale versato. Il valore complessivo compare solo se tutti i piani hanno una valutazione disponibile.
- Esporta e importa un unico backup di tutte le persone e tutti i piani.
- Cambia l'orizzonte temporale per ogni piano da Impostazioni.

## Se hai già Ginevra PAC installata
1. **Apri la vecchia app e salva un backup JSON** dalla schermata Impostazioni; conservalo in File / iCloud privato.
2. Apri il repository GitHub che già usi. Carica **tutti i file estratti dallo ZIP nella radice dello stesso repository**, sostituendo quelli precedenti: `index.html`, `sw.js`, `manifest.webmanifest`, icone e `.nojekyll`.
3. GitHub Pages pubblicherà la nuova versione allo **stesso indirizzo HTTPS**. Aggiorna la pagina o riapri l'app quando i file nuovi sono online. Se vedi la vecchia schermata, prova a chiuderla e riaprirla: il Service Worker può conservare temporaneamente la vecchia versione.
4. L'app prova a **migrare i dati locali di Ginevra** dalla versione 1.3. Se non compaiono, puoi importare il backup JSON precedente dalla sezione Impostazioni del piano selezionato (viene aggiunto un piano, senza cancellare gli altri).
5. Se vuoi vedere il nuovo nome **PAC Famiglia** sotto l'icona, potrebbe essere necessario rimuovere la vecchia icona dalla Home e aggiungere di nuovo il sito. Prima fai il backup, perché Safari e app installate possono avere dati separati.

## Prima installazione
1. Decomprimi lo ZIP nell'app File di iPhone.
2. Crea un repository **pubblico** gratuito su GitHub, ad esempio `ginevra-pac`. Non caricare file JSON personali sul repository.
3. Carica nella **radice** tutti i file di questa cartella e configura **Settings → Pages → Deploy from a branch → main → / (root)**.
4. Apri `https://TUO-USERNAME.github.io/ginevra-pac/` in **Safari** (non un'anteprima del file HTML).
5. Tocca Condividi → Aggiungi alla schermata Home → Apri come app → Aggiungi.

## Attenzione alla privacy e ai dati
Le persone sono **sezioni dentro la tua app personale**, non account separati protetti da password. Tutti i dati sono salvati su un solo dispositivo/browser, e **non** vengono sincronizzati tra iPhone e iPad. Esporta un backup JSON periodico, specialmente prima degli aggiornamenti. Non pubblicare backup o dati di investimento su GitHub.

Il prezzo automatico dell'ETF è basato su una fonte gratuita non ufficiale. Può essere ritardato o indisponibile; in alternativa inserisci un prezzo manuale. Gli acquisti Trade Republic non vengono verificati né eseguiti dall'app. Le modifiche alle rate vanno effettuate anche su Trade Republic.
