


FoEproxy.addHandler('ItemAuctionService', 'getAuction', (data, postData) => {
	let antique = data.responseData;
	if (antique!=null) {
		if (antique.reward.id===MainParser?.Antique?.reward.id) {
			antique.followed=MainParser?.Antique.followed;
		}
		if (antique.state=="closed") {
			antique=null;
		}
		MainParser.Antique=antique;
		DB.set("Antique",MainParser.Antique);
		Quests.CalcBody();
	}
}
);

FoEproxy.addHandler('GuildExpeditionService', 'getEncounter', (data, postData) => {
	debugger;
		step=data.responseData;
});

FoEproxy.addHandler('ChallengeService', 'collectReward', (data, postData) => {
	Quests.CalcBody();
});

FoEproxy.addHandler('ChallengeService', 'getActiveChallenges', (data, postData) => {
	MainParser.Challenges = data.responseData;
	Quests.CalcBody();
});

FoEproxy.addHandler('ChallengeService', 'updateTaskProgress', (data, postData) => {
	try
	{
		let updates=data.responseData;		
		let task=MainParser.Challenges?.find(x=>x.tasks?.find(y=>y.id==updates.id)).tasks?.find(x=>x.id==updates.id);
		if (task!=null){
			task.currentProgress=updates.currentProgress;
			Quests.CalcBody();
		}
	}
	catch(e){}		
});


FoEproxy.addRequestHandler('QuestService', 'abortQuest', (postData) => {
if(postData['requestClass'] === 'QuestService' && postData['requestMethod'] === 'abortQuest'){
	let today=new Date().getDay();
	let counter=DB.get("questCounter")||{day:today,count:2000};
	if (counter.day==today) {
		counter.count--;
	}
	else 
	{
		counter.count=2000;
		counter.day=today;
	}
	DB.set("questCounter",counter);
	Quests.Abandon=counter.count;
//	Quests.UpdateCounter();
}
});

FoEproxy.addHandler('ConversationService', 'getOverviewForCategory', (data, postData) => {
	console.log("over:"+JSON.stringify(data));
	//localStorage.setItem("LimitedBuildingsAlertSet",JSON.stringify(LB));
});


FoEproxy.addHandler('ConversationService', 'getCategory', (data, postData) => {
	console.log('cat:'+JSON.stringify(data));
	//localStorage.setItem("LimitedBuildingsAlertSet",JSON.stringify(LB));
});


// After battle
// FoEproxy.addHandler('BattlefieldService', 'startByBattleType', (data, postData) => {

// 	if(postData[0]['requestData'][0]['type'] !== 'guild_expedition') {
// 		return;
// 	}
// 	let state=data.responseData.state;
// 	if (state && state.winnerBit==1 && state.ranking_data?.nextArmy==null)
// 	{
// 		//debugger;
// 		let totalContribution=0;
// 		let details=state.ranking_data.ranking.find(x=>x.player.player_id==ExtPlayerID);

// 		let GExp=DB.get("GExp")??{step:1,contribution:totalContribution,fights:1};
// 		if (GExp.fights<details.fights) {
// 			GExp.step++;
// 		}
// 		else {
// 			GExp.step=1;			
// 		}		
// 		GExp.fights=details.fights;
// 		DB.set("GExp",GExp);
// 	}
// });



let Quests = {
init: () => {		
	
},

ToogleShow:()=>{
	if ($('#Quests').length > 0) {
		HTML.CloseOpenBox('Quests');
	} else {
		Quests.Show();
	}
},

ensureShow:()=> {
	HTML.toggleMinimizeAllWindows();
	Quests.Show();
	HTML.Maximize("#Quests");
},

Show: () => {
	if ($('#Quests').length === 0) {
		HTML.AddCssFile('quests');

		HTML.Box({
			'id': 'Quests',
			'title': i18n('Boxes.Quests.Title'),
			'auto_close': true,
			'dragdrop': true,
			'minimize': true
		});
	}
	Quests.CalcBody();
},

ShowMessage:(msg) => {
  let div=document.getElementById("Cdb");
  if (div!=null) {
   div.innerText=msg.date+":"+ msg.text;
  }
},

CalcBody: () => {
	if( $('#Quests').length == 0 ){
		return;
	}
	if (MainParser.Quests==null) return;
	let content=[];
	content.push('<ol class="quests">');
	let eventQuest=MainParser.Quests.find(
		x=>x.successConditions[0].description.startsWith("Terminer") 
		&& x.successConditions[0].description.startsWith("Terminer")
		&& x.successConditions[0].flags.length==2);
	let progressEvent="";
	if (eventQuest!=null) {
		progressEvent=1-1+(eventQuest.successConditions[0].currentProgress??0);
	}
	for(let quest of MainParser.Quests){				
		let conditionGroups=quest.successConditionGroups??[];
		if (quest.category=="outpost"){ // ne pas afficher les quetes de types colonies
			continue;
		}
		if (quest.successConditions[0].description.startsWith("Terminer") 
		&& quest.successConditions[0].description.indexOf("série")>0 ) {
			continue;
		}
		if (quest.category==="events") {
			if (quest.successConditions[0].description==="")
			{
				continue;
			}
		}
		if (quest.category==="allies") {
			if (!quest.successConditions[0].description.startsWith("Terminer"))
			{
				continue;
			}
		}
		if (quest.category==="miniChallenge") {
			if (quest.successConditions[0].description.startsWith("Félicitations")
			||(quest.successConditions[0].description.startsWith("Terminer") && quest.successConditions[0].description.endsWith("tes")) 
		)
			{
				continue;
			}
		}
		content.push('<li class="quest">');
		let firstSsQuest=true;
		let isEvent=(quest.context!="");
		for(let succ of quest.successConditions) {	
						
			content.push('<ul class="quest-quest-list">');	
			let progress=succ.currentProgress??0;
			let ended="";
			if (progress==succ.maxProgress) {
				ended=" ended";		
			}
			if (succ.maxProgress>1) {
				progress=progress+" / "+succ.maxProgress;
			}
			else {
				progress="";
			}
			content.push('<li class="'+ended+" "+quest.category+'">');
				if (firstSsQuest && isEvent) {
					content.push('<span class="badge">'+progressEvent+'</span>');
					progressEvent="";
				}
				if (firstSsQuest && conditionGroups.length>0) {
					content.push('<span class="quest-cond">'+i18n("Boxes.Quests."+conditionGroups[0].type)+'</span>');
				}
				content.push('<div class="quest-description">'+succ.description+'</div>');
				content.push('<div class="quest-progress">'+progress+'</div>');
			content.push('</li>');
			content.push('</ul>');
			firstSsQuest=false;
		}
		content.push('</li>');
	}
	content.push('</ol>');

	// les challenges
	// on prend la meme presentation que pour les quetes pour le css commun
	if (MainParser.Challenges!=null && MainParser.Challenges.length>1 && MainParser.Challenges[0].tasks!=null) {
		content.push('<ol class="quests">');
		for(let challenge of MainParser.Challenges) {
			if (challenge.tasks[0].description.startsWith("Terminer un d")) {
				continue;
			}
			for(let task of challenge.tasks){					
				content.push('<li class="quest">');
				content.push('<ul class="quest-quest-list">');
				let progress=task.currentProgress??0;
				let ended="";
				if (progress==task.maxProgress) {
					ended=" ended";		
				}
				if (task.maxProgress>1) {
					progress=progress+" / "+task.maxProgress;
				}
				else {
					progress="";
				}						
					content.push('<li class='+ended+'>');
						content.push('<div class="quest-description daily">'+task.description+'</div>');
						content.push('<div class="quest-progress daily">'+progress+'</div>');
					content.push('</li>');
				content.push('</ul>');			
				content.push('</li>');
			}
		}
		content.push('</ol>');
	}

	content.push("<hr>");

	let hdv=MainParser.CityMapData["1"];
	let recolteTime=(hdv.state.next_state_transition_at!=null)?moment.unix(hdv.state.next_state_transition_at).format("HH:mm"):"maintenant";
	//content.push('<p>Récolte '+recolteTime+'</p>');
	document.querySelector("[id='QuestsHeader'] > span").innerHTML=recolteTime;
	let GExp=DB.get("GExp")??{step:0,fights:0};
	content.push('<p>Exp:<span class="badge">'+GExp?.step+'</span></p>');
	if (Quests.Abandon!=undefined) {
	  content.push("<p>quetes:"+Quests.Abandon+"</p>");
	}
	let GMscanningDate=DB.get("GMscanningDate");
	if (GMscanningDate) {
		content.push('<p>GM scanning:'+new Date(GMscanningDate).toLocaleString()+'</p>');
	}

	let cities=DB.get('Cities')||{};
	let city=cities[MainParser.CityName]??{};
	let nextProductions=city['NextProduction']??{};
	content.push('<ul class="nextProduction">');
	for(let type of Object.keys(nextProductions)) {
		content.push('<li><span class="time">'+nextProductions[type].at+'</span><span class="goods-sprite-50 ' 
		+ nextProductions[type].type+ '"></span><div class="quantity">'+nextProductions[type].q+'</div></li>');
	}
	content.push('</ul>');

	//content.push('<button class="collectTavern">Taverne '+MainParser?.Tavern?.sittings+'/'+MainParser?.Tavern?.chairs+'</button>');
	// if (MainParser.Antique){
	// 	let ant=MainParser.Antique;
	// 	let title=ant.reward.name
	// 		.replace("Amélioration du ","")
	// 		.replace("Pack de sélection de ","")
	// 		.replace("Pack de sélection du ","")
	// 		.replace("Pack de sélection ","")
	// 		.replace(/ /g,"_");
	// 	let url="https://fr.wiki.forgeofempires.com/index.php?title="+title;
	// 	let flags=(ant.reward.flags && ant.reward.flags.length>0)?ant.reward.flags[0]:"";
	// 	content.push('<ul><li>'+moment.unix(ant.transitionAt).format('HH:mm:ss')+' ['+flags+'] <a target="wiki" class="Antique" href='+url+'>'+ ant.reward.name+'</a><br/>'+ ant.startingBid+" => "+ (ant.highestBid?.amount??"-")+'</li></ul>')
	// }
	// else {
	// 	content.push("Vous ne suivez pas d'enchère");
	// }

	content.push('<div id=Cdb></div>');

	if (MainParser.Temple) {
		if ((MainParser.Temple.state.constructionFinishedAt+2205000)-moment.now()/1000 < 0) // 26 jours => alerte
		{
		  content.push('<div>Temple oublié expire le '+moment.unix(MainParser.Temple.state.constructionFinishedAt).add(28,'day').format('DD/MM HH:mm')+'</div>');
		}
	}
	else {
		content.push('Temple oublié inactif');
	}

	let players=MainParser.Players.filter(x=>x.canSabotage && x.IsNeighbor);
	if (players.length>0) {
		content.push('<div class="sabotages">');
		for(let pl of players){
			content.push('<span class="PlayerName">'+pl.PlayerName+'</span> <span class="Score">'+pl.Score+'</span>');
		}
		content.push('</div>');
	}
	// Technologies.inProgressTechnologies=DB.get("inProgressTechnologies"); 
	// if (Technologies.inProgressTechnologies!=null) {
	// 	content.push('<ul class="inProgressTechnologies">');
	// 	for(let tech of Technologies.inProgressTechnologies) {
	// 		if (tech.progress){
	// 			content.push('<li><span class="">'+tech.name+'</span><span class=""> '+(tech.progress?.currentSP??"")+"/"+(tech?.maxSP??"")+'</span>');
	// 			if (tech.requirements?.resources){
	// 				content.push('<ul>');
	// 				for(let req of Object.keys(tech.requirements.resources)) {
	// 					content.push('<li>'+GoodsData[req].name+' '+tech.requirements.resources[req]+'</li>');
	// 				}
	// 				content.push('</ul>');
	// 			}
	// 			content.push('</li>');
	// 		}
	// 	}
	// 	content.push('</ul>');
	// }

	if (Inactifs && Inactifs.length>0) {
		content.push('<div class="inactifs">');
		content.push("<h3>Inactifs</h3>");
		for(let pl of Inactifs){
			content.push('<span class="PlayerName"><b>#'+pl.rank+"</b>  "+pl.name+'</span> <span class="Score">'+HTML.Format(pl.score)+'</span>');
		}
		content.push('</div>');
	}

	$('#QuestsBody').html( content.join('') );

	// $(".collectTavern").on("click",function(){
	// 	let payload='[{"__class__":"ServerRequest","requestData":[],"requestClass":"FriendsTavernService","requestMethod":"collectReward","requestId":65}]';
	// 	let xhr = new XMLHttpRequest();
	// 	xhr.open('POST', MainParser.MainUrl);
	// 	xhr.setRequestHeader('Content-Type', 'application/json');
	// 	xhr.send(payload);
	// })

	$(".FollowAntique").on("click",function(){
		MainParser.Antique.followed=true;
		DB.set('Antique', MainParser.Antique);
		Quests.CalcBody();
	})

	
}
,



};
