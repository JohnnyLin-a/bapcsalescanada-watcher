import axios from "axios"
import * as cheerio from "cheerio"
import { setTimeout } from "timers/promises"
import * as fs from "fs"

/**
 * Entrypoint to this app.
 */
interface Config {
    urls: string[]
    discordWebhook: string
    discordMention: string
}

const config: Config = process.env.BAPCSALESCANADA_WATCHER_CONFIG
    ? JSON.parse(process.env.BAPCSALESCANADA_WATCHER_CONFIG)
    : require("./bapcsalescanada-watcher-config.json")

// Read history
let history: any
try {
    history = require("./history/history.json")
} catch (e) {
    console.log("Failed to read history")
    process.exit(1)
}

;(async () => {
    // Iterate over each urls
    for (let url of config.urls) {
        await setTimeout(3000)
        // Get all posts
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
            },
        })

        const $ = cheerio.load(response.data)
        const allPosts: string[] = []
        $(".scrollerItem.Post h3").each((i, e) => {
            allPosts.push($(e).text())
        })

        // Create history entry if doesn't exist
        if (typeof history[url] === "undefined") {
            history[url] = ""
        }

        // Sort posts from old to new, and send new posts that are not already sent
        let msg = ""
        for (let post of allPosts) {
            if (post == history[url]) {
                break
            }
            msg += post + "\n"
        }
        history[url] = allPosts[0]

        if (msg) {
            axios.post(config.discordWebhook, {
                content: `${config.discordMention}\n${msg}`,
            })
        }
    }
    // Finally save history
    fs.writeFileSync("history/history.json", JSON.stringify(history))
})()
