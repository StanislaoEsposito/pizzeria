<div align="center">


  <br><br>

  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=35&pause=1000&color=D93025&center=true&vCenter=true&width=600&lines=Daniele+Gourmet+WebApp;Powered+by+React+%26+Firebase!" alt="Typing SVG" />
  </a>

  <br>

  <h3><i>"Digitalizzare l'esperienza della vera pizza a Salerno"</i> 🍕🍷🇮🇹</h3>

  <br>

  <img src="https://img.shields.io/badge/React_v18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Lucide_Icons-F7DF1E?style=for-the-badge&logo=lucide&logoColor=black&labelColor=white" />

</div>

<hr>

## 📋 𝐈𝐧𝐭𝐫𝐨𝐝𝐮𝐳𝐢𝐨𝐧𝐞

Il progetto **Daniele Gourmet** nasce per modernizzare la gestione di una rinomata pizzeria di Salerno. 
L'obiettivo era duplice: offrire ai clienti un modo rapido per prenotare ed esplorare il menu, e fornire allo staff uno strumento potente per gestire turni e prenotazioni.

L'applicazione è una **Single Page Application (SPA)** moderna: garantisce fluidità e reattività senza i ricaricamenti di pagina tipici dei siti tradizionali, grazie a un routing personalizzato basato sulla History API.

---

## 🏗️ 𝐀𝐫𝐜𝐡𝐢𝐭𝐞𝐭𝐭𝐮𝐫𝐚 𝐞 𝐓𝐞𝐜𝐧𝐨𝐥𝐨𝐠𝐢𝐞

Abbiamo scelto uno stack **Serverless** e moderno per garantire performance e scalabilità:

| Area | Tecnologia | Descrizione |
| :--- | :--- | :--- |
| **Frontend** | **React.js (v18+)** | Componenti riutilizzabili e gestione dello stato efficiente. |
| **Styling** | **Tailwind CSS** | Design system utility-first completamente responsive (Mobile/Tablet/PC). |
| **Build Tool** | **Vite** | Compilazione istantanea e ottimizzazione per la produzione. |
| **Backend** | **Firebase** | Soluzione BaaS (Backend-as-a-Service) di Google. |
| **Database** | **Firestore** | DB NoSQL in tempo reale per prenotazioni, turni e utenti. |
| **Auth** | **Firebase Auth** | Gestione sicura degli accessi per lo staff. |

---

## 🚀 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐚𝐥𝐢𝐭à

### 🟢 Lato Cliente (Pubblico)
Un'esperienza utente fluida e intuitiva per i clienti della pizzeria.

* 🍕 **Menu Digitale:** Esplorazione per categorie (Antipasti, Tradizione, Gourmet, Dolci). Schede dettagliate con foto HD, ingredienti e allergeni.
* 📅 **Prenotazione Smart:**
    * Il sistema calcola la **disponibilità in tempo reale**.
    * *Logica Anti-Overbooking:* Se rimangono 2 posti alle 20:30, il sistema impedisce prenotazioni per 4 persone.
* 📍 **Info & Contatti:** Integrazione mappe e orari.

### 🔴 Lato Staff (Area Riservata)
Accesso tramite *Codice Staff* e Password. L'interfaccia si adatta dinamicamente al ruolo (**Manager, Cameriere, Pizzaiolo, Cuoco**).

* 📖 **Gestione Prenotazioni (Agenda):**
    * Vista live delle prenotazioni (In Attesa, Confermate, Cancellate).
    * **Firma Digitale:** Ogni conferma/rifiuto è tracciata ("Confermata da Mario il...").
    * Inserimento manuale per prenotazioni telefoniche (con controlli di capienza).
* 🗓️ **Gestione Turni:**
    * Calendario settimanale con assegnazione turni (Pranzo/Cena).
    * **Controllo Conflitti:** Alert automatico se si assegna un turno a chi è in ferie.
* 🏖️ **Gestione Ferie:** Workflow di richiesta (Dipendente) e approvazione (Manager).
* 👥 **User Management:** Pannello Manager per creare account e assegnare ruoli.

---

## 📸 𝐒𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭

| Home & Benvenuto | Menu & Ordini | Area Staff |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/7c8d1fd7-f4c2-4ccb-b09b-dc7d3340729f" width="280" /> | <img src="https://github.com/user-attachments/assets/cdcd313f-5a62-4ebc-943f-063f1a58176a" width="280" /> | <img src="https://github.com/user-attachments/assets/e8df53aa-c16c-4f80-ba0f-07ca5bbaad25" width="280" /> |


---

## 🛠️ 𝐂𝐨𝐦𝐞 𝐄𝐬𝐞𝐠𝐮𝐢𝐫𝐞 𝐢𝐥 𝐏𝐫𝐨𝐠𝐞𝐭𝐭𝐨

Il progetto è stato sviluppato localmente su ambiente **Node.js** e versionato tramite **Git** e **GitHub**.

1.  **Clona la repository:**
    ```bash
    git clone [https://github.com/TuoUsername/daniele-gourmet.git](https://github.com/TuoUsername/daniele-gourmet.git)
    cd daniele-gourmet
    ```

2.  **Installa le dipendenze:**
    ```bash
    npm install
    ```

3.  **Configurazione Firebase:**
    * Crea un file `.env` o `firebaseConfig.js`.
    * Inserisci le tue API Key di Firebase Firestore/Auth.

4.  **Avvia il server di sviluppo:**
    ```bash
    npm run dev
    ```

---

<div align="center">
  
  ### 📬 Contatti & Sviluppo
  
  <a href="https://github.com/StanislaoEsposito">
    <img src="https://img.shields.io/badge/GitHub-Profile-100000?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="mailto:stanislaoesposito25@gmail.com">
    <img src="https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>

  <br><br>
  
  ![Visitor Badge](https://visitor-badge.laobi.icu/badge?page_id=DanieleGourmet.app)
  
  <br>


</div>
