Daniele Gourmet Pizzeria 

Un'applicazione web moderna e reattiva per "Daniele Gourmet", una pizzeria situata a Salerno. Questo progetto offre un'esperienza utente fluida per la visualizzazione del menu, la prenotazione di tavoli e la gestione interna per lo staff.

 Funzionalità Principali

 Per i Clienti

Menu Digitale Interattivo: Sfoglia il menu completo con foto di alta qualità, descrizioni dettagliate, ingredienti e allergeni.

Prenotazione Intelligente: Prenota un tavolo scegliendo data e ora. Il sistema mostra automaticamente la disponibilità dei posti in tempo reale.

Navigazione Fluida: Un'esperienza utente simile a un'app nativa grazie alla navigazione SPA (Single Page Application).

Responsive Design: Ottimizzato per funzionare perfettamente su desktop, tablet e smartphone.

 Area Staff & Amministrazione

Accesso Sicuro: Login dedicato per lo staff con codice e password.

Dashboard Manager:

Gestione completa delle prenotazioni (conferma, rifiuta, cancella).

Gestione del personale (aggiungi/rimuovi dipendenti e assegna ruoli come Cameriere, Pizzaiolo, Cuoco).

Reset del database ferie.

Gestione Turni: Assegnazione e visualizzazione dei turni settimanali (Pranzo/Cena).

Gestione Ferie: Sistema integrato per richiedere e approvare le ferie, con controllo automatico dei conflitti sui turni.

Tracking Modifiche: Ogni azione sulle prenotazioni viene tracciata (chi ha confermato/cancellato e quando).

 Tecnologie Utilizzate

Frontend: React.js

Stile: Tailwind CSS

Backend & Database: Firebase (Firestore, Authentication)

Icone: Lucide React

Tooling: Vite

 Installazione e Avvio

Clona il repository:

git clone [https://github.com/StanislaoEsposito/StanislaoEsposito.github.io.git](https://github.com/StanislaoEsposito/StanislaoEsposito.github.io.git)
cd StanislaoEsposito.github.io


Installa le dipendenze:

npm install


Configura Firebase:
Il progetto utilizza una configurazione Firebase esistente nel file App.jsx. Per un uso in produzione, si consiglia di spostare le chiavi in un file .env.

Avvia il server di sviluppo:

npm run dev


Build per produzione:

npm run build


 Credenziali Demo (Area Staff)

Per testare le funzionalità amministrative al primo avvio (se il database è vuoto):

Codice: admin

Password: admin
