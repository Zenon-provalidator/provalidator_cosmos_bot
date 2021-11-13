const func = require('./func')
const fs = require('fs')
const CronJob = require('cron').CronJob

//console.log(func.getProvalidatorDetail())
//console.log(func.getMessage('cosmos'))
console.log(func.getProposal(57))



 



//loop
//const botJob = new CronJob(`*/5 * * * * *`, async function () {
//	let latestProposal = func.getLatestProposalNum() //latest proposal
//
//	if(latestProposal !== 0 ){
//		let callProposalNum = latestProposal+1
//		let getProposal = func.getProposalFromServer(callProposalNum)
//		
//		if(typeof getProposal === "object"){
//			console.log()
//			return `Proposal #${callProposalNum} ${getProposal.title}\n\n ${getProposal.desc}\n\nhttps://www.mintscan.io/osmosis/proposals/${callProposalNum}`
//		} else if(getProposal === 203){
//			console.log(`${callProposalNum} proposal is not found`)
//		} else{
//			console.log(`server error`)
//		}
//	}else{
//		console.log(`latestProposal is 0`)
//	}
//	
//}).start()