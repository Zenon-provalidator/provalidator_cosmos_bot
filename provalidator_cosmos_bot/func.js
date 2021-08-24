const fetch = require('sync-fetch')
require('dotenv').config()
const logger = require('./log4js').log4js//logger
const fs = require('fs')
const numeral = require('numeral')

function getMessage(coin){
	let msg = ``
	let price = ``
	let maxTokens = ``
	let stakedTokens = ``
	let totalTokens = ``
	let stakedPercent = ``
	let totalPercent = ``
	let teamTokens = ``
	let communityTokens = ``
	let communityPercent = ``
		
	try {
		//no file = create
		let file = `./json/${coin}.json`
		let rJson = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : ''
		var wdate = fs.existsSync(file) ? parseInt(rJson.wdate) + (60 * 1000) : 0
		var cdate = parseInt(new Date().getTime())
		
		if(coin == 'cosmos'){
			let cosmosInfo = getCosmosInfo()
			msg = `⚛️ <b>Cosmos (ATOM)</b>\nㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n\n`
			if( wdate <  cdate) {
				price = getCosmosPrice()
				maxTokens = (cosmosInfo.max_tokens/ 1000000).toFixed(0)
				stakedTokens = (cosmosInfo.bonded_tokens / 1000000 ).toFixed(0)
				stakedPercent = (stakedTokens / maxTokens * 100).toFixed(0)
				notStakedTokens = maxTokens - stakedTokens
				notStakedPercent = (notStakedTokens / maxTokens * 100).toFixed(0)
				prvTokens = (getProvalidator() / 1000000).toFixed(0)
				let wJson = {
					"price" : price,
					"maxTokens" : maxTokens,
					"stakedTokens" : stakedTokens,
					"stakedPercent" : stakedPercent,
					"notStakedTokens" : notStakedTokens,
					"notStakedPercent" : notStakedPercent,
					"prvTokens" : prvTokens,
					"wdate" : new Date().getTime()
				}
				fs.writeFileSync(file, JSON.stringify(wJson))
			}else{
				price = rJson.price
				maxTokens = rJson.maxTokens
				stakedTokens = rJson.stakedTokens
				stakedPercent = rJson.stakedPercent
				notStakedTokens = rJson.notStakedTokens
				notStakedPercent = rJson.notStakedPercent
				prvTokens = rJson.prvTokens
			}
			msg += `🥩<b>Staking</b>\n\n`
			msg += `💰Price: $${price}\n\n`
			msg += `🔐Staked: ${numberWithCommas(stakedTokens)} (${stakedPercent}%)\n\n`
			msg += `🔓Unstaked: ${numberWithCommas(notStakedTokens)} (${notStakedPercent}%)\n\n`
			msg += `⛓️Max Sply: ${numberWithCommas(maxTokens)} (100%)\n\n`
			msg += `❤️Staked to <b>Provalidator</b>: ${numberWithCommas(prvTokens)}\n\n`
			msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n`
			msg += `Supported by <a href='https://provalidator.com' target='_blank'>Provalidator</a>\n`
		}	

		return msg
	}catch(err){
		logger.error(`=======================func error=======================`)
		logger.error(err)
		return null
	}
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function getProvalidator(){
	let json = fetch(process.env.COSMOS_API_URL+"/staking/validator/Provalidator").json()
	return json.tokens
}

function getCosmosPrice(){
	let json = fetch('https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd').json()
	return json.cosmos.usd
}

function getCosmosInfo(){
	let json = fetch(process.env.COSMOS_API_URL+"/status").json()
	let returnArr = { 
		'bonded_tokens' : json.bonded_tokens,
		'not_bonded_tokens' : json.not_bonded_tokens,
		'max_tokens' :''
	}
	
	for(var j in json.total_circulating_tokens.supply){
		if(json.total_circulating_tokens.supply[j].denom == 'uatom'){
			returnArr.max_tokens = json.total_circulating_tokens.supply[j].amount
			break
		}
	}
	return returnArr	
}

module.exports = {
	getMessage : getMessage
}