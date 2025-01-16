const fileSystem = require('fs');

const MAX_BIT_LIMIT = Math.pow(2, 256) - 1;

function isCoefficientValid(coefficient) {
    return coefficient >= 0 && coefficient <= MAX_BIT_LIMIT;
}

function convertEncodedValue(numberBase, encodedString) {
    const parsedValue = parseInt(encodedString, numberBase);
    if (!isCoefficientValid(parsedValue)) {
        throw new Error(`Decoded value ${parsedValue} is out of the 256-bit range.`);
    }
    return parsedValue;
}

function computeLagrangeInterpolation(dataPoints, rootsRequired) {
    let resultConstant = 0;
    for (let primaryIndex = 0; primaryIndex < rootsRequired; primaryIndex++) {
        let primaryX = dataPoints[primaryIndex].x;
        let primaryY = dataPoints[primaryIndex].y;
        let lagrangeMultiplier = 1;
        for (let secondaryIndex = 0; secondaryIndex < rootsRequired; secondaryIndex++) {
            if (primaryIndex !== secondaryIndex) {
                lagrangeMultiplier *= (0 - dataPoints[secondaryIndex].x) / (primaryX - dataPoints[secondaryIndex].x);
            }
        }
        resultConstant += lagrangeMultiplier * primaryY;
    }
    if (resultConstant < 0 || resultConstant > MAX_BIT_LIMIT) {
        throw new Error(`${resultConstant} exceeds the valid range.`);
    }
    return Math.round(resultConstant);
}

function extractData(inputData) {
    const extractedPoints = [];
    const rootCount = inputData.keys.n;
    const minRoots = inputData.keys.k;

    if (rootCount < minRoots) {
        throw new Error(`The number of roots (n) must be at least the minimum required roots (k).`);
    }

    for (const rootKey in inputData) {
        if (!isNaN(parseInt(rootKey))) {
            const rootX = parseInt(rootKey);
            const rootBase = parseInt(inputData[rootKey].base);
            const rootValue = inputData[rootKey].value;
            const decodedY = convertEncodedValue(rootBase, rootValue);
            extractedPoints.push({ x: rootX, y: decodedY });
        }
    }
    extractedPoints.sort((pointA, pointB) => pointA.x - pointB.x);
    return { extractedPoints, minRoots };
}

function discoverPolynomialConstant(filePath) {
    const inputData = JSON.parse(fileSystem.readFileSync(filePath, 'utf8'));
    const { extractedPoints, minRoots } = extractData(inputData);
    return computeLagrangeInterpolation(extractedPoints, minRoots);
}

const resultForCase1 = discoverPolynomialConstant('../data/TestCase1.json');
const resultForCase2 = discoverPolynomialConstant('../data/TestCase2.json');

console.log('Constant for Test Case 1:', resultForCase1);
console.log('Constant for Test Case 2:', resultForCase2);
