import { COURT } from './constants';

export const COURT_GEOMETRY = {
  width: COURT.width,
  height: COURT.height,
  padding: 30,
  hoopX: COURT.width / 2,
  hoopY: 52,
  hoopRadius: 7.5,
  backboardY: 40,
  backboardWidth: 60,
  restrictedRadius: 40,
  laneWidth: 160,
  laneTopY: 30,
  laneBottomY: 220,
  freeThrowRadius: 60,
  cornerThreeXLeft: 30,
  cornerThreeXRight: COURT.width - 30,
  cornerThreeTopY: 140,
  threePointRadius: 238,
};

export function getThreeArcJoinY() {
  const { threePointRadius, hoopX, hoopY, cornerThreeXLeft } = COURT_GEOMETRY;
  const dx = Math.abs(cornerThreeXLeft - hoopX);
  const dy = Math.sqrt(Math.max((threePointRadius ** 2) - (dx ** 2), 0));
  return hoopY + dy;
}

export function getThreePointArcPath() {
  const { hoopX, cornerThreeXLeft, cornerThreeXRight } = COURT_GEOMETRY;
  const joinY = getThreeArcJoinY();
  return `M ${cornerThreeXLeft} ${joinY} A ${COURT_GEOMETRY.threePointRadius} ${COURT_GEOMETRY.threePointRadius} 0 0 1 ${cornerThreeXRight} ${joinY}`;
}

export function getDemoShots() {
  return [
    { id: 'd1', x: 248, y: 76, result: 'MAKE', zone: 'Rim', shotType: 'Layup' },
    { id: 'd2', x: 261, y: 84, result: 'MAKE', zone: 'Rim', shotType: 'Dunk' },
    { id: 'd3', x: 196, y: 242, result: 'MISS', zone: 'Short Mid', shotType: 'Pull-up' },
    { id: 'd4', x: 311, y: 265, result: 'MISS', zone: 'Long Mid', shotType: 'Fadeaway' },
    { id: 'd5', x: 180, y: 350, result: 'MAKE', zone: 'Above-the-Break 3', shotType: '3PT' },
    { id: 'd6', x: 322, y: 347, result: 'MAKE', zone: 'Above-the-Break 3', shotType: '3PT' },
    { id: 'd7', x: 52, y: 252, result: 'MISS', zone: 'Left Corner 3', shotType: 'Corner 3' },
    { id: 'd8', x: 448, y: 254, result: 'MISS', zone: 'Right Corner 3', shotType: 'Corner 3' },
  ];
}
