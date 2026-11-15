import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import '../homePage/home.scss';
import styles from './Vitrine.module.scss';
import Glyph from '../../components/ui/glyphs/Glyph';
import useApparition from './useApparition';
import {
    CARTES, CHIFFRES, CLASSES, FACTIONS, METIERS, MONSTRES,
    iconeSort, imageCarte, imageClasse, paysage,
} from './vitrineContenu';

/* ==========================================================================
   Parallaxe d'ouverture — CONSERVÉE telle quelle (éléments pilotés par id).
   Seuls ajouts : nettoyage de l'écouteur au démontage (il plantait sur les
   autres pages, les ids n'y existant plus) et un vrai <Link> (HashRouter).
   ========================================================================== */
const Parallaxe = () => {
    useEffect(() => {
        const text = document.getElementById('text');
        const bird1 = document.getElementById('bird1');
        const bird2 = document.getElementById('bird2');
        const forest = document.getElementById('forest');
        const btn = document.getElementById('btn');
        const rocks = document.getElementById('rocks');

        const onScroll = () => {
            const value = window.scrollY;
            if (!text) return;
            text.style.top = 40 + value * -0.05 + '%';
            bird1.style.top = value * -1.5 + 'px';
            bird1.style.left = value * 2 + 'px';
            bird2.style.top = value * -1.5 + 'px';
            bird2.style.left = value * -4 + 'px';
            btn.style.marginTop = value * 1.5 + 'px';
            rocks.style.top = value * -0.12 + 'px';
            forest.style.top = value * 0.25 + 'px';
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <section className="parallax">
            <h2 id="text">
                <span> Alcazan Forest - mmorpg medieval </span>
            </h2>
            <img src={require('../../img/bird1.png').default} alt="" id="bird1"/>
            <img src={require('../../img/bird2.png').default} alt="" id="bird2"/>
            <img src={require('../../img/sun.png').default} alt="" id="sun"/>
            <img src={require('../../img/waterfall2.png').default} alt="" id="forest"/>
            <Link to="/inscription" id="btn"><span>S'inscrire</span></Link>
            <img src={require('../../img/rocks1.png').default} alt="" id="rocks"/>
        </section>
    );
};

/* --- Petits éléments réutilisés ------------------------------------------ */

const Ornement = () => (
    <div className={styles.ornement} aria-hidden="true">
        <span/><i/><span/>
    </div>
);

const EnTete = ({surtitre, titre, children, clair = false}) => (
    <header className={`${styles.enTete} ${clair ? styles.enTeteClair : ''}`} data-apparition>
        <span className={styles.surtitre}>{surtitre}</span>
        <h2 className={styles.titre}>{titre}</h2>
        <Ornement/>
        {children && <p className={styles.chapeau}>{children}</p>}
    </header>
);

/* --- 1. Prologue ---------------------------------------------------------- */

const Prologue = () => (
    <div className={styles.prologue}>
        <div className={styles.prologueGrille}>
            <div className={styles.prologueTexte} data-apparition>
                <span className={styles.surtitre}>MMORPG médiéval · gratuit · sur navigateur</span>
                <h1 className={styles.grandTitre}>
                    À l'orée du bois,<br/><em>votre légende commence.</em>
                </h1>
                <p className={styles.paragraphe}>
                    Alcazan Forest est un jeu de rôle en ligne au tour par tour, case après case.
                    Parcourez des provinces peintes à la main, choisissez votre voie, rejoignez une
                    faction et affrontez — seul, en guilde ou en groupe de donjon — ce qui rôde
                    sous les frondaisons.
                </p>
                <div className={styles.actions}>
                    <Link to="/inscription" className={styles.boutonPlein}>Créer mon personnage</Link>
                    <Link to="/guide" className={styles.boutonContour}>
                        <Glyph name="book" size={18}/> Lire le guide
                    </Link>
                </div>
            </div>

            <div className={styles.apercu} data-apparition>
                <div className={styles.apercuCadre}>
                    <img src={imageCarte(3)} alt="La place centrale de Limuren" className={styles.apercuCarte}/>
                    <img src={imageClasse('guerrier', 'masculin')} alt="" className={styles.apercuHeros}/>
                    <div className={styles.apercuCible}>
                        <img src="/img/vitrine/monstres/loup.jpg" alt=""/>
                        <div>
                            <strong>Loup d'Alcazan</strong>
                            <span className={styles.apercuJauge}><i/></span>
                        </div>
                    </div>
                    <div className={styles.apercuLegende}>Limuren — centre</div>
                </div>
            </div>
        </div>

        <ul className={styles.chiffres} data-apparition>
            {CHIFFRES.map(c => (
                <li key={c.libelle}>
                    <strong>{c.valeur}</strong>
                    <span>{c.libelle}</span>
                </li>
            ))}
        </ul>
    </div>
);

/* --- 2. Classes ----------------------------------------------------------- */

const Jauge = ({libelle, valeur}) => (
    <div className={styles.atout}>
        <span>{libelle}</span>
        <span className={styles.atoutPips}>
            {[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= valeur ? styles.pipPlein : ''}/>)}
        </span>
    </div>
);

const Classes = () => {
    const [actif, setActif] = useState(0);
    const [genre, setGenre] = useState('masculin');
    const classe = CLASSES[actif];

    return (
        <div className={styles.classes} id="classes">
            <EnTete surtitre="Les classes" titre="Choisissez votre voie">
                Tout aventurier arrive en gueux, les poings pour seules armes. C'est au fil de la
                quête d'initiation que vous embrassez l'une des quatre voies d'Alcazan.
            </EnTete>

            <div className={styles.classesOnglets} role="tablist" data-apparition>
                {CLASSES.map((c, i) => (
                    <button key={c.id} type="button" role="tab" aria-selected={i === actif}
                            className={`${styles.classeOnglet} ${i === actif ? styles.classeOngletActif : ''}`}
                            style={{'--accent': c.couleur}}
                            onClick={() => setActif(i)}>
                        <img src={imageClasse(c.id, genre)} alt=""/>
                        <span>{c.nom}</span>
                    </button>
                ))}
            </div>

            <div className={styles.classeScene} style={{'--accent': classe.couleur}} data-apparition>
                <div className={styles.classePortrait}>
                    <div className={styles.classeHalo}/>
                    <img key={classe.id + genre} src={imageClasse(classe.id, genre)}
                         alt={`${classe.nom} ${genre}`} className={styles.classeSprite}/>
                    <div className={styles.classeSocle}/>
                    <div className={styles.genres}>
                        {['masculin', 'feminin'].map(g => (
                            <button key={g} type="button" onClick={() => setGenre(g)}
                                    className={g === genre ? styles.genreActif : ''}>
                                {g === 'masculin' ? 'Masculin' : 'Féminin'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.classeFiche} key={classe.id}>
                    <span className={styles.classeRole}>{classe.role}</span>
                    <h3 className={styles.classeNom}>{classe.nom}</h3>
                    <p className={styles.classeDevise}>{classe.devise}</p>
                    <p className={styles.paragraphe}>{classe.description}</p>

                    <div className={styles.atouts}>
                        {Object.entries(classe.atouts).map(([k, v]) => <Jauge key={k} libelle={k} valeur={v}/>)}
                    </div>

                    <div className={styles.caracs}>
                        {classe.caracs.map(c => <span key={c}>{c}</span>)}
                    </div>

                    <h4 className={styles.sousTitre}>Sorts de la voie</h4>
                    <ul className={styles.sorts}>
                        {classe.sorts.map(s => (
                            <li key={s.nom}>
                                <img src={iconeSort(s.icone)} alt=""/>
                                <div>
                                    <strong>{s.nom}</strong>
                                    <span>
                                        {s.portee === 0 ? 'Sur soi' : `Portée ${s.portee}`} · {s.pa} PA
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

/* --- 3. Factions ---------------------------------------------------------- */

const Factions = () => (
    <div className={styles.factions} id="factions" style={{backgroundImage: `url(${paysage('lac')})`}}>
        <div className={styles.factionsVoile}/>
        <div className={styles.contenu}>
            <EnTete surtitre="Les alignements" titre="Trois bannières, un royaume déchiré" clair>
                Votre allégeance ouvre des terres, des quêtes et des guildes — et fait de certains
                joueurs vos alliés, d'autres vos proies.
            </EnTete>

            <div className={styles.factionsGrille}>
                {FACTIONS.map(f => (
                    <article key={f.id} className={styles.faction} style={{'--faction': f.couleur}} data-apparition>
                        <div className={styles.factionBlason}>
                            <img src={f.icone} alt=""/>
                        </div>
                        <h3>{f.nom}</h3>
                        <p className={styles.factionDevise}>{f.devise}</p>
                        <p className={styles.factionLore}>{f.lore}</p>
                        <ul>
                            {f.traits.map(t => <li key={t}>{t}</li>)}
                        </ul>
                    </article>
                ))}
            </div>

            <div className={styles.valeurs} data-apparition>
                <div className={styles.valeur}>
                    <Glyph name="shield" size={30}/>
                    <div>
                        <h4>Honneur</h4>
                        <p>Gagné en terrassant des ennemis à votre mesure, perdu en vous acharnant sur
                            plus faible que vous. Frapper un allié se paie cher.</p>
                    </div>
                </div>
                <div className={styles.valeur}>
                    <Glyph name="luck" size={30}/>
                    <div>
                        <h4>Karma</h4>
                        <p>Chaque choix de quête, chaque récolte mesurée ou pillée déplace votre
                            karma, du pillard au gardien. Le monde s'en souviendra.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/* --- 4. Fonctionnalités ---------------------------------------------------- */

const Chapitre = ({inverse, surtitre, titre, children, visuel}) => (
    <div className={`${styles.chapitre} ${inverse ? styles.chapitreInverse : ''}`} data-apparition>
        <div className={styles.chapitreVisuel}>{visuel}</div>
        <div className={styles.chapitreTexte}>
            <span className={styles.surtitre}>{surtitre}</span>
            <h3 className={styles.chapitreTitre}>{titre}</h3>
            {children}
        </div>
    </div>
);

const Points = ({items}) => (
    <ul className={styles.points}>
        {items.map(i => <li key={i}>{i}</li>)}
    </ul>
);

const Fonctionnalites = () => (
    <div className={styles.fonctionnalites} id="fonctionnalites">
        <div className={styles.contenu}>
            <EnTete surtitre="Le jeu" titre="Ce qui vous attend sous les frondaisons"/>

            <Chapitre surtitre="Exploration" titre="Un monde peint case par case"
                      visuel={(
                          <div className={styles.mosaique}>
                              {CARTES.slice(0, 4).map((c, i) => (
                                  <figure key={c.id} className={styles[`tuile${i}`]}>
                                      <img src={imageCarte(c.id)} alt={c.nom}/>
                                      <figcaption>{c.nom}</figcaption>
                                  </figure>
                              ))}
                          </div>
                      )}>
                <p className={styles.paragraphe}>
                    Des bois de Hal aux canaux de Suncho, des ruelles malfamées de Dunhill au château
                    d'Alastair à Freiwill : chaque carte est une grille de 24 × 16 cases où chaque pas
                    compte. Vos points de mouvement se régénèrent heure après heure — choisissez bien
                    votre chemin.
                </p>
                <Points items={['Plus de 38 cartes reliées par des passages', 'Auberges, cimetières, échoppes et maîtres de métier', 'Cases interactives : coffres, filons, plantes, leviers']}/>
            </Chapitre>

            <Chapitre inverse surtitre="Combat" titre="Des combats tactiques, un bestiaire qui mord"
                      visuel={(
                          <div className={styles.bestiaire}>
                              {MONSTRES.slice(0, 6).map(m => (
                                  <figure key={m.nom}>
                                      <img src={m.image} alt={m.nom}/>
                                      <figcaption>{m.nom}</figcaption>
                                  </figure>
                              ))}
                          </div>
                      )}>
                <p className={styles.paragraphe}>
                    Chaque sort coûte des points d'action et a sa portée : placez-vous, ciblez, frappez.
                    Les monstres ripostent, les boss changent de tactique à mesure qu'ils faiblissent,
                    et la mort vous renvoie au cimetière le plus proche, un peu moins expérimenté.
                </p>
                <Points items={['Sorts d\'attaque, de soin et d\'amélioration', 'Butin, expérience et 200 niveaux', 'PvP entre factions, avec honneur et anti-farm']}/>
            </Chapitre>

            <Chapitre surtitre="Donjons" titre="Le Donjon Scintillant vous attend"
                      visuel={(
                          <div className={styles.donjon}>
                              <img src={imageCarte(11)} alt="Salle du Donjon Scintillant" className={styles.donjonFond}/>
                              <img src="/img/boss/grimbaldAssoiffe.png" alt="Grimbald l'assoiffé" className={styles.donjonBoss}/>
                              <div className={styles.donjonCartouche}>
                                  <strong>Grimbald l'assoiffé</strong>
                                  <span>Gardien de la cache scintillante</span>
                              </div>
                          </div>
                      )}>
                <p className={styles.paragraphe}>
                    Formez un groupe de cinq, franchissez les salles une à une et affrontez un boss
                    qui ne pardonne rien : zones télégraphiées à esquiver, renforts à contenir,
                    leviers à actionner ensemble, enrage si vous traînez. Votre expédition vous
                    attend jusqu'au prochain reset quotidien.
                </p>
                <Points items={['Instances privées pour votre groupe', 'Mécaniques de boss par phases de vie', 'Salle au trésor pour les vainqueurs']}/>
            </Chapitre>

            <Chapitre inverse surtitre="Artisanat" titre="Récoltez, fabriquez, prospérez"
                      visuel={(
                          <div className={styles.artisanat} style={{backgroundImage: `url(${paysage('cascade')})`}}>
                              <div className={styles.artisanatColonne}>
                                  <h4>Récolte</h4>
                                  {METIERS.recolte.map(m => <span key={m}>{m}</span>)}
                              </div>
                              <div className={styles.artisanatColonne}>
                                  <h4>Fabrication</h4>
                                  {METIERS.fabrication.map(m => <span key={m}>{m}</span>)}
                              </div>
                          </div>
                      )}>
                <p className={styles.paragraphe}>
                    Apprenez jusqu'à deux métiers de récolte et trois de fabrication auprès des maîtres
                    artisans. Récolte mesurée ou intensive — au détriment des autres et de votre karma —,
                    fabrication rapide ou soignée, recyclage : à vous de choisir quel artisan vous serez.
                </p>
                <Points items={['11 métiers, progression par niveaux', 'Recettes, file de fabrication, recyclage', 'Dépeçage des créatures abattues']}/>
            </Chapitre>

            <div className={styles.cartesSociales}>
                {[
                    {glyph: 'clock', titre: 'Hôtel des ventes', texte: 'Mettez vos lots en vente 48 h et laissez le marché travailler pendant que vous explorez.'},
                    {glyph: 'strength', titre: 'Échanges', texte: 'Négociez en direct avec un autre joueur : chacun confirme, le transfert est garanti.'},
                    {glyph: 'shield', titre: 'Guildes', texte: 'Fondez une baronnie, recrutez, promouvez vos officiers et portez haut les couleurs de votre faction.'},
                    {glyph: 'target', titre: 'Classements', texte: 'Expérience, monstres terrassés, boss vaincus, richesse, honneur : prenez votre place au sommet.'},
                ].map(c => (
                    <article key={c.titre} className={styles.carteSociale} data-apparition>
                        <span className={styles.carteSocialeIcone}><Glyph name={c.glyph} size={26}/></span>
                        <h4>{c.titre}</h4>
                        <p>{c.texte}</p>
                    </article>
                ))}
            </div>
        </div>
    </div>
);

/* --- 5. Le monde (galerie) ------------------------------------------------- */

const Monde = () => (
    <div className={styles.monde} id="monde">
        <EnTete surtitre="Le monde" titre="Des provinces à parcourir">
            Limuren, Suncho, Dunhill, Freiwill… et bien d'autres terres encore à dessiner.
        </EnTete>
        <div className={styles.galerie} data-apparition>
            {CARTES.map(c => (
                <figure key={c.id}>
                    <img src={imageCarte(c.id)} alt={c.nom} loading="lazy"/>
                    <figcaption>{c.nom}</figcaption>
                </figure>
            ))}
        </div>
    </div>
);

/* --- 6. Appel final -------------------------------------------------------- */

const AppelFinal = () => (
    <div className={styles.appel} style={{backgroundImage: `url(${paysage('crepuscule')})`}}>
        <div className={styles.appelVoile}/>
        <img src="/img/vitrine/dragon.png" alt="" className={styles.appelDragon}/>
        <div className={styles.appelTexte} data-apparition>
            <span className={styles.surtitre}>Gratuit · sans téléchargement</span>
            <h2 className={styles.grandTitre}>La forêt n'attend que vous.</h2>
            <p className={styles.paragraphe}>
                Créez votre personnage en une minute, suivez le tutoriel du bois et faites vos
                premiers pas dans Alcazan.
            </p>
            <div className={styles.actions}>
                <Link to="/inscription" className={styles.boutonPlein}>Rejoindre l'aventure</Link>
                <Link to="/connexion" className={styles.boutonContour}>J'ai déjà un compte</Link>
            </div>
        </div>
    </div>
);

const HomePage = () => {
    useApparition();
    return (
        <div className="homepage">
            <Parallaxe/>
            <div className={styles.vitrine}>
                <Prologue/>
                <Classes/>
                <Factions/>
                <Fonctionnalites/>
                <Monde/>
                <AppelFinal/>
            </div>
        </div>
    );
};

export default HomePage;
