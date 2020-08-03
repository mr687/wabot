const { create, decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs-extra')
const moment = require('moment')
const tiktok = require('./lib/tiktok')
const {artinama,
    bijak,
    weton,
    corona,
    alay,
    namaninjaku,
    liriklagu,
    quotemaker} = require('./lib/functions')

const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    devtools: false,
    cacheEnabled:false,
    chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
}

const opsys = process.platform;
if (opsys == "win32" || opsys == "win64") {
serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys == "linux") {
serverOption['browserRevision'] = '737027';
} else if (opsys == "darwin") {
serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const startServer = async (from) => {
create('Imperial', serverOption)
        .then(client => {
            console.log('[DEV] Red Emperor')
            console.log('[SERVER] Server Started!')

            // Force it to keep the current session
            client.onStateChanged(state => {
                console.log('[Client State]', state)
                if (state === 'CONFLICT') client.forceRefocus()
            })

            client.onMessage((message) => {
                msgHandler(client, message)
            })
        })
}

async function msgHandler (client, message) {
    try {
        const { type, body, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message
        const { id, pushname } = sender
        const { name } = chat
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const commands = [
            '#menu',
            '#help',
            '#stiker',
            '#sticker',
            '#bijak',
            '#tiktok',
            '#artinama',
            '#weton',
            '#corona',
            '#alay',
            '#namaninjaku',
            '#quotemaker',
            '#liriklagu'
        ]
        const cmds = commands.map(x => x + '\\b').join('|')
        const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(cmds, 'gi')) : ''

        if (cmd) {
            if (!isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname))
            if (isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname), 'in', color(name))
            const args = body.trim().split(' ')
            const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
            switch (cmd[0]) {
                case '#menu':
                case '#help':
                    client.sendText(from, '😂❕ *WHATSAPP ROBOT* ❕😂\n' +
                    '\nFeatures:\n\n' +
                    '1. *#menu | #help* => Tampilkan semua fitur\n\n' +
                    '2. *#conora* => Tampilkan data corona terbaru di Indonesia\n\n' +
                    '3. *#bijak* => Tampilkan kata bijak\n\n' +
                    '4. *#liriklagu lathi* => Tampilkan lirik lagu *Lathi*\n\n'+
                    '5. *#artinama Daphinokio* => Tampilkan arti nama dari *Daphinokio*\n\n' +
                    '6. *#weton 06 08 1995* => Tampilkan weton dan watak (tgl bulan tahun)\n\n' +
                    '7. *#alay Daphinokio* => Tampilkan kalimat alay dari *Daphinokio*\n\n' +
                    '8. *#quotemaker seseorang-bebas-memilih-jalan-ninjanya Daphino rain* => Tampilkan gambar quotes (pisahkan dengan -) dengan nama *Daphino* dan gambar tema *Hujan*\n\n' +
                    '9. *#namaninjaku Daphinokio* => Tampilkan nama ninja terkeren dari *Daphinokio*\n\n' +
                    '10. *#stiker url-gambar* => Tampilkan stiker dengan url yang kamu masukkan\n\n' +
                    '11. *#stiker* => Tampilkan stiker dengan gambar yang kamu kirimkan dengan caption #stiker\n\n' +
                    '12. *#tiktok url-video* => Download video tiktok dengan url yang kamu berikan\n\n**BOT akan terus di update')
                    break
                case '#sticker':
                case '#stiker':
                    if (isMedia) {
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl)) {
                            await client.sendStickerfromUrl(from, url, { method: 'get' })
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Maaf, Url yang kamu kirim tidak valid')
                        }
                    } else {
                        client.sendText(from, 'Tidak ada gambar! Untuk membuat sticker kirim gambar dengan caption #stiker')
                    }
                    break
                case '#tiktok':
                    if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl) && url.includes('tiktok.com')) {
                            const videoMeta = await tiktok(url)
                            const filename = videoMeta.authorMeta.name + '.mp4'
                            await client.sendFile(from, videoMeta.videobase64, filename, videoMeta.NoWaterMark ? '' : 'Maaf, video tanpa watermark tidak tersedia')
                                .then(await client.sendText(from, `Metadata:\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'} \n\nDonasi: bantu aku beli dimsum dengan menyawer melalui https://saweria.co/donate/yogasakti atau mentrakteer melalui https://trakteer.id/red-emperor \nTerimakasih.`))
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'Maaf, Url yang kamu kirim tidak valid')
                        }
                    }
                    break
                case '#bijak':
                    const getBijak = await bijak()
                    client.sendText(from, getBijak);
                    break;
                case '#corona':
                    const result = await corona()
                    client.sendText(from, corona);
                    break;
                case '#artinama':
                    if (args.length == 2) {
                        const nama = args[1]
                        const result = await artinama(nama)
                        client.sendText(from, result)
                    }
                    break;
                case '#liriklagu':
                    if (args.length == 2){
                        const lagu = args[1]
                        const result = await liriklagu(lagu)
                        client.sendText(from, result)
                    }
                    break;
                case '#weton':
                    if (args.length == 4) {
                        const tgl = args[1]
                        const bln = args[2]
                        const thn = args[3]
                        const result = await weton(tgl, bln, thn)
                        client.sendText(from, result)
                    }
                    break;
                case '#alay':
                    if (args.length == 2) {
                        const kata = args[1]
                        const result = await alay(kata)
                        client.sendText(from, result)
                    }
                    break;
                case '#namaninjaku':
                    if (args.length == 2) {
                        const nama = args[1]
                        const result = await namaninjaku(nama)
                        client.sendText(from, result)
                    }
                    break;
                case '#quotemaker':
                    if (args.length == 4) {
                        const quotes = args[1]
                        const author = args[2]
                        const theme = args[3]
                        const result = await quotemaker(quotes, author, theme)
                        client.sendFile(from, result, 'quotesmaker.jpg','Quotes Maker')
                    }
                    break;
            }
        } else {
            if (!isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
            if (isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(name))
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}

process.on('Something went wrong', function (err) {
    console.log('Caught exception: ', err);
  });

function color (text, color) {
  switch (color) {
    case 'red': return '\x1b[31m' + text + '\x1b[0m'
    case 'yellow': return '\x1b[33m' + text + '\x1b[0m'
    default: return '\x1b[32m' + text + '\x1b[0m' // default is green
  }
}

startServer()
