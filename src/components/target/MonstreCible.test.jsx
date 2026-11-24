import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import MonstreCible from './MonstreCible';
import GameApi from '../../services/GameApi';
import {playerStatsReducer} from '../../store/reducers';
import {fetchTargetSuccess, updatePlayerTarget} from '../../store/actions';
jest.mock('../../services/GameApi', () => ({__esModule: true, default: {getTargetInfos: jest.fn()}}));
describe('Population ciblable', () => {
    let root, store;
    const infos = n => ({data: {quantiteMonstre: n, nomMonstre: 'Libellule', monstreLife: 600}});
    const render = id => act(async () => { root.render(<Provider store={store}><MonstreCible key={id} id={id}/></Provider>); });
    const tick = () => act(async () => { jest.advanceTimersByTime(5000); });
    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        jest.useFakeTimers();
        GameApi.getTargetInfos.mockReset();
        store = createStore(playerStatsReducer);
        root = createRoot(document.createElement('div'));
    });
    afterEach(() => { act(() => root.unmount()); jest.useRealTimers(); });
    it('masque zéro, retrouve le repop sur place et décible au dernier coup', async () => {
        GameApi.getTargetInfos.mockResolvedValue(infos('0'));
        await render(12);
        expect(store.getState().data.target).toEqual({});
        GameApi.getTargetInfos.mockResolvedValue(infos(1));
        await tick();
        expect(store.getState().data.target).toMatchObject({targetId: 12, type: 'monstre', quantiteMonstre: 1});
        act(() => store.dispatch(fetchTargetSuccess(infos(0).data)));
        expect(store.getState().data.target).toEqual({});
    });
    it('cible à l’arrivée même si un joueur était sélectionné avant le déplacement', async () => {
        store.dispatch(updatePlayerTarget({targetId: 7, type: 'player'}));
        GameApi.getTargetInfos.mockResolvedValue(infos(1));
        await render(12);
        expect(store.getState().data.target).toMatchObject({targetId: 12, type: 'monstre'});
    });
    it('décible quand un autre joueur épuise le groupe', async () => {
        GameApi.getTargetInfos.mockResolvedValue(infos(1));
        await render(12);
        GameApi.getTargetInfos.mockResolvedValue(infos(0));
        await tick();
        expect(store.getState().data.target).toEqual({});
    });
    it('ignore une réponse après avoir quitté la case et arrête le sondage', async () => {
        let resolve;
        GameApi.getTargetInfos.mockImplementation(() => new Promise(r => { resolve = r; }));
        await render(12);
        await render(null);
        await act(async () => resolve(infos(1)));
        expect(store.getState().data.target.type).toBe('none');
        await tick();
        expect(GameApi.getTargetInfos).toHaveBeenCalledTimes(1);
    });
    it('préserve une cible joueur choisie pendant la requête', async () => {
        let resolve;
        GameApi.getTargetInfos.mockImplementation(() => new Promise(r => { resolve = r; }));
        await render(12);
        act(() => store.dispatch(updatePlayerTarget({targetId: 7, type: 'player'})));
        await act(async () => resolve(infos(1)));
        await tick();
        expect(store.getState().data.target).toMatchObject({targetId: 7, type: 'player'});
        expect(GameApi.getTargetInfos).toHaveBeenCalledTimes(1);
    });
});
