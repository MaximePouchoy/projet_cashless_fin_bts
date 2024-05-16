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
  resave: true,
  saveUninitialized: true
}));

let tagIDGlobal = '';
let soldeCarte ='';
let nomUtilisateur = '';


router.post('/api/data', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const tagCarte = req.body.TAG;
  const soldeCarte = req.body.MODIF_SOLDE;
        const updateQuery = 'UPDATE carte SET solde = solde + ? WHERE tag = ?';
        connection.execute(updateQuery, [soldeCarte, tagCarte], (err, updateResults) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du solde :', err);
            res.status(500).send('Erreur lors de la mise à jour du solde.');
          } else {
            console.log('Solde de la carte mis à jour avec succès.');
            // Récupérer le nouveau solde de la carte après la mise à jour
            const newQuery = `SELECT solde FROM carte WHERE tag = ?`;
            connection.query(newQuery, [tagCarte], (error, newResults, fields) => {
              if (error) {
                console.error('Erreur lors de la récupération du nouveau solde :', error);
                res.status(500).json({ error: 'Erreur lors de la récupération du nouveau solde.' });
              } else {
                const newSoldeCarte = newResults[0].solde;
                // Renvoyer un JSON avec la confirmation et le nouveau solde de la carte
                res.json({ Resultat: "Solde mis à jour", Carte: tagCarte, NouveauSolde: newSoldeCarte });
              }
            });
          }
        });
});

router.post('/api/connexion', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

   login = req.body.LOGIN;
  const motDePasse = req.body.PASSWORD;

  const query = `SELECT * FROM benevole WHERE login = ? AND password = ?`;
  connection.query(query, [login, motDePasse], (error, results, fields) => {
    if (error) {
      console.error('Erreur lors de la requête à la base de données :', error);
      res.status(500).json({ error: 'Erreur lors de la vérification des identifiants.' });
    } else {
      if (results.length > 0) {
        const droitID = results[0].id_droits;
        res.json({ authentifie: true, id_droit: droitID });
        console.log(login, motDePasse)
      } else {
        res.json({ authentifie: false });
      }
    }
  });
});


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
  // Exécuter une requête SQL pour récupérer tous les stands
  connection.query('SELECT * FROM stand ORDER BY id', (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des stands :', error);
      return res.status(500).send('Erreur lors de la récupération des stands.');
    }

    // Rendre la page "choixStandAdmin" avec les données récupérées
    res.render('choixStandAdmin', { title: 'Projet CashLess', nombreDeStands: results });
  });
});

// Route pour afficher la page de crédit
router.get('/credit', (req, res, next) => {

  res.render('credit', { title: 'Projet CashLess'});

});

router.get('/vente-articles', (req, res, next) => {
  const standId = req.query.stand;
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
    res.render('vente-articles', { title: 'Projet CashLess', produits: results, standId });
  });
});

// Route pour afficher la page de vente des stocks
router.get('/vente-stock', (req, res, next) => {
  const standId = req.query.stand; // Récupère l'ID du stand depuis les paramètres de la requête

  connection.query('SELECT * FROM produit', (error, produits) => {
    if (error) {
      console.error('Erreur lors de la récupération des produits :', error);
      produits = [];
    }

    // Récupérer les produits du stand
    connection.query('SELECT * FROM lesproduitsdesstands WHERE id_stand = ?', [standId], (err, produitsStand) => {
      if (err) {
        console.error('Erreur lors de la récupération des produits du stand :', err);
        produitsStand = [];
      }

      // Récupérer le nom du stand
      connection.query('SELECT nom FROM stand WHERE id = ?', [standId], (err, stand) => {
        if (err) {
          console.error('Erreur lors de la récupération du nom du stand :', err);
          stand = [];
        }

        const nomStand = (stand.length > 0) ? stand[0].nom : '';

        // Passer les produits, les produits du stand et le nom du stand à la vue
        res.render('vente-stock', { title: 'Ajouter un stand', produits, produitsStand, idStand: standId, nomStand: nomStand });
      });
    });
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
  res.render('scancarte', { title: 'Projet CashLess' });
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
  nomUtilisateur = req.session.username;
  res.cookie('monCookie', req.session.username, { maxAge: 900000, httpOnly: true });
  res.redirect('/scancarte');
});

router.post('/connectionBenevole', (req, res) => {
  const { login, mdp } = req.body;

  if (!login || !mdp) {
    return res.send('<script>alert("Veuillez indiquer un nom d\'utilisateur et un mot de passe."); window.location.href = "/";</script>');
  }

  connection.query('SELECT id_droits FROM benevole WHERE login = ? AND password = ?', [login, mdp], (error, results) => {
    if (error) {
      // Gérer les erreurs de la requête SQL
      return res.status(500).send('<script>alert("Erreur lors de l\'authentification. Veuillez réessayer."); window.location.href = "/";</script>');
    }

    if (results.length === 0) {
      return res.send('<script>alert("Identifiants invalides. Veuillez réessayer."); window.location.href = "/";</script>');
    }

    const id_droit = results[0].id_droits;

    if (id_droit === 2) {
      connection.query('SELECT id_stand FROM lesbenevolesdesstands JOIN benevole b ON id_benevole = b.id WHERE b.login = ? AND b.password = ?', [login, mdp], (error, idstand) => {
        if (error) {
          // Gérer les erreurs de la requête SQL
          return res.status(500).send('<script>alert("Erreur lors de la récupération des informations de stand. Veuillez réessayer."); window.location.href = "/";</script>');
        }

        if (idstand.length > 0) {
          // Rediriger avec le paramètre idstand
          res.redirect(`/choixvente?stand=${idstand[0].id_stand}`);
        } else {
          // Gérer le cas où aucun stand n'est associé à ce bénévole
          res.send('<script>alert("Aucun stand associé à ce compte."); window.location.href = "/";</script>');
        }
      });
    } else if (id_droit === 1) {
      res.redirect('/scancarte');
    } else if (id_droit === 3) {
      res.redirect('/pageAdmin');
    }
  });
});


router.get('/pageAdmin', (req, res) => {
  res.render('pageAdmin', { title: 'page Admin CashLess' });
});



router.get('/ajouterBenevole', (req, res) => {
  connection.query('SELECT * FROM stand ORDER BY id', (error, stands) => {
    if (error) {
      console.error('Erreur lors de la récupération des stands :', error);
      res.status(500).send('Erreur lors de la récupération des stands.');
      return;
    }

    res.render('ajouterBenevole', { title: 'Page Admin CashLess', stands });
  });
});

router.post('/creationBenevole', (req, res) => {
  const { droit, nom, login, mdp, prenom, stand } = req.body;

  // Insérer le bénévole dans la table 'benevole'
  connection.query('INSERT INTO benevole (id_droits, nom, prenom, login, password) VALUES (?, ?, ?, ?, ?)', [droit, nom, prenom, login, mdp], (error, benevoleResult) => {
    if (error) {
      console.error('Erreur lors de l\'insertion dans la base de données :', error);
      res.status(500).json({ error: 'Erreur lors de la création du bénévole.' });
    } else {
      console.log('Bénévole inséré avec succès !');

      // Insérer le lien entre le bénévole et le stand dans la table 'lesbenevolesdesstands'
      connection.query('INSERT INTO lesbenevolesdesstands (id_benevole, id_stand) VALUES (?, ?)', [benevoleResult.insertId, stand], (err, linkResult) => {
        if (err) {
          console.error('Erreur lors de l\'insertion dans la table lesbenevolesdesstands :', err);
          res.status(500).json({ error: 'Erreur lors de la création du lien entre le bénévole et le stand.' });
        } else {
          console.log('Lien entre le bénévole et le stand ajouté avec succès !');
          // Rediriger vers la page d'administration
          res.send('<script>alert("Bénévole ajouté avec succès !"); window.location.href = "/pageAdmin";</script>');
        }
      });
    }
  });
});


router.get('/ajouterProduit', (req, res) => {
  res.render('ajouterProduit', { title: 'Ajouter un produit' });
});

router.post('/creerProduit', (req, res) => {
  const { nom, prix } = req.body;
  const query = 'INSERT INTO produit (nom, prix) VALUES (?, ?)';
  connection.query(query, [nom, prix], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'insertion dans la base de données :', error);
      res.status(500).json({ error: 'Erreur lors de la création du produit.' });
    } else {
      console.log('Produit inséré avec succès !');
      res.send('<script>alert("Produit ajouté avec succès !"); window.location.href = "/pageAdmin";</script>');
    }
  });
});

router.get('/ajouterStand', (req, res) => {
  connection.query('SELECT * FROM produit', (error, produits) => {
    if (error) {
      console.error('Erreur lors de la récupération des produits :', error);
      produits = [];
    }
    res.render('ajouterStand', { title: 'Ajouter un stand', produits });
  });
});

router.post('/creerStand', (req, res) => {
  const { nom, produits } = req.body;
  connection.query('INSERT INTO stand (nom) VALUES (?)', [nom], (error, result) => {
    if (error) {
      console.error('Erreur lors de l\'insertion du stand :', error);
      res.status(500).json({ error: 'Erreur lors de la création du stand.' });
    } else {
      const idStand = result.insertId;
      for (const produit of produits) {
        const stock = req.body[`stock_${produit}`]; // Récupérer le stock initial du produit
        connection.query('INSERT INTO lesproduitsdesstands (id_stand, id_produit, stock) VALUES (?, ?, ?)', [idStand, produit, stock], (err, result) => {
          if (err) {
            console.error('Erreur lors de l\'insertion du produit associé au stand :', err);
            res.status(500).json({ error: 'Erreur lors de la création du stand et des produits associés.' });
            return; // Arrête l'exécution en cas d'erreur
          }
        });
      }
      console.log('Stand et produits associés insérés avec succès !');
      res.send('<script>alert(" Stand et produits associés insérés avec succès !"); window.location.href = "/pageAdmin";</script>');

    }
  });
});


router.get('/choixStandAdmin', (req, res) => {
  // Exécuter une requête SQL pour récupérer tous les stands
  connection.query('SELECT * FROM stand ORDER BY id', (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des stands :', error);
      return res.status(500).send('Erreur lors de la récupération des stands.');
    }

    // Rendre la page "choixStandAdmin" avec les données récupérées
    res.render('choixStandAdmin', { title: 'Projet CashLess', nombreDeStands: results });
  });
});

router.get('/ajouterStock', (req, res, next) => {
  const standId = req.query.stand; // Récupère l'ID du stand depuis les paramètres de la requête

  connection.query('SELECT * FROM produit', (error, produits) => {
    if (error) {
      console.error('Erreur lors de la récupération des produits :', error);
      produits = [];
    }

    // Récupérer les produits du stand
    connection.query('SELECT * FROM lesproduitsdesstands WHERE id_stand = ?', [standId], (err, produitsStand) => {
      if (err) {
        console.error('Erreur lors de la récupération des produits du stand :', err);
        produitsStand = [];
      }

      // Récupérer le nom du stand
      connection.query('SELECT nom FROM stand WHERE id = ?', [standId], (err, stand) => {
        if (err) {
          console.error('Erreur lors de la récupération du nom du stand :', err);
          stand = [];
        }

        const nomStand = (stand.length > 0) ? stand[0].nom : '';

        // Passer les produits, les produits du stand et le nom du stand à la vue
        res.render('ajouterStock', { title: 'Ajouter un stand', produits, produitsStand, idStand: standId, nomStand: nomStand });
      });
    });
  });
});


// Express route pour gérer la requête POST du formulaire
router.post('/modifierStock/:idStand', (req, res) => {
  const idStand = req.params.idStand; // Récupère l'ID du stand depuis les paramètres de la requête
  const produits = req.body.produits;

  produits.forEach(produitId => {
    const stock = req.body['stock_' + produitId];

    // Vérifier si le stock est différent de zéro avant de poursuivre
    if (stock !== 0 && stock !== "") {
      // Vérifier si une entrée existe déjà pour ce stand et ce produit
      connection.query('SELECT * FROM lesproduitsdesstands WHERE id_stand = ? AND id_produit = ?', [idStand, produitId], (err, results) => {
        if (err) {
          // Gérer les erreurs de la requête SQL
          return res.status(500).send('Erreur lors de la vérification de l\'existence de l\'entrée dans la base de données');
        }

        if (results.length > 0) {
          // Une entrée existe déjà, effectuer une mise à jour
          connection.query('UPDATE lesproduitsdesstands SET stock = stock + ? WHERE id_stand = ? AND id_produit = ?', [stock, idStand, produitId], (err, updateResult) => {
            if (err) {
              // Gérer les erreurs de la requête SQL
              return res.status(500).send('Erreur lors de la mise à jour de l\'entrée dans la base de données');
            }
          });
        } else {
          // Aucune entrée existante, effectuer une insertion
          connection.query('INSERT INTO lesproduitsdesstands (id_stand, id_produit, stock) VALUES (?, ?, ?)', [idStand, produitId, stock], (err, insertResult) => {
            if (err) {
              // Gérer les erreurs de la requête SQL
              return res.status(500).send('Erreur lors de l\'insertion de l\'entrée dans la base de données');
            }
          });
        }
      });
    }
  });

  res.send('<script>alert("Stock Modifié avec succès !"); window.location.href = "/pageAdmin";</script>');
});

router.post('/stockBenevole/:idStand', (req, res) => {
  const idStand = req.params.idStand; // Récupère l'ID du stand depuis les paramètres de la requête
  const produits = req.body.produits;

  if (!produits) {
    // Vérifier si req.body.produits est défini
    return res.status(400).send("Aucun produit n'a été fourni.");
  }

  produits.forEach(produitId => {
    const stock = req.body['stock_' + produitId];

    // Vérifier si le stock est différent de zéro avant de poursuivre
    if (stock !== 0 && stock !== "") {
      // Vérifier si une entrée existe déjà pour ce stand et ce produit
      connection.query('SELECT * FROM lesproduitsdesstands WHERE id_stand = ? AND id_produit = ?', [idStand, produitId], (err, results) => {
        if (err) {
          // Gérer les erreurs de la requête SQL
          return res.status(500).send("Erreur lors de la vérification de l'existence de l'entrée dans la base de données");
        }

        if (results.length > 0) {
          // Une entrée existe déjà, effectuer une mise à jour
          connection.query('UPDATE lesproduitsdesstands SET stock = stock + ? WHERE id_stand = ? AND id_produit = ?', [stock, idStand, produitId], (err, updateResult) => {
            if (err) {
              // Gérer les erreurs de la requête SQL
              return res.status(500).send("Erreur lors de la mise à jour de l'entrée dans la base de données");
            }
          });
        } else {
          // Aucune entrée existante, effectuer une insertion
          connection.query('INSERT INTO lesproduitsdesstands (id_stand, id_produit, stock) VALUES (?, ?, ?)', [idStand, produitId, stock], (err, insertResult) => {
            if (err) {
              // Gérer les erreurs de la requête SQL
              return res.status(500).send("Erreur lors de l'insertion de l'entrée dans la base de données");
            }
          });
        }
      });
    }
  });

  res.send('<script>alert("Stock modifié avec succès !"); window.location.href = `/choixvente?stand=${idStand}`;</script>');
});

router.get('/choisirBenevole', (req, res) => {
  connection.query('SELECT * FROM benevole ORDER BY nom', (error, benevoles) => {
    if (error) {
      console.error('Erreur lors de la récupération des bénévoles :', error);
      res.status(500).send('Erreur lors de la récupération des bénévoles.');
      return;
    }
    res.render('choisirBenevole', { title: 'Choisir le bénévole à modifier', benevoles });
  });
});


router.get('/modifierBenevole', (req, res) => {
  const benevoleId = req.query.id; // Récupération de l'ID du bénévole depuis la requête
  connection.query('SELECT * FROM benevole WHERE id = ?', [benevoleId], (error, benevole) => {
    connection.query('SELECT * FROM stand ORDER BY id', (error, stands) => {
    if (error || benevole.length === 0) {
      console.error('Erreur lors de la récupération du bénévole :', error);
      res.status(500).send('Erreur lors de la récupération du bénévole.');
      return;
    }
    res.render('modifierBenevole', { title: 'Modifier le bénévole', benevole: benevole[0],stands });
  });
  });
});

router.post('/modifBenevole/:id', (req, res) => {
  const benevoleId = req.params.id; // Récupération de l'ID du bénévole depuis les paramètres de l'URL
  const { nom, prenom, droit, login, mdp, stand } = req.body; // J'ajoute la récupération de la variable stand
  connection.query('UPDATE benevole SET nom = ?, prenom = ?, id_droits = ?, login = ?, password = ? WHERE id = ?', [nom, prenom, droit, login, mdp, benevoleId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la modification du bénévole :', error);
      res.status(500).send('Erreur lors de la modification du bénévole.');
      return;
    }
    // On suppose que benevoleResultId est défini ailleurs dans votre code
    connection.query('INSERT INTO lesbenevolesdesstands (id_benevole, id_stand) VALUES (?, ?)', [benevoleId, stand], (err, linkResult) => {
      if (err) {
        console.error('Erreur lors de l\'ajout du lien entre le bénévole et le stand :', err);
        res.status(500).send('Erreur lors de l\'ajout du lien entre le bénévole et le stand.');
        return;
      }
      res.send('<script>alert("Bénévole modifié avec succès !"); window.location.href = "/pageAdmin";</script>');

    });
  });
});



router.get('/choisirProduit', (req, res) => {
  connection.query('SELECT * FROM produit ORDER BY nom', (error, produits) => {
    if (error) {
      console.error('Erreur lors de la récupération des bénévoles :', error);
      res.status(500).send('Erreur lors de la récupération des bénévoles.');
      return;
    }
    res.render('choisirProduit', { title: 'Choisir le produit à modifier', produits });
  });
});

router.get('/modifierProduit', (req, res) => {
  const produitId = req.query.id; // Utilisation de req.query.id pour récupérer l'ID du produit
  connection.query('SELECT * FROM produit WHERE id = ?', [produitId], (error, produit) => {
    if (error) {
      console.error('Erreur lors de la récupération du produit :', error);
      res.status(500).send('Erreur lors de la récupération du produit.');
      return;
    }
    console.log(produit); // Assurez-vous que le produit est correctement récupéré
    res.render('modifierProduit', { title: 'Modifier le produit', produit:produit[0] });
  });
});


router.post('/modifProduit/:id', (req, res) => {
  const produitId = req.params.id; // Récupération de l'ID du produit depuis les paramètres de l'URL
  const { nom, prix } = req.body; // Récupération des données envoyées via le formulaire

  // Mise à jour du produit dans la base de données
  connection.query(
      'UPDATE produit SET nom = ?, prix = ? WHERE id = ?',
      [nom, prix, produitId],
      (error, results) => {
        if (error) {
          console.error('Erreur lors de la mise à jour du produit :', error);
          res.status(500).send('Erreur lors de la mise à jour du produit.');
          return;
        }
        res.send('<script>alert("Produit modifié avec succès !"); window.location.href = "/pageAdmin";</script>');
      }
  );
});
router.get('/supprimerProduit', (req, res) => {
  connection.query('SELECT * FROM produit ORDER BY nom', (error, produits) => {
    if (error) {
      console.error('Erreur lors de la récupération des bénévoles :', error);
      res.status(500).send('Erreur lors de la récupération des bénévoles.');
      return;
    }
    res.render('supprimerProduit', { title: 'Choisir le produit à modifier', produits });
  });
});

router.post('/supprProduit', (req, res) => {
  const produitId = req.body.id; // Récupération de l'ID du produit depuis les paramètres de l'URL
  console.log(produitId)
  // Suppression du produit dans la base de données
  connection.query('DELETE FROM lesproduitsdesstands WHERE id_produit = ?', [produitId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      res.status(500).send('Erreur lors de la suppression du produit.');
      return;
    }
    connection.query('DELETE FROM produit WHERE id = ?', [produitId], (error, results) => {
      if (error) {
        console.error('Erreur lors de la suppression du produit :', error);
        res.status(500).send('Erreur lors de la suppression du produit.');
        return;
      }
      res.send('<script>alert("Produit supprimé avec succès !"); window.location.href = "/pageAdmin";</script>');
  });
  });
});



router.get('/supprimerBenevole', (req, res) => {
  connection.query('SELECT * FROM benevole ORDER BY nom', (error, benevoles) => {
    if (error) {
      console.error('Erreur lors de la récupération des bénévoles :', error);
      res.status(500).send('Erreur lors de la récupération des bénévoles.');
      return;
    }
    res.render('supprimerBenevole', { title: 'Choisir le bénévole à modifier', benevoles });
  });
});

router.post('/supprBenevole', (req, res) => {
  const benevoleId = req.body.id; // Récupération de l'ID du produit depuis les paramètres de l'URL
  // Suppression du produit dans la base de données
  connection.query('DELETE FROM lesbenevolesdesstands WHERE id_benevole = ?', [benevoleId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la suppression du produit :', error);
      res.status(500).send('Erreur lors de la suppression du produit.');
      return;
    }
    connection.query('DELETE FROM benevole WHERE id = ?', [benevoleId], (error, results) => {
      if (error) {
        console.error('Erreur lors de la suppression du produit :', error);
        res.status(500).send('Erreur lors de la suppression du produit.');
        return;
      }
      res.send('<script>alert("Benevole supprimé avec succès !"); window.location.href = "/pageAdmin";</script>');
    });
  });
});

router.get('/supprimerStand', (req, res) => {
  // Exécuter une requête SQL pour récupérer tous les stands
  connection.query('SELECT * FROM stand ORDER BY id', (error, stands) => {
    if (error) {
      console.error('Erreur lors de la récupération des stands :', error);
      return res.status(500).send('Erreur lors de la récupération des stands.');
    }

    // Rendre la page "choixStandAdmin" avec les données récupérées
    res.render('supprimerSTand', { title: 'Projet CashLess', stands});
  });
});

router.post('/supprStand', (req, res) => {
  console.log(req.body); // Vérifiez le contenu de req.body pour vous assurer que vous récupérez les données correctement
  const standId = req.body.id; // Utilisez le bon nom de l'élément select
  console.log(standId);
  // Suppression du stand dans la base de données
  connection.query('DELETE FROM lesbenevolesdesstands WHERE id_stand = ?', [standId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la suppression du stand :', error);
      res.status(500).send('Erreur lors de la suppression du stand.3');
      return;
    }
    connection.query('DELETE FROM lesproduitsdesstands WHERE id_stand = ?', [standId], (error, results) => {
      if (error) {
        console.error('Erreur lors de la suppression du stand :', error);
        res.status(500).send('Erreur lors de la suppression du stand.3');
        return;
      }
    connection.query('DELETE FROM stand WHERE id = ?', [standId], (error, results) => {
      if (error) {
        console.error('Erreur lors de la suppression du stand 2 :', error);
        res.status(500).send('Erreur lors de la suppression du stand. 4');
        return;
      }
    });
    });res.send('<script>alert("Stand supprimé avec succès !"); window.location.href = "/pageAdmin";</script>');
  });
});

router.post('/commandeBenevole/:standId', (req, res, next) => {
  const standId = req.params.standId; // Récupération de l'ID du stand depuis les paramètres d'URL
  const produits = req.body; // Récupération des données de la commande depuis le formulaire

  // Parcours des produits dans la commande
  Object.keys(produits).forEach(produitKey => {
    // Vérifier si la clé commence par "quantite_" pour s'assurer qu'il s'agit des quantités demandées
    if (produitKey.startsWith('quantite_')) {
      const produitId = produitKey.split('_')[1]; // Récupération de l'ID du produit à partir de la clé
      const quantiteDemandee = produits[produitKey]; // Récupération de la quantité demandée pour ce produit

      // Mettre à jour le stock du stand pour ce produit
      connection.query('UPDATE lesproduitsdesstands SET stock = stock - ? WHERE id_produit = ? AND id_stand = ?', [quantiteDemandee, produits[produitKey], standId], (error, results) => {
        if (error) {
          console.error('Erreur lors de la mise à jour du stock du produit dans le stand :', error);
          res.status(500).send('Erreur lors de la mise à jour du stock du produit dans le stand.');
          return;
        }
      });
    }
  });

  res.send('<script>alert("Commande passée avec succès !"); window.location.href = "/choixvente?stand=' + standId + '";</script>');
});






module.exports = router;






