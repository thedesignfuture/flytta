let flightData = {
  departure: {
    city: 'Nice',
    time: '09:00', // fixed
    timeZone: 'CET',
    code: 'NCE',
    airport: "Nice Côte d'Azur Airport"
  },
  arrival: {
    city: 'London',
    time: '18:00', // fixed
    timeZone: 'GMT',
    code: 'FAB',
    airport: 'London Farnborough Airport'
  },
  travelTime: '1 hour 45min',
  arrivalTime: '' // dynamically calculated
};

const DEFAULT_URL = 'https://flytta.regiondo.com';

const flightUrls = {
  'Nice-London': {
    one_way: `${DEFAULT_URL}/nice-london`,
    return: `${DEFAULT_URL}/nce-ldn-return`,
  },
  'London-Nice': {
    one_way: `${DEFAULT_URL}/london-nice`,
    return: `${DEFAULT_URL}/lnd-nce`,
  }
};

// Time zone offsets relative to UTC
const TIMEZONE_OFFSET = {
  CET: 1,
  GMT: 0
};

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return { h, m };
}

function parseDuration(durationStr) {
  const [hStr, , mStr] = durationStr.split(' ');
  return {
    h: parseInt(hStr),
    m: parseInt(mStr.replace('min', ''))
  };
}

function getArrivalTime(departureTime, fromTZ, toTZ, durationStr) {
  const { h: depH, m: depM } = parseTime(departureTime);
  const { h: durH, m: durM } = parseDuration(durationStr);

  const fromOffset = TIMEZONE_OFFSET[fromTZ];
  const toOffset = TIMEZONE_OFFSET[toTZ];

  // Convert departure time to UTC minutes
  let utcMinutes = (depH - fromOffset) * 60 + depM;

  // Add travel duration
  utcMinutes += durH * 60 + durM;

  // Convert to arrival local time
  let localMinutes = utcMinutes + toOffset * 60;

  const arrivalH = Math.floor(localMinutes / 60) % 24;
  const arrivalM = localMinutes % 60;

  return `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;
}

function fillFlightInfo() {
  flightData.arrivalTime = getArrivalTime(
    flightData.departure.time,
    flightData.departure.timeZone,
    flightData.arrival.timeZone,
    flightData.travelTime
  );

  document.getElementById('depart-time').textContent = `${flightData.departure.time} ${flightData.departure.timeZone}`;
  document.getElementById('depart-location').textContent = flightData.departure.city;
  document.getElementById('depart-location-desc').textContent = flightData.departure.airport;
  document.getElementById('depart-location-short').textContent = flightData.departure.code;

  document.getElementById('arrive-time').textContent = `${flightData.arrivalTime} ${flightData.arrival.timeZone}`;
  document.getElementById('arrive-location').textContent = flightData.arrival.city;
  document.getElementById('arrive-location-desc').textContent = flightData.arrival.airport;
  document.getElementById('arrive-location-short').textContent = flightData.arrival.code;

  updateBookLink();
}

function swapFlights() {
  const temp = { ...flightData.departure };
  flightData.departure = { ...flightData.arrival };
  flightData.departure.time = flightData.arrival.time;

  flightData.arrival = temp;
  flightData.arrival.time = temp.time;

  fillFlightInfo();
}

function updateBookLink() {
  const isReturn = document.getElementById('bookingtype').checked;
  const routeKey = `${flightData.departure.city}-${flightData.arrival.city}`;
  const route = flightUrls[routeKey];
  const url = route ? (isReturn ? route.return : route.one_way) : '#';
  document.getElementById('book').href = url;
}

document.getElementById('swap').addEventListener('click', swapFlights);
document.getElementById('bookingtype').addEventListener('change', updateBookLink);

// Initial load
fillFlightInfo();
