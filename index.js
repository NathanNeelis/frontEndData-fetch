const fetch = require('node-fetch');
const fs = require('fs');

const endpointNPR = 'https://npropendata.rdw.nl/parkingdata/v2/';
const proxyURL = 'NONE' // I USED THE CORS CHROME PLUGIN, PROXY URL DINDT SEEM TO WORK
// RESOURCE: https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf
// thanks to Victor.

getMyParkingData()
async function getMyParkingData() {
    const allParkingFacilities = await getData(endpointNPR)
    const prDataArray = await getPrData(allParkingFacilities)

}

async function getPrData(nprData) {
    const nprDataSet = nprData.ParkingFacilities;
    let nprDataSetClean = removeNoName(nprDataSet);
    // console.log(nprDataSetClean);

    let prParking = filterPrParking(nprDataSetClean);
    // console.log('all PR parking areas', prParking);

    let prParkingIDs = filterID(prParking);
    // console.log('check ids', prParkingIDs)

    const baseURL = endpointNPR + 'static/';

    const promiseAllPr = makeURLs(baseURL, prParkingIDs);
    // console.log('testing urls', promiseAllPr);

    const wrappedData = await Promise.all(promiseAllPr)
    // console.log("dataWrapped", prDataArray)
    const prDataArray = unwrapData(wrappedData);
    // console.log('PR parking data array complete', prDataArray)

    fs.writeFileSync('./result.json', JSON.stringify(prDataArray, null, 4));

    return prDataArray;

}

// RESOURCE: LAURENS - https://vizhub.com/Razpudding/781fc8abc97443919613184546720ab0?edit=files&file=index.js
// RESOURCE: RIJK - https://dlo.mijnhva.nl/d2l/ext/rp/192600/lti/framedlaunch/a44d697c-b552-4a8c-b5e7-12fe6b8d704a
// RESOURCE: https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback

async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function unwrapData(wrappedData) {
    return wrappedData.map(item => item.parkingFacilityInformation)
}

function makeURLs(baseURL, IDs) {
    return IDs.map(id => getData(baseURL + id))
}

function filterID(prData) {
    return prData.map(prParkingData => prParkingData.identifier) // returns array with PR parking ID's
}

// returns all data that includes PR parking
function filterPrParking(allData) {
    let substring = 'P+R';
    let prParkingArray = [];
    for (let i = 0; i < allData.length; i++) {
        if (allData[i].name.indexOf(substring) !== -1) {
            prParkingArray.push(allData[i])
        }
    }
    return prParkingArray;
}

// removes all items in array that do not have the key "name" in the object.
function removeNoName(allData) {
    let newArray = allData.filter(obj => Object.keys(obj).includes("name"));
    return newArray
}
// Resource: https://stackoverflow.com/questions/51367551/how-to-remove-object-from-array-if-property-in-object-do-not-exist