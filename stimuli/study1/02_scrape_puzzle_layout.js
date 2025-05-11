const date = "2025-01-08"

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

async function generateNameData(link) {
    let collection_name, level_name, level_id, collection_id;
    const parts = link.split('/');
    // console.log(link)
    // console.log(parts)
    const author = parts[parts.length - 3]
    // console.log(author)

    // Define the exception cases
    const exceptionStrings = [
        "/play/web-archive/aymeric-du-peloux/loma",
        "/play/web-archive/thinking-rabbit/boxxle",
        "/play/web-archive/thinking-rabbit/boxxle-ii",
    ];

    try {
        // If the link contains any of the exception strings, go straight to the except block
        if (exceptionStrings.some(str => link.includes(str))) {
            throw new Error(`Link contains exception string`);
        }

        const { data: html } = await axios.get(link, { headers });
        const $ = cheerio.load(html);

        const puzzle_title = $('h2.puzzle-title').text().trim();; // adventure #1, microban #40, etc 
        //collection_name = parts[6]; // weird edge case with aymeric-du-peloux/loma, thinking-rabbit/boxxle,thinking-rabbit/boxxle-ii
        collection_name = puzzle_title.split(' #')[0].split(' ').join('-'); // adventure, microban, etc 
        // const collection = `collection-${levelParts[0].padStart(3, '0')}`; // e.g., "collection-133"
        level_name = puzzle_title.split(' #')[puzzle_title.split(' #').length - 1]; // e.g., "level-20"
        level_id = parseInt(level_name); // "1"

    } catch (error) {
        console.error(`generateNameData: error processing ${link} or exception collection:`, error.message);
        collection_name = parts[6]; // adventure, microban, etc 
        const levelParts = parts[parts.length - 1]; // e.g., ["133183", "adventure-20"]
        // const collection = `collection-${levelParts[0].padStart(3, '0')}`; // e.g., "collection-133"
        level_name = levelParts.split('-')[levelParts.split('-').length - 1]; // e.g., "level-20"
        level_id = parseInt(level_name); // "1"
    }

    // Get the current day (e.g., "2024-12-12")
    const glean_date = new Date().toISOString().split('T')[0];

    const pack_type = parts[4]; // e.g., "community" or "web-archive"
    //const basePath = parts.slice(3, parts.length - 1).join('-'); // e.g., "jonathan-handojo-adventure"
    const levelParts = parts[parts.length - 1]; // e.g., ["133183", "adventure-20"]
    collection_id = parseInt(levelParts.split(/[_-]/[0])); // e.g., "133"

    //return `${glean_date}/${pack_type}/${collection_name}/level-${level_name}.json`;
    return {
        "collection_id": collection_id, // "microban"
        "collection_name": collection_name, // 234
        "level_id": level_id, // 1
        "level_name": level_name, // "1"
        "glean_date": glean_date, // 2024-12-13
        "pack_type": pack_type, // e.g., "community" or "web-archive"
        "author": author // "eric-f-tchong"
    };
} 

async function getPuzzleLayout(link, browser) {
    // Launch a browser instance
    // console.time('get layout');
    const page = await browser.newPage();

    //Use Puppeteer to block images, stylesheets, or other non-essential resources for faster loading:
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    // Navigate to the target URL
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 0}); // Replace with the actual URL

    // Wait for `window.qb.c` and `Base64.decode` to be available
    await page.waitForFunction(() => typeof window.qb !== 'undefined' && typeof Base64 !== 'undefined');

    // Call the function and retrieve the result
    const decodedValue = await page.evaluate(() => {
        // Ensure the `Base64` and `window.qb.c` are available
        if (typeof Base64 !== 'undefined' && typeof window.qb.c !== 'undefined') {
            return Base64.decode(window.qb.c);
        }
        console.log("layout not found for: ", link)
        return '';
    });

    // console.log('Decoded value:', decodedValue);
    // console.timeEnd('get layout');
    return decodedValue
}

async function saveResultToFile(result, directoryPath, filename) {
    try {
        const fullDirPath = path.join(directoryPath, path.dirname(filename));
        if (!fs.existsSync(fullDirPath)) {
            fs.mkdirSync(fullDirPath, { recursive: true });
        }

        const filePath = path.join(directoryPath, filename);
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`Results saved to ${filePath}`);
    } catch (error) {
        console.error('Error saving results:', error.message);
    }
}

(async () => {
    const baseUrl = "https://www.sokobanonline.com";

    console.log("getting allPuzzlePageLinks ...")
     // testing specific puzzles
    // const allPuzzleLinks = [
    //     "/play/web-archive/thinking-rabbit/boxxle/4_no-01-04"
    // ]
    const data = fs.readFileSync('allPuzzleURLs.txt', 'utf-8');
    const allPuzzleLinks = JSON.parse(data);

    // loop through all puzzle urls
    console.log("looping through all puzzles ...")

    // if only doing some of the puzzles 
    let targetExists = false;
    const targetValue = "/play/web-archive/alberto-garcia/1-1/3374_1-1-2"
    let targetReached = false; // Flag to track if the target has been reached

    const browser = await puppeteer.launch({ headless: true }); // Set `headless: true` for headless mode
    // Interval control variables
    const intervalDuration = 3 * 60 * 1000; // minutes in milliseconds
    let lastPause = Date.now();

    for (const url of allPuzzleLinks) {
        // Skip steps until the target value is reached

        if (targetExists){
            if (!targetReached) {
                if (url !== targetValue) {
                    // console.log(`Target value not reached: ${u}`)
                    continue;
                }
                // Mark target as reached
                targetReached = true;
                console.log(`Target value reached: ${url}`);
            }
        }

        const link = baseUrl + url
        // console.log(url)

        // console.log("start generateNameData")
        const NameData = await generateNameData(link);
        const collection_id = NameData["collection_id"];
        const collection_name = NameData["collection_name"];
        const level_id = NameData["level_id"];
        const level_name = NameData["level_name"];
        const glean_date = NameData["glean_date"];
        const pack_type = NameData["pack_type"];
        const author = NameData["author"];

        const filename = `${pack_type}/${author}/${collection_name}/level-${level_name}.json`;
        // example: "stimuli/sokobanonline/{date}/puzzleLayout/web-archive/{author}/Aruba/level-1.json"

        // console.log("extracting puzzle layout ...")
        const decodedValue = await getPuzzleLayout(link,browser)
        const splitLayout = decodedValue.split("\n");

        const output_json = {
            //"Puzzle Title": puzzleTitleText,
            "collection_id": collection_id, // "microban"
            "collection_name": collection_name, // 234
            "level_id": level_id, // 1
            "level_name": level_name, // "1"
            "author_name": author,
            // "author_link": authorLink,
            "puzzle_link": url,
            "glean_timestamp": new Date().toISOString(), // Add current datetime in ISO format
            // "publish date": publishDate,
            "layout_string": decodedValue,
            "layout": splitLayout
        }

        const outputDirectory = path.join(__dirname, 'sokobanonline', 'puzzleLayout', 'all');


        await saveResultToFile(output_json, outputDirectory, filename);

        // Check if minutes have passed since the last pause
        if (Date.now() - lastPause >= intervalDuration) {
            console.log("Pausing execution for 20 seconds...");
            browser.close(); 
            await new Promise(resolve => setTimeout(resolve, 10 * 1000)); // Pause for 1 minute
            lastPause = Date.now();
            browser = await puppeteer.launch({ headless: true }); // Set `headless: true` for headless mode
        }
    }
    // Close the browser when all tasks are done
    await browser.close();  
})();