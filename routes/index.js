const express = require('express');
const mysql = require("mysql2");
const router = express.Router();
const session = require('express-session');
// Connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cashless'
});

// Middleware pour parser les requêtes JSON
router.use(express.json());
router.use(session({
  secret: 'votre_secret_key',
  resave: false,
  saveUninitialized: true
}));

let tagIDGlobal = '';
let soldeCarte ='';
let nomUtilisateur = '';

router.post('/api/data', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const tagID = req.body.TAG_ID;
  const userId = req.body.USER_ID;
  const username = req.session.username
  // Vérifier si le USER_ID de la requête JSON correspond au nom d'utilisateur de la session
  if (userId === username) {
    // Récupérer le tag ID du JSON reçu
    tagIDGlobal = tagID;
    nomUtilisateur = userId;
    console.log('Tag ID reçu :', tagID);

    // Effectuer une requête à la base de données pour récupérer les informations de la carte
    const query = `SELECT solde FROM carte WHERE tag = ?`;
    connection.query(query, [tagID], (error, results, fields) => {
      if (error) {
        console.error('Erreur lors de la requête à la base de données :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des informations de la carte.' });
      } else {
        if (results.length > 0) {
          // Récupérer les informations de la carte
          const numero = tagID;
          const solde = results[0].solde;
          soldeCarte = results[0].solde;
          console.log('Informations de la carte :\nNumero de carte : ', numero, '\nSolde de la carte : ', solde, 'euro');
          // Renvoyer un JSON avec les informations de la carte
          res.json({ numeroCarte: numero, soldeCarte: solde });
        } else {
          // Aucune carte trouvée avec ce numéro
          res.status(404).json({ error: 'Aucune carte trouvée avec ce numéro.' });
        }
      }
    });
  } else {
    // Si le USER_ID ne correspond pas au nom d'utilisateur de la session, renvoyer une erreur
    res.status(403).json({ error: 'Accès non autorisé.' });
  }
});




// // Route pour gérer les requêtes POST pour le crédit
// router.post('/credit', (req, res) => {
//   // Logique pour traiter les données JSON reçues
//   const jsonData = req.body;
//   console.log(jsonData);
//
//   // Renvoie le numéro de carte reçu en réponse
//   res.send(jsonData.numeroCarte);
//
//   // Mettre à jour le champ "Numéro de carte"
//
//   updateCardNumber(jsonData)
// });

// Route pour afficher la page d'accueil
router.get('/', (req, res, next) => {
  // Exécute une requête SQL pour récupérer les produits
  connection.query('SELECT * FROM produit', (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.render('index', { produits: [], title: 'Cashless' });
    } else {
      console.log('Résultats de la requête :', results);
      res.render('index', { produits: results || [], title: 'Cashless' });

    }
  });
});

router.post('/crediter', (req, res, next) => {
  let montant = req.body.montantCrediter;
  let numeroTag = req.body.numeroCarte;

  // Requête paramétrée pour mettre à jour le solde de la carte
  const updateQuery = 'UPDATE carte SET solde = solde + ? WHERE tag = ?';
  connection.execute(updateQuery, [montant, numeroTag], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du solde :', err);
      res.status(500).send('Erreur lors de la mise à jour du solde.');      
    } else {
      console.log('Solde de la carte mis à jour avec succès.');
      res.render('scancarte', { title: 'Projet CashLess' });
    }
  });
});

// Route pour afficher la page de vente
router.get('/vente', (req, res, next) => {
  // Exécute une requête SQL pour récupérer le nombre de stands
  connection.query('SELECT * FROM stand ORDER BY id', (error, results) => {
    if (error) {
      throw error;
    }
    // Récupère le nombre de stands
    const nombreDeStands = results[0].nombre_de_stands;
    // Rend la page "vente" avec le nombre de stands comme variable
    res.render('vente', { title: 'Projet CashLess', nombreDeStands: results });
    console.log('Résultats de la requête :', results.length );
    console.log('Résultats de la requête :'  + results[0].nom);
  });
});

// Route pour afficher la page de crédit
router.get('/credit', (req, res, next) => {
  const userId = req.session.username;

  const nouveauSolde = soldeCarte; // Récupérez le solde de la carte de la base de données ou d'où vous le stockez

  if (userId === nomUtilisateur) {
    console.log(tagIDGlobal);
    res.render('credit', { title: 'Projet CashLess', tagId: tagIDGlobal, nouveauSolde: nouveauSolde });
  } else {
    res.status(403).send('Accès non autorisé');
  }
});

router.get('/vente-articles', (req, res, next) => {
  // Exécute une requête SQL pour récupérer les produits avec leur prix et leur stock
  const query = `
    SELECT lesproduitsdesstands.id_produit, lesproduitsdesstands.stock, produit.nom, produit.prix 
    FROM lesproduitsdesstands 
    JOIN produit ON lesproduitsdesstands.id_produit = produit.id
    WHERE lesproduitsdesstands.id_stand = ?
  `;
  connection.query(query, [req.query.stand], (error, results) => {
    if (error) {
      throw error;
    }
    // Rend la page "vente-articles" avec les données récupérées
    res.render('vente-articles', { title: 'Projet CashLess', produits: results });
  });
});

// Route pour afficher la page de vente des stocks
router.get('/vente-stock', (req, res, next) => {
  // Exécute une requête SQL pour récupérer les produits avec leur prix et leur stock
  const query = `
    SELECT lesproduitsdesstands.id_produit, lesproduitsdesstands.stock, produit.nom, produit.prix 
    FROM lesproduitsdesstands 
    JOIN produit ON lesproduitsdesstands.id_produit = produit.id
    WHERE lesproduitsdesstands.id_stand = ?
  `;
  connection.query(query, [req.query.stand], (error, results) => {
    if (error) {
      throw error;
    }
    // Rend la page "vente-articles" avec les données récupérées
    res.render('vente-stock', { title: 'Projet CashLess', produits: results });
  });
});

// Route pour afficher la page de choix de vente
router.get('/choixvente', (req, res, next) => {
  // Exécute une requête SQL pour récupérer le nom du stand à partir de son ID
  const standId = req.query.stand;
  connection.query('SELECT nom FROM stand WHERE id = ?', [standId], (error, results) => {
    if (error) {
      throw error;
    }
    if (results.length > 0) {
      const standNom = results[0].nom;
      // Rend la page "choixvente" avec le nom du stand
      res.render('choixvente', { title: 'Projet CashLess', nomStand: standNom, id: standId });
    } else {
      // Aucun stand trouvé avec cet ID
      res.status(404).send('Aucun stand trouvé avec cet ID.');
    }
  });
});
router.get('/scancarte', (req, res) => {
  console.log("Scancarte <- ");
  tagIDGlobal = null;
  soldeCarte = null;
  const username = req.session.username;
  console.log("Scancarte : " + username)
  res.render('scancarte', { title: 'Projet CashLess', username: username });

});


router.get('/identification', (req, res) => {
  res.render('identification', { title: 'Projet CashLess' });
});
router.post('/createSession', (req, res) => {
  console.log(req.body);
  const username = req.body.utilisateur;
  console.log(username);
  req.session.username = username;
  console.log("session crée");
  console.log(req.session.username)
  res.redirect('/scancarte');
});

module.exports = router;
