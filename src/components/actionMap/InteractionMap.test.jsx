import React from 'react';
import {createRoot} from 'react-dom/client';
import {act, Simulate} from 'react-dom/test-utils';
import {InteractionMap} from './InteractionMap';
import InteractionApi from '../../services/InteractionApi';

jest.mock('../../services/InteractionApi', () => ({__esModule: true, default: {executer: jest.fn()}}));

describe('Inspection des ressources', () => {
    let container, root;
    const props = {
        interaction: {carteCarreauId: 12, nom: 'Sauge', verbe: 'Récolter', skin: 'ancienne'},
        etat: {nom: 'Sauge', verbe: 'Récolter', skin: 'sauge-carte', disponible: true, coutPa: 3},
        updateJoueurState: jest.fn(),
    };
    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        jest.clearAllMocks();
    });
    afterEach(() => { act(() => root.unmount()); container.remove(); });

    it('inspecte au premier toucher sans appeler la récolte', async () => {
        act(() => root.render(<InteractionMap {...props}/>));
        expect(container.querySelector('img').getAttribute('src')).toBe('/img/interaction/sauge-carte.png');
        act(() => Simulate.click(container.querySelector('button')));
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog.textContent).toContain('3 PA');
        expect(InteractionApi.executer).not.toHaveBeenCalled();
        InteractionApi.executer.mockResolvedValue({messages: [], etat: props.etat, pa: 17, needRefresh: true});
        const action = [...dialog.querySelectorAll('button')].find(b => b.textContent === 'Récolter');
        await act(async () => Simulate.click(action));
        expect(InteractionApi.executer).toHaveBeenCalledWith(12, null);
        expect(props.updateJoueurState).toHaveBeenCalledWith({pa: 17, needRefresh: true});
    });

    it('montre le refus sans lancer une action au toucher', () => {
        act(() => root.render(<InteractionMap {...props} etat={{...props.etat, disponible: false, raison: 'Métier requis'}}/>));
        act(() => Simulate.click(container.querySelector('button')));
        expect(document.querySelector('[role="dialog"]').textContent).toContain('Métier requis');
        expect(InteractionApi.executer).not.toHaveBeenCalled();
    });

    it('affiche les informations au focus et les masque avec Échap', () => {
        act(() => root.render(<InteractionMap {...props}/>));
        act(() => Simulate.focus(container.querySelector('button')));
        expect(document.querySelector('[role="tooltip"]').textContent).toContain('Sauge');
        act(() => Simulate.keyDown(container.querySelector('button'), {key: 'Escape'}));
        expect(document.querySelector('[role="tooltip"]')).toBeNull();
    });

    it('garde un repère si le PNG manque et réessaie quand il change', () => {
        act(() => root.render(<InteractionMap {...props}/>));
        act(() => Simulate.error(container.querySelector('img')));
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('button')).not.toBeNull();
        act(() => root.render(<InteractionMap {...props} etat={{...props.etat, skin: 'nouvelle'}}/>));
        expect(container.querySelector('img').getAttribute('src')).toBe('/img/interaction/nouvelle.png');
    });
});
