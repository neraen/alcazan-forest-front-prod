import {useEffect} from 'react';

/**
 * Fait apparaître en fondu les éléments marqués `data-apparition` quand ils entrent
 * dans l'écran (pose `data-visible`). Le style vit dans `_apparition.scss`.
 * Sans IntersectionObserver ou avec « réduire les animations », tout est visible d'emblée.
 */
const useApparition = () => {
    useEffect(() => {
        const elements = Array.from(document.querySelectorAll('[data-apparition]'));
        const reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduit || !('IntersectionObserver' in window)) {
            elements.forEach(el => el.setAttribute('data-visible', ''));
            return undefined;
        }

        const observateur = new IntersectionObserver((entrees) => {
            entrees.forEach(entree => {
                if (entree.isIntersecting) {
                    entree.target.setAttribute('data-visible', '');
                    observateur.unobserve(entree.target);
                }
            });
        }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});

        elements.forEach(el => observateur.observe(el));
        return () => observateur.disconnect();
    }, []);
};

export default useApparition;
