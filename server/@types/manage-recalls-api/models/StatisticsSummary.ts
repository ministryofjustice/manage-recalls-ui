/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PhaseAverageDuration } from './PhaseAverageDuration';

export type StatisticsSummary = {
    lastSevenDays: Array<PhaseAverageDuration>;
    overall: Array<PhaseAverageDuration>;
};
