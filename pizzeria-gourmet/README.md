# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Daniele Gourmet Pizzeria 🍕

Web application moderna sviluppata con React, Tailwind CSS e Firebase per la pizzeria "Daniele Gourmet".

🌟 Funzionalità Implementate

🍽️ Catalogo & Menu Digitale

Menu Completo: Include Antipasti, Pizze della Tradizione, Pizze Gourmet, Dolci e Bevande (dati reali da TheFork).

Schede Dettaglio: Ogni prodotto ha una vista dedicata con foto, descrizione, lista ingredienti e allergeni.

Navigazione Fluid: Implementazione personalizzata della History API del browser. L'URL cambia dinamicamente (?tab=menu) e il tasto "Indietro" del browser funziona come in una vera multipagina.

📅 Prenotazioni Smart

Modulo di prenotazione tavoli integrato con Firebase Firestore.

Salvataggio dati in tempo reale (Nome, Ospiti, Data/Ora, Note).

🔐 Area Staff & Amministrazione

Login Dipendenti: Accesso tramite Codice Staff e Password.

Pannello di Controllo:

Visualizzazione di tutte le prenotazioni in arrivo.

Gestione stati: Conferma, Rifiuta o Cancella prenotazioni.

Gestione Utenti (Solo Manager):

Il ruolo "Manager" può creare nuovi account per lo staff o eliminare quelli esistenti.

Ruoli supportati: waiter (cameriere) e manager.

🛠️ Tecnologie Utilizzate

Frontend: React 18, Vite

Styling: Tailwind CSS

Backend as a Service: Firebase (Authentication, Firestore Database)

Icone: Lucide React

🚀 Istruzioni per l'Installazione

Clona il repository:

git clone <tuo-repo-url>


Installa le dipendenze:

npm install


Configurazione Firebase:
Il progetto è già configurato con le chiavi API nel file App.jsx. Per produzione, si consiglia di spostarle in un file .env.

Avvia il server di sviluppo:

npm run dev


🔑 Credenziali di Accesso (Primo Avvio)

Poiché il database è inizialmente vuoto, è stato implementato un Master Login di emergenza per permetterti di accedere e creare i primi utenti reali:

Codice Staff: admin

Password: admin

Una volta effettuato l'accesso come Master Admin, vai nella sezione "Utenti" e crea il tuo primo account Manager personale.

Progetto sviluppato per esercitazione React + Firebase.