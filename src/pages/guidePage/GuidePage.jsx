import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import styles from './GuidePage.module.scss';
import Glyph from '../../components/ui/glyphs/Glyph';
import useApparition from '../homePage/useApparition';
import {CLASSES, FACTIONS, MONSTRES, imageCarte, imageClasse, paysage} from '../homePage/vitrineContenu';

/**
 * Guide du joueur — page PUBLIQUE (aucun appel API).
 * Les chiffres cités sont ceux du code au 15/11/2026 (PostRegisterSubscriber, PvpConfig,
 * HotelVenteConfig, ArtisanatConfig, CraftConfig, DeathService, régénération du scheduler).
 * Si une règle change côté back, mettre ce texte à jour.
 */

const CHAPITRES = [
    {id: 'premiers-pas', titre: 'Premiers pas', glyph: 'bolt'},
    {id: 'interface', titre: "L'interface", glyph: 'wisdom'},
    {id: 'deplacement', titre: 'Se déplacer', glyph: 'boots'},
    {id: 'combat', titre: 'Combattre', glyph: 'sword'},
    {id: 'progression', titre: 'Progresser', glyph: 'strength'},
    {id: 'equipement', titre: 'Équipement', glyph: 'chest'},
    {id: 'quetes', titre: 'Quêtes & karma', glyph: 'book'},
    {id: 'classes', titre: 'Les classes', glyph: 'helmet'},
    {id: 'factions', titre: 'Factions & PvP', glyph: 'shield'},
    {id: 'donjons', titre: 'Donjons', glyph: 'target'},
    {id: 'artisanat', titre: 'Artisanat', glyph: 'gloves'},
    {id: 'economie', titre: 'Économie', glyph: 'amulet'},
    {id: 'guildes', titre: 'Guildes & social', glyph: 'heart'},
    {id: 'astuces', titre: 'Astuces', glyph: 'luck'},
];

const Encart = ({type = 'astuce', titre, children}) => (
    <aside className={`${styles.encart} ${styles[type]}`}>
        <span className={styles.encartIcone}>
            <Glyph name={type === 'attention' ? 'bolt' : type === 'regle' ? 'book' : 'luck'} size={20}/>
        </span>
        <div>
            <span className={styles.encartTitre}>
                {titre || (type === 'attention' ? 'Attention' : type === 'regle' ? 'Règle' : 'Astuce')}
            </span>
            <div>{children}</div>
        </div>
    </aside>
);

const Touche = ({children}) => <kbd className={styles.touche}>{children}</kbd>;

const Chapitre = ({id, numero, titre, illustration, children}) => (
    <section id={id} className={styles.chapitre} data-apparition>
        <header className={styles.chapitreEnTete}>
            <span className={styles.numero}>{String(numero).padStart(2, '0')}</span>
            <h2>{titre}</h2>
        </header>
        {illustration && <div className={styles.illustration}>{illustration}</div>}
        <div className={styles.corps}>{children}</div>
    </section>
);

const Tableau = ({colonnes, lignes}) => (
    <div className={styles.tableauConteneur}>
        <table className={styles.tableau}>
            <thead>
            <tr>{colonnes.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
            {lignes.map((l, i) => (
                <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>
            ))}
            </tbody>
        </table>
    </div>
);

const useChapitreActif = () => {
    const [actif, setActif] = useState(CHAPITRES[0].id);
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return undefined;
        const observateur = new IntersectionObserver((entrees) => {
            const visibles = entrees.filter(e => e.isIntersecting);
            if (visibles.length) {
                visibles.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                setActif(visibles[0].target.id);
            }
        }, {rootMargin: '-20% 0px -65% 0px'});
        CHAPITRES.forEach(c => {
            const el = document.getElementById(c.id);
            if (el) observateur.observe(el);
        });
        return () => observateur.disconnect();
    }, []);
    return actif;
};

const GuidePage = () => {
    useApparition();
    const actif = useChapitreActif();

    // HashRouter : une ancre `#id` changerait de route — on défile à la main.
    const allerA = (event, id) => {
        event.preventDefault();
        const el = document.getElementById(id);
        if (el) window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth'});
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.guide}>
            <div className={styles.banniere} style={{backgroundImage: `url(${paysage('sylve')})`}}>
                <div className={styles.banniereVoile}/>
                <div className={styles.banniereTexte}>
                    <span className={styles.surtitre}>Le grimoire de l'aventurier</span>
                    <h1>Guide du joueur</h1>
                    <p>Tout ce qu'il faut savoir pour survivre — et prospérer — dans la forêt d'Alcazan.</p>
                </div>
                <div className={styles.banniereHeros}>
                    {['archer_feminin', 'guerrier_masculin', 'sorcier_feminin', 'moine_masculin'].map(n => (
                        <img key={n} src={`/img/vitrine/classes/${n}.png`} alt=""/>
                    ))}
                </div>
            </div>

            <div className={styles.disposition}>
                <nav className={styles.sommaire} aria-label="Sommaire du guide">
                    <span className={styles.sommaireTitre}>Sommaire</span>
                    <ol>
                        {CHAPITRES.map((c, i) => (
                            <li key={c.id}>
                                <a href={`#${c.id}`} onClick={(e) => allerA(e, c.id)}
                                   className={actif === c.id ? styles.sommaireActif : ''}>
                                    <Glyph name={c.glyph} size={16}/>
                                    <span>{c.titre}</span>
                                </a>
                            </li>
                        ))}
                    </ol>
                    <Link to="/inscription" className={styles.sommaireBouton}>Créer mon personnage</Link>
                </nav>

                <article className={styles.contenu}>

                    <Chapitre id="premiers-pas" numero={1} titre="Premiers pas"
                              illustration={<img src={imageCarte(3)} alt="Limuren" className={styles.imageCarte}/>}>
                        <p>
                            Créez un compte depuis <Link to="/inscription">l'inscription</Link> : votre
                            personnage apparaît aussitôt dans le <strong>Tutoriel Boisé</strong>, avec
                            400 points de vie, 10 pièces d'or et un sac de 100 emplacements.
                        </p>
                        <ol className={styles.etapes}>
                            <li><strong>Suivez le guide du bois.</strong> Un PNJ vous accueille et vous apprend à
                                vous déplacer, parler et combattre.</li>
                            <li><strong>Choisissez votre classe.</strong> Vous commencez <em>gueux</em>, à mains
                                nues. La quête d'initiation vous fait choisir entre guerrier, archer,
                                sorcier et moine — avec l'équipement de départ qui va avec.</li>
                            <li><strong>Gagnez Limuren.</strong> Première ville, premières échoppes, premières
                                quêtes : le monde s'ouvre à vous.</li>
                        </ol>
                        <Encart>
                            Le choix de classe est définitif pour un personnage : prenez le temps de lire
                            la section <a href="#classes" onClick={(e) => allerA(e, 'classes')}>Les classes</a>.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="interface" numero={2} titre="L'interface">
                        <p>Quatre jauges règlent votre journée d'aventurier :</p>
                        <div className={styles.jauges}>
                            <div className={styles.jauge} style={{'--de': 'var(--hp-from)', '--a': 'var(--hp-to)'}}>
                                <span>PV</span><i/><p>Vos points de vie. À zéro, c'est le cimetière.</p>
                            </div>
                            <div className={styles.jauge} style={{'--de': 'var(--xp-from)', '--a': 'var(--pa-label)'}}>
                                <span>PA</span><i/><p>Points d'action (600 max) : chaque sort en coûte.</p>
                            </div>
                            <div className={styles.jauge} style={{'--de': 'var(--mp-from)', '--a': 'var(--mp-to)'}}>
                                <span>PM</span><i/><p>Points de mouvement (800 max) : une case, un PM.</p>
                            </div>
                            <div className={styles.jauge} style={{'--de': 'var(--xp-from)', '--a': 'var(--xp-to)'}}>
                                <span>XP</span><i/><p>Votre expérience vers le niveau suivant.</p>
                            </div>
                        </div>
                        <p>
                            Le menu latéral ouvre l'inventaire, le profil, le journal, la guilde,
                            l'artisanat, l'hôtel des ventes et le classement. La barre de sorts, en bas,
                            accueille vos sorts et consommables.
                        </p>
                        <Encart type="regle" titre="Régénération">
                            Toutes les heures, vous regagnez <strong>+10 PA</strong> et <strong>+20 PM</strong>,
                            dans la limite de 600 PA et 800 PM. Une journée bien remplie se planifie !
                        </Encart>
                    </Chapitre>

                    <Chapitre id="deplacement" numero={3} titre="Se déplacer">
                        <p>
                            Chaque carte est une grille de 24 × 16 cases. Cliquez sur une case voisine ou
                            utilisez le clavier : <Touche>Z</Touche> <Touche>Q</Touche> <Touche>S</Touche> <Touche>D</Touche>.
                            Chaque pas coûte <strong>1 PM</strong> ; le décor, les PNJ et les cases occupées
                            bloquent le passage.
                        </p>
                        <p>
                            Les <strong>passages</strong>, au bord des cartes ou devant les portes, vous
                            mènent d'une carte à l'autre. Certains sont gardés : niveau minimum, alignement,
                            quête terminée ou boss vaincu récemment.
                        </p>
                        <Encart>
                            Un clic sur un passage qui ne fait rien ? Lisez le message affiché : il vous
                            dit ce qu'il vous manque pour le franchir.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="combat" numero={4} titre="Combattre"
                              illustration={(
                                  <div className={styles.monstres}>
                                      {MONSTRES.slice(0, 4).map(m => (
                                          <figure key={m.nom}><img src={m.image} alt={m.nom}/><figcaption>{m.nom}</figcaption></figure>
                                      ))}
                                  </div>
                              )}>
                        <p>
                            Les monstres se tapissent dans les cases de la carte : <strong>marchez sur leur
                            case</strong> pour les cibler. Pour un joueur ou un boss, cliquez dessus. Lancez
                            ensuite un sort depuis votre barre : il coûte des PA et exige que la cible soit
                            à <strong>portée</strong> (en cases).
                        </p>
                        <Tableau
                            colonnes={['Type de sort', 'Effet']}
                            lignes={[
                                ['Attaque', 'Inflige des dégâts selon vos caractéristiques et celles du sort.'],
                                ['Soin', 'Rend des points de vie, à vous ou à un allié.'],
                                ['Amélioration', 'Un bonus temporaire de caractéristique (3 au plus en même temps).'],
                            ]}/>
                        <p>
                            Un monstre riposte à chaque coup. Abattu, il rapporte de l'expérience et parfois
                            du butin. Un boss, lui, change de sortilège à mesure que sa vie baisse.
                        </p>
                        <Encart type="attention" titre="La mort">
                            Tomber au combat coûte <strong>9 % de l'expérience</strong> de votre niveau et
                            vous renvoie au cimetière le plus proche, PV restaurés. Vous restez quelques
                            secondes groggy avant de pouvoir agir.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="progression" numero={5} titre="Progresser">
                        <p>
                            L'expérience fait monter votre niveau, jusqu'au <strong>niveau 200</strong>. Chaque
                            niveau vous donne <strong>5 points</strong> de caractéristiques à répartir depuis
                            votre profil.
                        </p>
                        <Tableau
                            colonnes={['Caractéristique', 'À quoi elle sert']}
                            lignes={[
                                ['Constitution', 'Vos PV max : 400 + 5 par point + 8 par niveau.'],
                                ['Force', 'Coups du guerrier, flèche empoisonnée de l\'archer.'],
                                ['Dextérité', 'Tirs de l\'archer, complément du guerrier.'],
                                ['Intelligence', 'Sorts du sorcier, frappe céleste du moine.'],
                                ['Concentration', 'Soins du moine, complément du sorcier.'],
                                ['Chance', 'Caractéristique d\'appoint portée par certains équipements.'],
                                ['Armure', 'Réduit les coups des monstres et, en PvP, jusqu\'à 40 % des dégâts.'],
                            ]}/>
                        <Encart>
                            Chaque sort dépend d'une caractéristique principale et d'une secondaire : misez
                            d'abord sur la principale de vos sorts favoris.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="equipement" numero={6} titre="Équipement">
                        <p>
                            Tête, cou, corps, jambes, pieds, bras droit et bras gauche : chaque emplacement
                            accueille une pièce qui ajoute ses bonus à vos caractéristiques.
                            Équipez depuis l'inventaire ; la pièce remplacée retourne dans votre sac.
                        </p>
                        <div className={styles.raretes}>
                            {[
                                ['Commun', '--rarity-commun'], ['Peu commun', '--rarity-peu-commun'],
                                ['Rare', '--rarity-rare'], ['Épique', '--rarity-epique'],
                                ['Légendaire', '--rarity-legendaire'], ['Héroïque', '--rarity-heroique'],
                            ].map(([nom, token]) => (
                                <span key={nom} style={{'--rarete': `var(${token})`}}>{nom}</span>
                            ))}
                        </div>
                        <p>
                            Les objets s'achètent dans les échoppes, se trouvent sur les monstres et les
                            boss, se fabriquent à l'établi ou s'achètent aux autres joueurs.
                        </p>
                    </Chapitre>

                    <Chapitre id="quetes" numero={7} titre="Quêtes & karma">
                        <p>
                            Parlez aux PNJ pour découvrir leurs histoires. Une quête avance étape par étape :
                            un dialogue, puis un ou plusieurs <strong>choix</strong>. Certains demandent un
                            objet, de l'or, un niveau, ou de terrasser un certain nombre de créatures —
                            comptées à partir du moment où vous acceptez l'étape.
                        </p>
                        <p>
                            Les choix ne sont pas anodins : ils peuvent mener à des branches différentes,
                            à des récompenses différentes, et faire bouger votre <strong>karma</strong>.
                        </p>
                        <div className={styles.karma}>
                            <span>Pillard</span>
                            <i/>
                            <span>Gardien</span>
                        </div>
                        <Encart type="regle" titre="Le karma">
                            Il va de −1000 à +1000. Choix de quête, récolte intensive ou mesurée,
                            fabrication, feu ami : tout ce qui compte moralement le déplace, dans un sens
                            ou dans l'autre.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="classes" numero={8} titre="Les classes">
                        <div className={styles.classes}>
                            {CLASSES.map(c => (
                                <div key={c.id} className={styles.classe} style={{'--accent': c.couleur}}>
                                    <img src={imageClasse(c.id, 'feminin')} alt=""/>
                                    <div>
                                        <h3>{c.nom}</h3>
                                        <span className={styles.classeRole}>{c.role}</span>
                                        <p>{c.description}</p>
                                        <small>Caractéristiques clés : {c.caracs.join(', ')}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Encart>
                            En groupe, un moine pour soigner, un guerrier au contact et deux tireurs à
                            distance forment une base solide pour le donjon.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="factions" numero={9} titre="Factions & PvP">
                        <div className={styles.factions}>
                            {FACTIONS.map(f => (
                                <div key={f.id} className={styles.faction} style={{'--faction': f.couleur}}>
                                    <img src={f.icone} alt=""/>
                                    <strong>{f.nom}</strong>
                                    <em>{f.devise}</em>
                                </div>
                            ))}
                        </div>
                        <p>
                            Votre alignement se choisit au fil d'une quête. Il ouvre certaines terres et
                            quêtes, conditionne votre guilde et désigne vos ennemis : en PvP, vaincre un
                            joueur d'une autre faction rapporte de l'<strong>honneur</strong> (jusqu'à +50),
                            d'autant plus qu'il est fort face à vous.
                        </p>
                        <Encart type="attention" titre="Le prix de la trahison">
                            Frapper un allié est possible, mais coûte honneur et karma à chaque coup ;
                            l'achever coûte bien plus que la meilleure victoire ne rapporte. Et tuer sans
                            cesse la même victime ne rapporte bientôt plus rien.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="donjons" numero={10} titre="Donjons"
                              illustration={(
                                  <div className={styles.donjon}>
                                      <img src={imageCarte(8)} alt="Donjon Scintillant" className={styles.imageCarte}/>
                                      <img src="/img/boss/grimbaldAssoiffe.png" alt="Grimbald" className={styles.donjonBoss}/>
                                  </div>
                              )}>
                        <p>
                            Le <strong>Donjon Scintillant</strong> (niveau 15 minimum) abrite Grimbald
                            l'assoiffé. Entrez seul ou formez un groupe de <strong>cinq</strong> devant la
                            porte : chaque groupe reçoit sa propre instance.
                        </p>
                        <ul className={styles.liste}>
                            <li>Les salles s'ouvrent une à une : tuer leurs occupants, actionner un levier…</li>
                            <li>Le boss <strong>télégraphie</strong> des zones : quittez-les avant l'impact.</li>
                            <li>Il appelle des renforts, s'enrage si le combat s'éternise et exige parfois
                                d'actionner plusieurs leviers en même temps.</li>
                            <li>Vainqueurs : la salle au trésor reste ouverte quelques heures.</li>
                        </ul>
                        <Encart type="regle" titre="Une expédition par jour">
                            Entrer pose un verrou jusqu'au prochain reset (5 h du matin). Dans la journée,
                            revenir vous ramène dans <em>la même</em> expédition, pas dans une neuve.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="artisanat" numero={11} titre="Artisanat"
                              illustration={<div className={styles.bandeau} style={{backgroundImage: `url(${paysage('cascade')})`}}/>}>
                        <p>
                            Les maîtres artisans enseignent onze métiers. Vous pouvez en pratiquer
                            <strong> deux de récolte</strong> (herboriste, mineur, bûcheron, dépeceur) et
                            <strong> trois de fabrication</strong> (alchimiste, forgeron, couturier,
                            bijoutier, armurier, cuisinier, tanneur). Oublier un métier en efface la
                            progression.
                        </p>
                        <Tableau
                            colonnes={['Récolte', 'Effet']}
                            lignes={[
                                ['Mesurée', 'Rendement normal, respect de la ressource : le karma vous en sait gré.'],
                                ['Intensive', 'Plus de ressources, mais la case s\'épuise pour tout le monde — et votre karma en pâtit.'],
                            ]}/>
                        <p>
                            À l'établi, une recette consomme ses ingrédients au lancement puis prend un
                            certain temps ; jusqu'à <strong>trois fabrications</strong> tournent en parallèle.
                            Fabrication <strong>soignée</strong> : temps normal, 30 % des ingrédients
                            récupérés, un peu de karma. <strong>Expéditive</strong> : quatre fois plus
                            rapide, mais rien n'est récupéré et le karma en souffre.
                        </p>
                    </Chapitre>

                    <Chapitre id="economie" numero={12} titre="Économie">
                        <div className={styles.cartes3}>
                            <div>
                                <h3>Échoppes</h3>
                                <p>Les marchands achètent et vendent à prix fixe. Idéal pour s'équiper vite
                                    ou écouler son butin.</p>
                            </div>
                            <div>
                                <h3>Hôtel des ventes</h3>
                                <p>Mettez un lot en vente <strong>48 h</strong> au prix de votre choix. Des
                                    <strong> frais de dépôt de 5 %</strong>, non remboursés, sont prélevés à la
                                    mise en vente ; vous touchez ensuite 100 % du prix. Les invendus vous
                                    reviennent.</p>
                            </div>
                            <div>
                                <h3>Échanges</h3>
                                <p>Clic droit sur un joueur pour lui proposer un échange. Chacun garnit son
                                    offre puis confirme ; toute modification annule les deux confirmations.</p>
                            </div>
                        </div>
                        <Encart type="attention">
                            Un lot de l'hôtel des ventes est indivisible, et vous ne pouvez avoir que dix
                            annonces à la fois. Fixez votre prix avec soin : les frais ne sont jamais rendus.
                        </Encart>
                    </Chapitre>

                    <Chapitre id="guildes" numero={13} titre="Guildes & social">
                        <p>
                            Une guilde appartient à une faction. Postulez auprès d'un maître de guilde : vous
                            entrez comme <strong>recrue</strong> une fois accepté.
                        </p>
                        <div className={styles.grades}>
                            {['Baron', 'Officier', 'Membre', 'Recrue'].map((g, i) => (
                                <span key={g} style={{'--rang': 4 - i}}>{g}</span>
                            ))}
                        </div>
                        <p>
                            Le baron et ses officiers acceptent, promeuvent et excluent — toujours un grade
                            en dessous du leur. Un baron ne peut quitter sa guilde tant qu'elle compte des
                            membres : il doit d'abord transmettre la baronnie.
                        </p>
                        <p>
                            Messagerie, fiche publique des joueurs, journal de vos exploits et classements
                            (expérience, monstres, boss, richesse, honneur, guildes) complètent la vie
                            sociale du royaume.
                        </p>
                    </Chapitre>

                    <Chapitre id="astuces" numero={14} titre="Astuces de vétéran">
                        <ul className={styles.astuces}>
                            <li><Glyph name="clock" size={20}/> Revenez plusieurs fois par jour : PA et PM se
                                régénèrent même hors ligne.</li>
                            <li><Glyph name="target" size={20}/> Gardez vos PA pour le combat : vérifiez la portée
                                avant de lancer un sort coûteux.</li>
                            <li><Glyph name="heart" size={20}/> Un consommable dans la barre de sorts peut vous
                                éviter un aller simple au cimetière.</li>
                            <li><Glyph name="book" size={20}/> Relisez les dialogues : les PNJ glissent souvent
                                où trouver ce qu'ils demandent.</li>
                            <li><Glyph name="shield" size={20}/> En donjon, ne restez jamais dans une zone
                                annoncée : un compte à rebours s'y affiche.</li>
                        </ul>

                        <div className={styles.final} style={{backgroundImage: `url(${paysage('crepuscule')})`}}>
                            <div>
                                <h3>Prêt à entrer dans la forêt ?</h3>
                                <div className={styles.finalActions}>
                                    <Link to="/inscription" className={styles.boutonPlein}>Créer mon personnage</Link>
                                    <Link to="/" className={styles.boutonContour}>Retour à l'accueil</Link>
                                </div>
                            </div>
                        </div>
                    </Chapitre>
                </article>
            </div>
        </div>
    );
};

export default GuidePage;
