import React from 'react';
import {createRoot} from 'react-dom/client';
import {act, Simulate} from 'react-dom/test-utils';
import {MemoryRouter} from 'react-router-dom';
import {Target} from './Target';
import UsersApi from '../../services/UsersApi';
import {toast} from 'react-toastify';

jest.mock('../../services/UsersApi', () => ({__esModule: true, default: {echangerPosition: jest.fn()}}));
jest.mock('react-toastify', () => ({toast: {error: jest.fn()}}));

describe('Échanger les positions depuis la cible', () => {
    let root, container;
    const props = {
        target: {type: 'player', targetId: 2, pseudo: 'Voisin', niveau: 1, currentLife: 100, maxLife: 100, currentMana: 10, maxMana: 10},
        positionJoueur: {abscisse: 1, ordonnee: 1},
        joueurState: {idJoueur: 1, mapId: 3, pm: 10, joueursCarte: [{userId: 2, abscisse: 2, ordonnee: 1}]},
        updateJoueurState: jest.fn(), fetchTargetInfo: jest.fn(), removePlayerTarget: jest.fn(),
    };
    const render = p => act(() => root.render(<MemoryRouter><Target {...p}/></MemoryRouter>));
    const button = () => container.querySelector('[aria-label="Échanger les positions — 1 PM"]');
    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        jest.clearAllMocks();
    });
    afterEach(() => { act(() => root.unmount()); container.remove(); });
    it('affiche l’icône seulement pour un voisin présent sur la carte, diagonales comprises', () => {
        render(props);
        expect(button()).not.toBeNull();
        render({...props, positionJoueur: {abscisse: 1, ordonnee: 2}});
        expect(button()).not.toBeNull();
        render({...props, positionJoueur: {abscisse: 5, ordonnee: 2}});
        expect(button()).toBeNull();
        render({...props, joueurState: {...props.joueurState, joueursCarte: []}});
        expect(button()).toBeNull();
    });
    it('échange en un clic, bloque les doubles clics et adopte les PM serveur', async () => {
        let terminer;
        UsersApi.echangerPosition.mockReturnValue(new Promise(resolve => { terminer = resolve; }));
        render(props);
        act(() => { Simulate.click(button()); Simulate.click(button()); });
        expect(UsersApi.echangerPosition).toHaveBeenCalledTimes(1);
        expect(UsersApi.echangerPosition).toHaveBeenCalledWith(2, 3, 1, 1);
        await act(async () => terminer({pm: 9, needRefresh: true}));
        expect(props.updateJoueurState).toHaveBeenCalledWith({pm: 9, needRefresh: true});
    });
    it('affiche le refus et recharge les positions', async () => {
        UsersApi.echangerPosition.mockRejectedValue({response: {data: {message: 'Ce joueur a bougé.'}}});
        render(props);
        await act(async () => Simulate.click(button()));
        expect(toast.error).toHaveBeenCalledWith('Ce joueur a bougé.');
        expect(props.updateJoueurState).toHaveBeenCalledWith({needRefresh: true});
    });
    it('désactive l’icône pendant un déplacement ou sans PM', () => {
        render({...props, joueurState: {...props.joueurState, deplacementEnCours: true}});
        expect(button().disabled).toBe(true);
        render({...props, joueurState: {...props.joueurState, pm: 0}});
        expect(button().disabled).toBe(true);
    });
});
