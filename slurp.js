import parser from 'fast-feed'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import request from 'superagent'
import {connect, User, Post} from './lib/models'

dotenv.load()

const username = process.argv[2]
const url = process.argv[3]

connect()

if (!username || !url) {
    console.log("Usage: slurp.js USERNAME URL")
    process.exit(1)
}


const truncate = (title) => {
    if (title.length <= 100) {
        return title
    }

    return title.substring(0, 97) + "..."
}

const parseFeed = (user) => {
    console.log("parsing feed " + url + " for " + user.name)
    return new Promise((resolve, reject) => {
        const promises = []
        request
            .get(url) 
            .buffer(true)
            .end((err, res) => {
                if (err) {
                    return reject(err)
                }
                const feed = parser.parse(res.text)
                feed.items.forEach((item) => {
                    let post = new Post({
                        author: user._id,
                        url: item.link,
                        title: truncate(item.title)
                    })
                    console.log(post.title, post.url)
                    promises.push(post.save())
                })
                const newScore = user.totalScore + feed.items.length
                promises.push(user.update({ totalScore: newScore }).exec())
                Promise
                    .race(promises)
                    .then((results) => resolve(promises.length),
                          (err) => reject(err))
            })
    })
}

User.findOne({name: username})
    .then((user) => {
        if (!user) {
            console.log("No user found with name " + username)
            process.exit(1)
        }
        return parseFeed(user)
    })
    .then((result) => {
            console.log("RESULTS", result)
            process.exit(0)
          },
          (err) => {
              console.log("ERROR", err)
              process.exit(1)
          })

