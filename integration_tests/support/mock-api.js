import {
  getCourtsResponse,
  getLocalDeliveryUnitsResponse,
  getPoliceForcesResponse,
  getPrisonsResponse,
  getMappaLevelsResponse,
  getReasonsForRecallResponse,
  getStopReasonsResponse,
} from '../mockApis/mockResponses'

export const stubRefData = () => {
  cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
  cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
  cy.task('expectRefData', { refDataPath: 'police-forces', expectedResult: getPoliceForcesResponse })
  cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
  cy.task('expectRefData', { refDataPath: 'mappa-levels', expectedResult: getMappaLevelsResponse })
  cy.task('expectRefData', { refDataPath: 'recall-reasons', expectedResult: getReasonsForRecallResponse })
  cy.task('expectRefData', { refDataPath: 'stop-reasons', expectedResult: getStopReasonsResponse })
}
