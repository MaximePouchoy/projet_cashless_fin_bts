-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 29 avr. 2024 à 11:42
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `cashless`
--

-- --------------------------------------------------------

--
-- Structure de la table `benevole`
--

CREATE TABLE `benevole` (
  `id` int(11) NOT NULL,
  `id_droits` int(11) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `login` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `benevole`
--

INSERT INTO `benevole` (`id`, `id_droits`, `prenom`, `nom`, `login`, `password`) VALUES
(2, 1, 'bob', 'dubois', 'bob4512', '1234'),
(3, 1, 'greg', 'sapin', 'greg7326', '5678');

-- --------------------------------------------------------

--
-- Structure de la table `carte`
--

CREATE TABLE `carte` (
  `id` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL,
  `pin` varchar(4) NOT NULL,
  `solde` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `carte`
--

INSERT INTO `carte` (`id`, `tag`, `pin`, `solde`) VALUES
(3, '1234', '', 23),
(4, '5678', '', 120.5),
(5, '046C3E6A546080', '', 96);

-- --------------------------------------------------------

--
-- Structure de la table `droits`
--

CREATE TABLE `droits` (
  `id` int(11) NOT NULL,
  `droit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `droits`
--

INSERT INTO `droits` (`id`, `droit`) VALUES
(1, 1),
(2, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Structure de la table `historique`
--

CREATE TABLE `historique` (
  `id` int(11) NOT NULL,
  `id_carte` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `montant` int(11) NOT NULL,
  `date_heure` datetime NOT NULL,
  `id_stand` int(11) NOT NULL,
  `id_benevole` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `historique`
--

INSERT INTO `historique` (`id`, `id_carte`, `id_produit`, `quantite`, `montant`, `date_heure`, `id_stand`, `id_benevole`) VALUES
(1, 5, 1, 2, 4, '2024-03-12 16:01:45', 1, 2),
(2, 5, 1, 2, 4, '2024-03-12 11:15:00', 1, 2);

-- --------------------------------------------------------

--
-- Structure de la table `lesbenevolesdesstands`
--

CREATE TABLE `lesbenevolesdesstands` (
  `id` int(11) NOT NULL,
  `id_benevole` int(11) NOT NULL,
  `id_stand` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lesbenevolesdesstands`
--

INSERT INTO `lesbenevolesdesstands` (`id`, `id_benevole`, `id_stand`, `date`) VALUES
(1, 3, 1, '2024-02-07'),
(2, 2, 1, '2024-03-11');

-- --------------------------------------------------------

--
-- Structure de la table `lesproduitsdesstands`
--

CREATE TABLE `lesproduitsdesstands` (
  `id` int(11) NOT NULL,
  `id_stand` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `stock` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lesproduitsdesstands`
--

INSERT INTO `lesproduitsdesstands` (`id`, `id_stand`, `id_produit`, `stock`) VALUES
(1, 1, 1, 45),
(2, 1, 2, 78),
(3, 1, 5, 38),
(4, 2, 2, 118),
(5, 2, 6, 100),
(6, 3, 1, 75),
(7, 3, 3, 75),
(8, 3, 4, 125),
(9, 3, 5, 115);

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

CREATE TABLE `produit` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prix` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produit`
--

INSERT INTO `produit` (`id`, `nom`, `prix`) VALUES
(1, 'coca cola', 2),
(2, 'biere', 3.5),
(3, 'orangina', 1.5),
(4, 'crepe', 4),
(5, 'gauffre', 4),
(6, 'hotdog', 3);

-- --------------------------------------------------------

--
-- Structure de la table `stand`
--

CREATE TABLE `stand` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stand`
--

INSERT INTO `stand` (`id`, `nom`, `type`) VALUES
(1, 'banananana', ''),
(2, 'stand a hotdog', ''),
(3, 'creperie', '');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `benevole`
--
ALTER TABLE `benevole`
  ADD PRIMARY KEY (`id`),
  ADD KEY `login` (`login`),
  ADD KEY `password` (`password`),
  ADD KEY `id_droits` (`id_droits`);

--
-- Index pour la table `carte`
--
ALTER TABLE `carte`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`tag`) USING BTREE,
  ADD KEY `solde` (`solde`),
  ADD KEY `pin` (`pin`);

--
-- Index pour la table `droits`
--
ALTER TABLE `droits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `droit` (`droit`);

--
-- Index pour la table `historique`
--
ALTER TABLE `historique`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_carte` (`id_carte`),
  ADD KEY `quantite` (`montant`),
  ADD KEY `heure` (`date_heure`),
  ADD KEY `id_stand` (`id_stand`),
  ADD KEY `id_produit` (`id_produit`),
  ADD KEY `id_benevole` (`id_benevole`);

--
-- Index pour la table `lesbenevolesdesstands`
--
ALTER TABLE `lesbenevolesdesstands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_benevole` (`id_benevole`),
  ADD KEY `id_stand` (`id_stand`),
  ADD KEY `date` (`date`);

--
-- Index pour la table `lesproduitsdesstands`
--
ALTER TABLE `lesproduitsdesstands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_stande` (`id_stand`),
  ADD KEY `id_produit` (`id_produit`),
  ADD KEY `stock` (`stock`);

--
-- Index pour la table `produit`
--
ALTER TABLE `produit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nom` (`nom`),
  ADD KEY `prix` (`prix`);

--
-- Index pour la table `stand`
--
ALTER TABLE `stand`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nom` (`nom`),
  ADD KEY `type` (`type`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `benevole`
--
ALTER TABLE `benevole`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `carte`
--
ALTER TABLE `carte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `droits`
--
ALTER TABLE `droits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `historique`
--
ALTER TABLE `historique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `lesbenevolesdesstands`
--
ALTER TABLE `lesbenevolesdesstands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `lesproduitsdesstands`
--
ALTER TABLE `lesproduitsdesstands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `produit`
--
ALTER TABLE `produit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `stand`
--
ALTER TABLE `stand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `benevole`
--
ALTER TABLE `benevole`
  ADD CONSTRAINT `id_droit_ben` FOREIGN KEY (`id_droits`) REFERENCES `droits` (`id`);

--
-- Contraintes pour la table `historique`
--
ALTER TABLE `historique`
  ADD CONSTRAINT `id_benevole_add` FOREIGN KEY (`id_benevole`) REFERENCES `benevole` (`id`),
  ADD CONSTRAINT `id_carte_add` FOREIGN KEY (`id_carte`) REFERENCES `carte` (`id`),
  ADD CONSTRAINT `id_produit_add` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id`),
  ADD CONSTRAINT `id_stand_add` FOREIGN KEY (`id_stand`) REFERENCES `stand` (`id`);

--
-- Contraintes pour la table `lesbenevolesdesstands`
--
ALTER TABLE `lesbenevolesdesstands`
  ADD CONSTRAINT `id_benevole_lbds` FOREIGN KEY (`id_benevole`) REFERENCES `benevole` (`id`),
  ADD CONSTRAINT `id_stand_lbds` FOREIGN KEY (`id_stand`) REFERENCES `stand` (`id`);

--
-- Contraintes pour la table `lesproduitsdesstands`
--
ALTER TABLE `lesproduitsdesstands`
  ADD CONSTRAINT `id_produit_lpds` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id`),
  ADD CONSTRAINT `id_stand_lpds` FOREIGN KEY (`id_stand`) REFERENCES `stand` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
