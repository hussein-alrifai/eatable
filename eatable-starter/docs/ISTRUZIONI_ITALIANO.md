# Eatable v23 — Controlli privacy e sicurezza

Questo ZIP è **solo per la verifica**, non un aggiornamento del sito. **Non caricarlo su GitHub e non modificare le tabelle**.

1. In **Supabase → SQL Editor**, esegui `sql/READ_ONLY_PRIVACY_CHECKS.sql`. Sono cinque interrogazioni **solo lettura** su RLS, policy, riferimenti agli account, Storage e funzioni esposte.
2. Apri Eatable in navigazione in incognito e segui `docs/COOKIE_AUDIT.md`. Registra **solo nomi e durata** di cookie/local storage; non condividere mai valori o token.
3. Per le richieste di cancellazione dati consulta `docs/ACCOUNT_DELETION_RUNBOOK.md`. **Non cancellare semplicemente un utente Auth**: controlla prima ricette pubbliche, foto e riferimenti collegati. Non provare su account reali.
4. Verifica durata di conservazione e fornitori (`docs/RETENTION_AND_PROCESSORS.md`), poi aggiorna le informative inglesi e italiane affinché descrivano la configurazione effettiva.
5. Completa `docs/GO_NO_GO_BETA.md` prima di rimuovere la dicitura di verifica legale.

**Nota:** progetto personale e non commerciale non significa automaticamente esenzione dal GDPR. Le richieste privacy richiedono di norma risposta entro un mese; eventuali proroghe devono rispettare la normativa.
