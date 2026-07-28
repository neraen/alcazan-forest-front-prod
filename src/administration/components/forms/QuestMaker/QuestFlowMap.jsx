import React, {useMemo} from 'react'

/**
 * Carte de flux (lecture seule) d'une quête à embranchement. Chaque nœud est
 * une séquence, chaque flèche un branchement d'un choix :
 *  - nextSequenceKey = '__END__'  -> flèche vers le nœud « Fin »
 *  - nextSequenceKey = clientKey  -> flèche vers la séquence cible
 *  - nextSequenceKey = ''         -> linéaire (séquence suivante), sinon Fin
 * Cliquer un nœud sélectionne la séquence dans le panneau d'édition.
 *
 * Layout : layers = plus court chemin depuis la 1re séquence (BFS), robuste
 * aux boucles ; les arêtes « retour » (cible dans un layer <= source) sont
 * pointillées. Pas de moteur de graphe externe.
 */
const NODE_W = 132;
const NODE_H = 46;
const X_STEP = 186;
const Y_STEP = 64;
const PAD = 16;

export default function QuestFlowMap({sequences, selectedIndex, onSelect}){

    const graph = useMemo(() => buildGraph(sequences || []), [sequences]);

    if(graph.nodes.length === 0){
        return <div className="qm-flowmap-empty">Ajoute une séquence pour voir la carte du scénario.</div>;
    }

    const {nodes, edges, layer, endLayer, positions, width, height} = graph;

    const anchorRight = (i) => ({x: positions[i].x + NODE_W, y: positions[i].y + NODE_H / 2});
    const anchorLeft = (i) => ({x: positions[i].x, y: positions[i].y + NODE_H / 2});
    const endPos = endLayer !== null ? {x: PAD + endLayer * X_STEP, y: PAD} : null;
    const endAnchorLeft = endPos ? {x: endPos.x, y: endPos.y + NODE_H / 2} : null;

    const edgePath = (from, to) => {
        const a = anchorRight(from);
        const b = to === 'END' ? endAnchorLeft : anchorLeft(to);
        const mx = (a.x + b.x) / 2;
        return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
    };

    // Point d'ancrage du libellé du choix, vers le départ de l'arête.
    const labelPos = (from, to) => {
        const a = anchorRight(from);
        const b = to === 'END' ? endAnchorLeft : anchorLeft(to);
        const t = 0.42;
        return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
    };

    return (
        <div className="qm-flowmap" role="img" aria-label="Carte du scénario de la quête">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <marker id="qmArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M0,0 L10,5 L0,10 z"/>
                    </marker>
                </defs>

                {edges.map((e, idx) => {
                    const back = e.to !== 'END' && layer[e.to] <= layer[e.from];
                    return (
                        <path key={idx} className={`qm-edge${back ? ' back' : ''}`}
                              d={edgePath(e.from, e.to)} markerEnd="url(#qmArrow)"/>
                    );
                })}

                {edges.map((e, idx) => {
                    if(!e.label){
                        return null;
                    }
                    const p = labelPos(e.from, e.to);
                    const text = truncate(e.label, 16);
                    const w = text.length * 5.6 + 10;
                    return (
                        <g key={`lbl${idx}`}>
                            <rect className="qm-edge-label-bg" x={p.x - w / 2} y={p.y - 8} width={w} height={15} rx="7"/>
                            <text className="qm-edge-label" x={p.x} y={p.y + 3.5} textAnchor="middle">{text}</text>
                        </g>
                    );
                })}

                {nodes.map(n => {
                    const p = positions[n.i];
                    const isSel = n.i === selectedIndex;
                    return (
                        <g key={n.key} className={`qm-flownode${isSel ? ' selected' : ''}`} onClick={() => onSelect(n.i)}>
                            <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx="9"/>
                            <text className="qm-node-key" x={p.x + 10} y={p.y + 18}>{`SÉQ. ${n.i + 1}`}</text>
                            <text className="qm-node-name" x={p.x + 10} y={p.y + 34}>{truncate(n.name, 17)}</text>
                        </g>
                    );
                })}

                {endPos && (
                    <g>
                        <rect className="qm-end-box" x={endPos.x} y={endPos.y} width={NODE_W} height={NODE_H} rx="23"/>
                        <text className="qm-end-label" x={endPos.x + NODE_W / 2} y={endPos.y + NODE_H / 2 + 4} textAnchor="middle">
                            🏁 Fin de quête
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}

function truncate(text, max){
    const t = String(text || '');
    return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function buildGraph(sequences){
    const keyOf = (s, i) => String((s && (s.clientKey || s.id)) || ('idx' + i));
    const nodes = sequences.map((s, i) => ({i, key: keyOf(s, i), name: (s && s.nomSequence) || `Séquence ${i + 1}`}));

    const keyToIndex = {};
    nodes.forEach(n => {keyToIndex[n.key] = n.i;});

    const edges = [];
    let hasEnd = false;
    sequences.forEach((s, i) => {
        (s && s.actions ? s.actions : []).forEach(a => {
            const nk = (a && a.nextSequenceKey) || '';
            const label = (a && a.label) || '';
            if(nk === '__END__'){
                edges.push({from: i, to: 'END', label});
                hasEnd = true;
            } else if(nk && keyToIndex[nk] !== undefined){
                edges.push({from: i, to: keyToIndex[nk], label});
            } else if(i + 1 < sequences.length){
                edges.push({from: i, to: i + 1, label});
            } else {
                edges.push({from: i, to: 'END', label});
                hasEnd = true;
            }
        });
    });

    // Layer = plus court chemin depuis la séquence 0 (BFS, robuste aux boucles).
    const layer = new Array(nodes.length).fill(-1);
    if(nodes.length){
        layer[0] = 0;
        const queue = [0];
        while(queue.length){
            const u = queue.shift();
            edges.filter(e => e.from === u && e.to !== 'END').forEach(e => {
                if(layer[e.to] === -1){
                    layer[e.to] = layer[u] + 1;
                    queue.push(e.to);
                }
            });
        }
    }
    // Séquences non atteintes depuis le début : empilées après le dernier layer.
    let maxLayer = layer.reduce((m, l) => Math.max(m, l), 0);
    nodes.forEach(n => {
        if(layer[n.i] === -1){
            maxLayer += 1;
            layer[n.i] = maxLayer;
        }
    });

    const endLayer = hasEnd ? (layer.reduce((m, l) => Math.max(m, l), 0) + 1) : null;

    // Positions : x par layer, y empilé par ordre d'apparition dans le layer.
    const rowInLayer = {};
    const positions = nodes.map(n => {
        const l = layer[n.i];
        const row = rowInLayer[l] || 0;
        rowInLayer[l] = row + 1;
        return {x: PAD + l * X_STEP, y: PAD + row * Y_STEP};
    });

    const lastLayer = endLayer !== null ? endLayer : layer.reduce((m, l) => Math.max(m, l), 0);
    const maxRows = Math.max(1, ...Object.values(rowInLayer), 1);
    const width = PAD * 2 + lastLayer * X_STEP + NODE_W;
    const height = PAD * 2 + maxRows * Y_STEP;

    return {nodes, edges, layer, endLayer, positions, width, height};
}
