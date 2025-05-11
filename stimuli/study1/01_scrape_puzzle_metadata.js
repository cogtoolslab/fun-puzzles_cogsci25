const date = "2025-01-08"

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
// const puppeteer = require('puppeteer');

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

async function generateNameData(link) {
    let collection_name, level_name, level_id, collection_id;
    const parts = link.split('/');
    // console.log(link)

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
        collection_name = puzzle_title.split(' #')[0].split(' ').join('-'); // adventure, microban, etc 
        // const collection = `collection-${levelParts[0].padStart(3, '0')}`; // e.g., "collection-133"
        level_name = puzzle_title.split(' #')[puzzle_title.split(' #').length - 1]; // e.g., "level-20"
        level_id = parseInt(level_name); // "1"

    } catch (error) { //OR EDGE CASE PUZZLE
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
        "pack_type": pack_type // e.g., "community" or "web-archive"
    };
}

async function extractMetaData(url) {
    try {
        const { data: html } = await axios.get(url, { headers });
        const $ = cheerio.load(html);

        const likevotesText = $('.likevotes').text().trim();
        const [likes, dislikes] = likevotesText.split(',').slice(0, 2).map(v => parseInt(v.split()[0], 10));
        const totalVotes = likes + dislikes;
        const likeRatio = totalVotes ? likes / totalVotes : 0;
        const dislikeRatio = totalVotes ? dislikes / totalVotes : 0;

        let authorSection = $('label:contains("Original puzzle published by")');
        if (!authorSection.length) {
            authorSection = $('label:contains("Built By")');
        }
        const authorInfo = authorSection.next('.value').find('a');
        const authorName = authorInfo.text().trim() || "Author not found";
        const authorLink = authorInfo.attr('href') || "Link not found";

        const backToLink = $('a').filter((i, el) => $(el).text().startsWith("← Back to")).attr('href') || null;
        const publishDateSection = $('label:contains("Publish Date")');
        const publishDate = publishDateSection.next('.value').text().trim() || null;

        const numPlayed = parseInt($('#num-played').text().replace(/,/g, ''), 10);
        const numSolved = parseInt($('#num-solved').text().replace(/,/g, ''), 10);

        const statisticsSection = $('li:contains("Uniquely Solved:")');
        const uniquelySolved = statisticsSection.length
            ? parseInt(statisticsSection.text().split("Uniquely Solved:")[1].trim().replace(/,/g, ''), 10)
            : "???";

        const topSolutions = [];
        const topSolutionsSection = $('h2:contains("Top Solutions")').next('ul.scores');
        if (topSolutionsSection.length) {
            topSolutionsSection.find('li.clearfix').each((i, el) => {
                // const steps = $(el).attr('data-steps');
                // const rank = $(el).attr('data-rank');
                const steps = parseInt($(el).attr('data-steps').replace(/,/g, ''), 10); // Convert steps to a number
                const rank = parseInt($(el).attr('data-rank').replace(/,/g, ''), 10); // Convert rank to a number

                const players = $(el).find('.people a[href!="#more"]').map((j, a) => $(a).text()).get();

                // Check for "#more" link
                const moreLink = $(el).find('.people .ao a[href="#more"]');
                let num_more_players = 0;
                if (moreLink.length) {
                    const moreText = moreLink.text();
                    const match = moreText.match(/(\d+)\s+others/);
                    if (match && match[1]) {
                        num_more_players = parseInt(match[1].replace(/,/g, ''), 10);
                    }
                }

                const num_players = players.length + num_more_players;

                topSolutions.push({ rank, steps, num_players });
            });

        }

        // console.log("start generateNameData")
        const NameData = await generateNameData(url);
        const collection_id = NameData["collection_id"];
        const collection_name = NameData["collection_name"];
        const level_id = NameData["level_id"];
        const level_name = NameData["level_name"];
        const glean_date = NameData["glean_date"];
        const pack_type = NameData["pack_type"];

        const filename = `${pack_type}/${collection_name}/level-${level_name}.json`;

        return [{
            //"Puzzle Title": puzzleTitleText,
            "collection_id": collection_id, // "microban"
            "collection_name": collection_name, // 234
            "level_id": level_id, // 1
            "level_name": level_name, // "1"
            "author_name": authorName,
            "author_link": authorLink,
            "puzzle_link": url,
            "glean_timestamp": new Date().toISOString(), // Add current datetime in ISO format
            "publish date": publishDate,
            "likes": likes,
            "dislikes": dislikes,
            // "like_ratio": likeRatio,
            // "dislike_ratio": dislikeRatio,
            "num_played": numPlayed,
            "num_solved": numSolved,
            "uniquely_solved": uniquelySolved,
            "top solutions": topSolutions
        },
            filename];
    } catch (error) {
        console.error(`extractMetaData: error processing ${url}:`, error.message);
        return null;
    }
}

async function getAllCollectionLinks(url, baseUrl) {
    try {
        const packPageLinks = await getAllPageLinks(url, baseUrl)
        // console.log("packPageLinks", packPageLinks)

        const authorLinks = []
        // get all authorlinks off each page 
        for (const packPageURL of packPageLinks) {
            try {
                // Fetch the webpage
                const { data: html } = await axios.get(packPageURL);
                const $ = cheerio.load(html);
    
                // Select all <h1><a> links inside the pack list
                $('.pack-list ul li h1 a').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href) {
                        authorLinks.push(href);
                    }
                });
            } catch (error) {
                console.error(`Error fetching ${packPageURL}:`, error.message);
            }
        }
        //console.log(authorLinks)

        const collectionPageLinks = []
        // for each author, get all puzzle pages
        for (const authorLink of authorLinks) {
            try {
                const authorCollectionPageLinks = await getAllPageLinks(authorLink, baseUrl)
                // console.log("authorCollectionPageLinks", authorCollectionPageLinks)
                collectionPageLinks.push(...authorCollectionPageLinks)
            } catch (error) {
                console.error(`Error fetching ${authorLink}:`, error.message);
            }
        }
        // console.log("collectionPageLinks", collectionPageLinks)

        const collectionLinks = []
        // for each author/puzzle page, get all puzzle collections 
        for (const collectionPageURL of collectionPageLinks) { // can insert a subset of collectionPageLinks to test
            try {
                // Fetch the webpage
                const { data: html } = await axios.get(collectionPageURL);
                const $ = cheerio.load(html);
    
                // Select all <h1><a> links inside the pack list
                $('.pack-list ul li h1 a').each((_, el) => {
                    const href = $(el).attr('href');
                    if (href) {
                        collectionLinks.push(href);
                    }
                });
            } catch (error) {
                console.error(`Error fetching ${collectionPageURL}:`, error.message);
            }
        }
        // console.log("collectionLinks", collectionLinks)
        // console.log(collectionLinks.length)

        return collectionLinks;
    } catch (error) {
        console.error(`Error processing ${baseUrl}:`, error.message);
    }
}

async function getAllPageLinks(url, baseUrl) {
    try {
        const { data: html } = await axios.get(`${baseUrl}${url}`);
        const $ = cheerio.load(html);
        const links = [];
        const pageNumbers = [];

        // Extract all pagination items
        $('div.pagination ul li').each((i, el) => {
            const link = $(el).find('a').attr('href');
            const text = $(el).find('a').text().trim();

            if (link && text !== "…" && !isNaN(text)) {
                pageNumbers.push({ page: parseInt(text, 10), url: `${baseUrl}${link}` });
            }
        });

        if (pageNumbers.length == 0) {
            return [baseUrl + url];
        }

        // Sort page numbers and fill in the gaps
        pageNumbers.sort((a, b) => a.page - b.page);

        if (pageNumbers.length === 0) return links;

        const firstPage = pageNumbers[0].page;
        // console.log("firstPage", firstPage)
        const lastPage = pageNumbers[pageNumbers.length - 1].page;

        for (let i = firstPage; i <= lastPage; i++) {
            const page = pageNumbers.find((p) => p.page === i);
            // console.log("page", page)

            if (page) {
                if (page.page == 1) {
                    links.push(`${baseUrl}${url}/page-1`);
                } else {
                    links.push(page.url);
                }
            } else {
                const inferredLink = `${baseUrl}${url}/page-${i}`;
                links.push(inferredLink);
            }
        }

        return links;
    } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
    }
}

async function getPuzzleLinks(url) {
    try {
        // Fetch the webpage
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        const links = [];

        // Look for the puzzle-grid class and extract hrefs from titles
        $('.puzzle-grid ul li h1 a').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                links.push(href);
            }
        });

        return links;
    } catch (error) {
        console.error(`Error fetching the page: ${error.message}`);
        return [];
    }
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

// note: some collections have weird naming scheme ()
// const urls = [ // puzzle collections with edge cases
//     "/play/web-archive/aymeric-du-peloux/loma",
//     "/play/web-archive/thinking-rabbit/boxxle",
//     "/play/web-archive/thinking-rabbit/boxxle-ii",
// ];

// Main code to run
(async () => {
    const baseUrl = "https://www.sokobanonline.com";
    const packUrls = ["/play/web-archive"]

    // 1) TEST SPECIFIC PUZZLES AND/OR COLLECTIONS
    const allCollectionLinks = [ // puzzle collections
        //"/play/web-archive/david-w-skinner/microban",
        "/play/web-archive/edwin-abbot/flatland",
        "/play/web-archive/thinking-rabbit/boxxle"
    ];

    // // 2) EXTRACT ALL PUZZLES AND SAVE
    // console.log("getting allCollectionLinks ...")
    // const allCollectionLinks = []; // get all collections under each author 
    // for (const u of packUrls) {
    //     const collectionLink = await getAllCollectionLinks(u, baseUrl);
    //     allCollectionLinks.push(...collectionLink); // Spread operator to flatten arrays
    // }
    // console.log("allCollectionLinks", allCollectionLinks)
    // fs.writeFileSync('collectionURLs.txt', JSON.stringify(allCollectionLinks), 'utf-8');

    const allPageLinks = []; // get all pages of puzzles in a collection
    for (const u of allCollectionLinks) {
        const pageLink = await getAllPageLinks(u, baseUrl);
        allPageLinks.push(...pageLink); // Spread operator to flatten arrays
    }
    // console.log(allPageLinks)

    const allPuzzleLinks = []; // use this to save page and puzzle links
    for (const link of allPageLinks) { // get all puzzles in a collection
        const puzzleLinks = await getPuzzleLinks(link);
        allPuzzleLinks.push(...puzzleLinks); // Spread operator to flatten arrays
    }
    // fs.writeFileSync('allPuzzleURLs.txt', JSON.stringify(allPuzzleLinks), 'utf-8');

    // // 3) load from all puzzles and collections 
    // const data = fs.readFileSync('allPuzzleURLs.txt', 'utf-8');
    // const allPuzzleLinks = JSON.parse(data);

    // console.log(allPuzzleLinks)
    const outputDirectory = path.join(__dirname, 'sokobanonline','parsedMetaData', 'all');
    // overall: fun-puzzles-glean/stimuli/sokobanonline/parsedMetaData

    for (const link of allPuzzleLinks) {
        const result = await extractMetaData(baseUrl + link);
        if (result) {
            const output = result[0]
            const filename = result[1]
            // console.log("output", output)
            // console.log("filename", filename)
            await saveResultToFile(output, outputDirectory, filename);
        }
    }

})();


