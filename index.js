const fetch = require('node-fetch');
const fs = require('fs');

const endpointNPR = 'https://npropendata.rdw.nl/parkingdata/v2/';

getMyParkingData()
async function getMyParkingData() {
    const allParkingFacilities = await getData(endpointNPR)
    const preparedData = await prepareData(allParkingFacilities)

    // fs.writeFileSync('./result.json', JSON.stringify(result));
}

// getData(endpointNPR)
//     .then(nprData => {
//         // console.log('all NPR data', nprData);


//     })


async function prepareData(nprData) {
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

    const dataWrapped = await Promise.all(promiseAllPr)
    // console.log("dataWrapped", prDataArray)
    const prDataArray = dataWrapped.map(item => item.parkingFacilityInformation)
    console.log('PR parking data array complete', prDataArray)

    fs.writeFileSync('./result.json', JSON.stringify(prDataArray, null, 4));

    return prDataArray;

}

// setTimeout(function () {
//     // fetch here?
// }, 2000)

async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    // console.log(data);
    return data;
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