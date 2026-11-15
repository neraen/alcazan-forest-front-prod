import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';
import QueteDetail from './QueteDetail';
import {etatQuete} from './queteUtils';

const lieu = {carteId: 2, carte: 'Tutoriel Boisé', x: 11, y: 9, ici: false};
const eolan = {id: 8, nom: 'Eolan', avatar: 'eolan.png', lieu};

const enCours = (etape) => ({
    id: 8, nom: 'La battue', statut: 'enCours', introduction: [], niveauMin: null, donneur: null,
    etape: {
        sequenceId: 13, numero: 1, titre: 'la battue', paroles: ['Les loups rôdent.'], pnj: eolan,
        objectifs: [], objectifsAuChoix: false, pret: true, decision: false,
        recompenses: [], recompensesVariables: false,
        ...etape,
    },
});

const chasse = {
    actionId: 19, type: 'BATTRE_MONSTRE', libelle: 'Vaincre 5 × Loup', bouton: 'Les loups sont tombés',
    fait: false, progress: {current: 3, target: 5, unit: 'vaincu(s)'}, item: null, lieu: null,
    recompenses: [{type: 'or', id: null, label: "pièces d'or", quantity: 150, image: null, position: null}],
};

describe('Journal de quêtes', () => {
    let container, root;
    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });
    afterEach(() => { act(() => root.unmount()); container.remove(); });

    it("annonce l'objectif chiffré et le bouton à choisir au retour", () => {
        act(() => root.render(<QueteDetail quete={enCours({objectifs: [chasse], pret: false, recompenses: chasse.recompenses})}/>));
        expect(container.textContent).toContain('Vaincre 5 × Loup');
        expect(container.textContent).toContain('3 / 5');
        expect(container.textContent).toContain('choisissez « Les loups sont tombés »');
        expect(container.textContent).toContain('Votre contact');
        expect(container.textContent).toContain('Tutoriel Boisé · case 11, 9');
        expect(container.textContent).toContain('150 po');
    });

    it('envoie parler au PNJ quand il ne reste qu’un dialogue', () => {
        act(() => root.render(<QueteDetail quete={enCours({})}/>));
        expect(container.textContent).toContain('Prochaine étape');
        expect(container.textContent).toContain('Parlez à Eolan');
        expect(container.textContent).not.toContain('Récompenses');
    });

    it('ne répète pas les récompenses quand chaque objectif porte la sienne', () => {
        const bois = {...chasse, actionId: 20, libelle: 'Apporter 3 × Bûche', recompenses: [
            {type: 'experience', id: null, label: "points d'expérience", quantity: 250, image: null, position: null},
        ]};
        act(() => root.render(<QueteDetail quete={enCours({
            objectifs: [chasse, bois], objectifsAuChoix: true, pret: false, recompensesVariables: true,
        })}/>));
        expect(container.textContent).toContain('Un seul suffit');
        expect(container.textContent).toContain('150 po');
        expect(container.textContent).not.toContain('dépendra de votre choix');
    });

    it('dit « lieu inconnu » plutôt que d’inventer un lieu', () => {
        act(() => root.render(<QueteDetail quete={{
            id: 5, nom: 'Racines', statut: 'disponible', introduction: ['Mes plantes dépérissent.'], niveauMin: 4,
            donneur: {...eolan, lieu: null},
        }}/>));
        expect(container.textContent).toContain('Niveau 4 requis');
        expect(container.textContent).toContain('Lieu inconnu');
        expect(container.textContent).toContain('Mes plantes dépérissent.');
    });

    it('affiche une quête terminée sans date sans planter', () => {
        act(() => root.render(<QueteDetail quete={{
            id: 6, nom: 'Carrefour', statut: 'terminee', introduction: [], niveauMin: null, donneur: null, termineeLe: null,
        }}/>));
        expect(container.textContent).toContain('Quête accomplie');
        expect(container.textContent).toContain('il y a longtemps');
    });

    it('résume chaque état pour la liste', () => {
        expect(etatQuete(enCours({objectifs: [chasse], pret: false})).resume).toBe('Vaincre 5 × Loup · 3/5');
        expect(etatQuete(enCours({objectifs: [{...chasse, fait: true}], pret: true})).resume).toBe('Retournez voir Eolan');
        expect(etatQuete({statut: 'disponible', donneur: eolan}).label).toBe('Nouvelle');
        expect(etatQuete({statut: 'terminee', termineeLe: null}).resume).toBe('Quête accomplie');
    });
});
