const fs = require('fs');
const { URL } = require('url');
const db = require('../bind-prisma');
const { composeHTMLEmail } = require('./index');

/** Converts feeds with item to HTML and saves in folder "digest". */
const generateHTML = async () => {
    try {
        const feeds = await db.query.feeds({ last: 10 }, `{
        url
        title
        items {
            title
            description
            link
            pubDate
            imageUrl
            enclosures {
                url
                type
            }
        }}`);

        for (const [idx, feed] of feeds.entries()) {
            const { html } = composeHTMLEmail(feed, feed.items);
            const dir = `${__dirname}/digests`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            const filename = `${idx}-${new URL(feed.url).hostname}`;
            fs.writeFileSync(`${dir}/${filename}.html`, html);
        }
    } catch (e) {
        console.error(e);
    }
};

generateHTML();
