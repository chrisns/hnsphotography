const scrape = require('website-scraper')
const replace = require('replace-in-file')
const AWS = require('aws-sdk')
const s3 = require('s3')
const del = require('del')

const awsS3Client = new AWS.S3({
  region: "eu-west-2",
  signatureVersion: 'v4'
});

const client = s3.createClient({
  s3Client: awsS3Client,
  s3Options: {
    region: "eu-west-2",
  },
})

const params = {
  localDir: "/tmp/downloads",
  deleteRemoved: true,
  s3Params: {
    Bucket: "www.hnsphotography.co.uk",
    ACL: "public-read",
    Prefix: "",
  },
};

const options = {
  urls: ['https://builder.pagevamp.com/build/1954128424859209/pages'],
  directory: '/tmp/downloads',
  requestConcurrency: 50,
  recursive: true,
  prettifyUrls: true,
  // logPath: "/tmp/downloads/logs",
  urlFilter: (url) =>
    url.indexOf('https://builder.pagevamp.com/build/1954128424859209/') === 0 ||
    url.indexOf('https://builder.pagevamp.com/css') === 0 ||
    url.indexOf('https://builder.pagevamp.com/js') === 0 ||
    url.indexOf('https://builder.pagevamp.com/img') === 0 ||
    url.indexOf('https://builder.pagevamp.com/review/sliders/css') === 0 ||
    url.indexOf('https://builder.pagevamp.com/launcher/') === 0 ||
    url.indexOf('https://builder.pagevamp.com/themes') === 0 ||
    url.indexOf('https://scontent') === 0 ||
    url.indexOf('https://platform-lookaside.fbsbx.com') === 0 ||
    url.indexOf('https://pagevamp-uploads.s3.amazonaws.com') === 0,
}

const replace_options = {
  files: '/tmp/downloads/**.html',
  from: /UA-39234468-4/g,
  to: 'UA-110236971-1',
}

const handler = (event, context, callback) =>
  del('/tmp/downloads', { force: true })
    .catch(err => callback(err))
    .then(() => scrape(options))
    .then(() => replace(replace_options))
    .then(() => new Promise((resolve, reject) => {
      console.log("uploading")
      let uploader = client.uploadDir(params)
      uploader.on('error', reject)
      uploader.on('end', resolve)
    }))
    .then(() => callback(null, true))

exports.handler = handler