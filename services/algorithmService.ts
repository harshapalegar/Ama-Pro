import { Product, LPResult, ScoreResult } from '../types';

export class LPAlgorithm {
    items: Product[];
    slots: number;
    lambda: number;
    slotWeights: number[];

    constructor(items: Product[], slots: number, lambda: number) {
        this.items = items;
        this.slots = slots;
        this.lambda = lambda;
        this.slotWeights = this.calculateSlotWeights(slots);
    }

    calculateSlotWeights(m: number): number[] {
        const weights: number[] = [];
        for (let i = 0; i < m; i++) {
            weights.push(1 / Math.pow(i + 1, 0.7));
        }
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map(w => w / sum);
    }

    calculateMaxRelevance(): number {
        const sorted = [...this.items].sort((a, b) => b.relevance - a.relevance);
        let maxRel = 0;
        for (let i = 0; i < Math.min(this.slots, sorted.length); i++) {
            maxRel += this.slotWeights[i] * sorted[i].relevance;
        }
        return maxRel;
    }

    optimize(): LPResult {
        const maxRel = this.calculateMaxRelevance();
        const targetRel = this.lambda * maxRel;

        let mu = 0;
        let muMin = 0;
        let muMax = 1000;
        let bestSolution: LPResult | null = null;
        const maxIterations = 50;

        for (let iter = 0; iter < maxIterations; iter++) {
            const scored = this.items.map(item => ({
                ...item,
                dualScore: item.expectedRevenue + mu * item.relevance
            })).sort((a, b) => b.dualScore! - a.dualScore!);

            const selected = scored.slice(0, this.slots);
            
            let totalRev = 0;
            let totalRel = 0;
            for (let i = 0; i < selected.length; i++) {
                totalRev += this.slotWeights[i] * selected[i].expectedRevenue;
                totalRel += this.slotWeights[i] * selected[i].relevance;
            }

            bestSolution = {
                items: selected,
                totalRevenue: totalRev,
                totalRelevance: totalRel,
                maxRelevance: maxRel,
                relevanceRatio: totalRel / maxRel,
                targetRelevance: targetRel,
                metConstraint: totalRel >= targetRel
            };

            if (Math.abs(totalRel - targetRel) < 0.0001) break;

            if (totalRel < targetRel) {
                muMin = mu;
                mu = (mu + muMax) / 2;
            } else {
                muMax = mu;
                mu = (muMin + mu) / 2;
            }
        }

        return bestSolution!;
    }
}

export function scoreBasedRanking(items: Product[], slots: number, w: number): ScoreResult {
    // We instantiate LP just to get the same slot weights for fair comparison
    const slotWeights = new LPAlgorithm(items, slots, 0.9).slotWeights;
    
    const scored = items.map(item => ({
        ...item,
        score: item.relevance * item.takeRate * item.price + 
               w * item.relevance * item.adRate * item.price
    })).sort((a, b) => b.score! - a.score!);

    const selected = scored.slice(0, slots);
    
    let totalRev = 0;
    let totalRel = 0;
    for (let i = 0; i < selected.length; i++) {
        totalRev += slotWeights[i] * selected[i].expectedRevenue;
        totalRel += slotWeights[i] * selected[i].relevance;
    }

    const maxRel = new LPAlgorithm(items, slots, 0.9).calculateMaxRelevance();

    return {
        items: selected,
        totalRevenue: totalRev,
        totalRelevance: totalRel,
        maxRelevance: maxRel,
        relevanceRatio: totalRel / maxRel
    };
}
