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
				prvDetail = getProvalidatorDetail()//get provalidator detail info
				prvRank = prvDetail.rank
				prvRate = (prvDetail.rate * 100)
				prvTokens = (prvDetail.tokens/ 1000000).toFixed(0)
				
				let wJson = {
					"price" : price,
					"maxTokens" : maxTokens,
					"stakedTokens" : stakedTokens,
					"stakedPercent" : stakedPercent,
					"notStakedTokens" : notStakedTokens,
					"notStakedPercent" : notStakedPercent,
					"prvRank" : prvRank,
					"prvTokens" : prvTokens,
					"prvRate" :  prvRate,
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
				prvRate = rJson.prvRate
				prvTokens = rJson.prvTokens
			}
			msg += `🥩<b>Staking</b>\n\n`
			msg += `💰Price: $${price}\n\n`
			msg += `🔐Staked: ${stakedPercent}% / 🔓Unstaked: ${notStakedPercent}%\n\n`
//			msg += `🔐Staked: ${numberWithCommas(stakedTokens)} (${stakedPercent}%) / 🔓Unstaked: ${numberWithCommas(notStakedTokens)} (${notStakedPercent}%)\n\n`
			msg += `⛓️Max Sply: ${numberWithCommas(maxTokens)} (100%)\n\n`
			msg += `<b>Stake ATOM with ❤️Provalidator</b>\n\n`
			msg += `<b>🏆Validator Ranking: #${prvRank}</b>\n\n`
			msg += `<b>🔖Commission: ${prvRate}%</b>\n\n`
			msg += `<b>🤝Staked: ${numberWithCommas(prvTokens)}</b>\n\n`
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

function getProposal(num){
	let title = ''
	let jsonLocal = getProposalFromLocal(num)
	//PROPOSAL_STATUS_DEPOSIT_PERIOD | PROPOSAL_STATUS_VOTING_PERIOD | PROPOSAL_STATUS_PASSED | PROPOSAL_STATUS_REJECTED
	if(jsonLocal === 0 || jsonLocal === false){//not found json file from local
		let jsonServer = getProposalFromServer(num) //get server data 
		if(jsonServer === 203){//not found
			return "Not found proposal #" + num
		} else if(jsonServer === 500 || jsonServer === false){//internal error
			return "Sorry! bot has error."
		}else{
			title = jsonServer.title
		}
	} else {
		//proposal is not fixed
		if(jsonLocal.status === "PROPOSAL_STATUS_PASSED" || jsonLocal.status === "PROPOSAL_STATUS_REJECTED"){
			title = jsonLocal.title
		} else{
			let jsonServer = getProposalFromServer(num) //get server data
			title = jsonServer.title
		}
	}
	let prvDetail = getProvalidatorDetail()//get provalidator detail info
	let prvRank = prvDetail.rank
	let prvRate = (prvDetail.rate * 100)
	let prvTokens = (prvDetail.tokens/ 1000000).toFixed(0)
	let msg = `<b>⚛️ COSMOS ($ATOM) Governance</b>\n` 
	msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n\n`
	msg += `<b>🗳️Proposal</b>\n\n`
	msg += `#${num} ${title}\n\n`
	msg += `📌<a href='https://www.mintscan.io/cosmos/proposals/${num}'>https://www.mintscan.io/cosmos/proposals/${num}</a>\n\n`
	msg += `🔍If you search for other proposals [/proposal number]\n\n`
	msg += `<b>Stake ATOM with ❤️Provalidator</b>\n\n`
	msg += `<b>🏆Validator Ranking: #${prvRank}</b>\n\n`
	msg += `<b>🔖Commission: ${prvRate}%</b>\n\n`
	msg += `<b>🤝Staked: ${numberWithCommas(prvTokens)}</b>\n\n`
	msg += `ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ\n`
	msg += `Supported by <a href='https://provalidator.com' target='_blank'>Provalidator</a>\n`
	return msg
}

function getProposalFromServer(num){ //write Proposal json
	let json = fetch(process.env.COSMOS_API_URL+"/gov/proposal/"+num).json()
	let file = './json/proposals/' + num + '.json'
	let wJson = {}
	//logger.info(json)
	
	try{
		if(typeof json.proposal_id !== "undefined"){
			wJson = {
				"id" : json.proposal_id, 
				"title" : json.title, 
				"desc" : json.description, 
				"status" : json.proposal_status
			}
			fs.writeFileSync(file, JSON.stringify(wJson))
			return wJson
		} else{
			//203 not found , 500 error
			return json.error_code
		}		
	}catch(err){
		logger.error(`=======================getProposalFromServer error=======================`)
		logger.error(json)
		return false
	}
}

function getProposalFromLocal(num){//read Proposal json
	let file = './json/proposals/' + num + '.json'
	try{
		if(fs.existsSync(file)){
			return JSON.parse(fs.readFileSync(file))
		} else {
			return 0
		}
	} catch(err){
		logger.error(`=======================getProposalFromJson error=======================`)
		logger.error(json)
		return false
	}
}

function getLatestProposalNum(){
	let latestProposal = 0
	
	try{
		var files = fs.readdirSync('./json/proposals')
		for(var i = 0; i < files.length; i++){
			latestProposal = parseInt(files[i].replace(/\.[^/.]+$/, ""))
		}
		return latestProposal
	} catch(err){
		return 0
	}
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
function getProvalidatorDetail(){
	let json = fetch(process.env.COSMOS_API_URL+"/staking/validators").json()
	let obj = {};
	for(var i in json){
		if(process.env.PROVALIDATOR_OPERATER_ADDRESS === json[i].operator_address){			
			obj.rank = json[i].rank
			obj.rate = json[i].rate
			obj.tokens = json[i].tokens
		}
	}
	return obj	
}

module.exports = {
	getMessage : getMessage,
	getProvalidatorDetail : getProvalidatorDetail,
	getProposal : getProposal,
	getProposalFromServer : getProposalFromServer,
	getProposalFromLocal : getProposalFromLocal,
	getLatestProposalNum : getLatestProposalNum
}