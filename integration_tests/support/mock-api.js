import {
  getCourtsResponse,
  getLocalDeliveryUnitsResponse,
  getPoliceForcesResponse,
  getPrisonsResponse,
} from '../mockApis/mockResponses'

export const stubRefData = () => {
  cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
  cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
  cy.task('expectRefData', { refDataPath: 'police-forces', expectedResult: getPoliceForcesResponse })
  cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
}
