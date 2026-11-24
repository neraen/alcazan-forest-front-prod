import {useEffect} from 'react';
import {useStore} from 'react-redux';
import GameApi from '../../services/GameApi';
import {fetchTargetSuccess} from '../../store/actions';

// Suit uniquement le groupe de LA case occupée, même quand sa population est vide.
export default function MonstreCible({id}) {
    const store = useStore();
    useEffect(() => {
        if (!id) return;
        let actif = true;
        let enCours = false;
        let arrivee = true;
        const actualiser = async () => {
            const avant = store.getState().data.target;
            if (enCours || (!arrivee && avant.type && avant.type !== 'none' && avant.type !== 'monstre')) return;
            arrivee = false;
            enCours = true;
            try {
                const {data} = await GameApi.getTargetInfos(id, 'monstre');
                // Un déplacement, un coup ou un clic de ciblage a pu arriver entre-temps.
                if (actif && store.getState().data.target === avant) {
                    store.dispatch(fetchTargetSuccess({...data, targetId: id, type: 'monstre'}));
                }
            } catch (_) {
                // Une panne réseau n'est pas une population vide ; retenter au prochain tour.
            } finally {
                enCours = false;
            }
        };
        actualiser();
        const timer = setInterval(actualiser, 5000);
        return () => { actif = false; clearInterval(timer); };
    }, [id, store]);
    return null;
}
