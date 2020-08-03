const fetch = require('node-fetch')
const { getBase64 } = require("./fetcher");

const artinama = async function(nama) {
    const response = await fetch('https://scrap.terhambar.com/nama?n='+nama)    
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return `Arti Nama *${nama}*\n\n${json.result.arti}`
}

const bijak = async () => {
    const response = await fetch('https://api.terhambar.com/qts/')
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return `*KATA BIJAK*\n\n${json.quotes}`
}

const weton = async (tgl, bln, thn) => {
    const response = await fetch(`http://scrap.terhambar.com/weton?tgl=${tgl}&bln=${bln}&thn=${thn}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return json.result
}

const corona = async () => {
    const response = await fetch('https://api.terhambar.com/negara/Indonesia')
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    return `*${json.negara}*\n\nTotal: ${json.total}\nKasus Baru: ${json.kasus_baru}\nMeninggal: ${json.meninggal}\nSembuh: ${json.sembuh}\nTanggal: ${json.terakhir}`
}

const alay = async (txt) => {
    const response = await fetch('https://api.terhambar.com/bpk?kata='+txt)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return json.text
}

const namaninjaku = async (nama) => {
    const response = await fetch('https://api.terhambar.com/ninja?nama='+nama)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return json.result.ninja
}

const liriklagu = async (lagu) => {
    const response = await fetch('http://scrap.terhambar.com/lirik?word='+lagu)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) return`Lirik Lagu ${lagu}\n\n${json.result.lirik}`
}

const quotemaker = async (quotes, author = 'Daphinokio', type = 'random') => {
    const q = quotes.replace('-',' ')
    const response = await fetch(`https://terhambar.com/aw/qts/?kata=${q}&author=${author}&tipe=${type}`)
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const json = await response.json()
    if (json.status) {
        if (json.result !== '') {
            const base64 = await getBase64(json.result)
            return base64
        }
    }
}

exports.artinama = artinama;
exports.bijak = bijak;
exports.weton = weton;
exports.corona = corona;
exports.alay = alay;
exports.namaninjaku = namaninjaku;
exports.liriklagu = liriklagu;
exports.quotemaker = quotemaker;