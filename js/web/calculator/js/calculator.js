function splitNUmber(num,start,modulo) { 
	//if ((num+start)<modulo) return ""; 
	if (num<start) {
		return "";
	}
	let n=num-start; 
	let mulp=Math.floor(n/modulo);
	let rest=n-mulp*modulo; 
	let txt=""+num+" = ";
	if (start>0) {txt+= start;} 
	if (mulp>0) {txt+=" + "+mulp+"x"+modulo;} 
	if (rest>0) {txt+=" + "+rest;}; 
	return txt;	
}

function avgFP(flottant) {
  return Math.round(flottant);
}

function ff(num,start) { let n=num-start; let mulp=Math.floor(n/53);let rest=n-mulp*53; 
	}

FoEproxy.addFoeHelperHandler('QuestsUpdated', data => {
	if ($('#costCalculator').length > 0) {
		Calculator.Show();
	}
});

FoEproxy.addHandler("GreatBuildingsService","getConstruction", (data,postData) => {
	debugger;	
	Calculator.Show();
		
});

let Calculator = {

	ForderBonus: 90,
    SoundFile: new Audio(extUrl + 'vendor/sounds/message.mp3'),
    PlayerName: undefined,
    LastPlayerID: 0,
    PlayInfoSound: null,
	Rankings : undefined,
	CityMapEntity : undefined,
	LastRecurringQuests: undefined,
	ForderBonusPerConversation: true,
	DefaultButtons: [
		80, 85, 90, 'ark'
	],
	ClanId: null,
	ClanName: null,

	/**
	 * Show calculator
	 *
	 * @param action
	 * @constructor
	 */
	Show: (action = '') => {
        // moment.js global setzen
        //moment.locale(MainParser.Language);

        // close at the second click
		if ($('#costCalculator').length > 0 && action === 'menu')
		{
			HTML.CloseOpenBox('costCalculator');
			
			return;
		}

		Calculator.ForderBonusPerConversation = (localStorage.getItem('CalculatorForderBonusPerConversation') !== 'false');
		Calculator.AutoOpen = true;
        // Wenn die Box noch nicht da ist, neu erzeugen und in den DOM packen
        if ($('#costCalculator').length === 0) {
           /* let spk = localStorage.getItem('CalculatorTone');

            if (spk === null) {
                localStorage.setItem('CalculatorTone', 'deactivated');
                Calculator.PlayInfoSound = false;

            } else {
                Calculator.PlayInfoSound = (spk !== 'deactivated');
            }*/		

            HTML.Box({
				id: 'costCalculator',
				title: i18n('Boxes.Calculator.Title'),
		//		ask: i18n('Boxes.Calculator.HelpLink'),
				auto_close: true,
				dragdrop: true,
				minimize: true,
		//		speaker: 'CalculatorTone',
		//		settings: 'Calculator.ShowCalculatorSettings()',
				active_maps:"main",
				onClosed: function() { console.log("closed win");DB.set("annonceInvest","");}
				
			});

			// CSS in den DOM prügeln
			HTML.AddCssFile('calculator');
			Calculator.CurrentPlayer = parseInt(localStorage.getItem('current_player_id'));

	
			// // schnell zwischen den Prozenten wechseln
			// $('#costCalculator').on('click', '.btn-toggle-arc', function () {
			// 	Calculator.ForderBonus = parseFloat($(this).data('value'));
			// 	$('#costFactor').val(Calculator.ForderBonus);
			// 	localStorage.setItem('CalculatorForderBonus', Calculator.ForderBonus);
			// 	Calculator.Show();
			// });

			// // wenn der Wert des Archebonus verändert wird, Event feuern
			// $('#costCalculator').on('blur', '#costFactor', function () {
			// 	Calculator.ForderBonus = parseFloat($('#costFactor').val());
			// 	localStorage.setItem('CalculatorForderBonus', Calculator.ForderBonus);
			// 	Calculator.Show();
			// });

			// $('#costCalculator').on('click', '#CalculatorTone', function () {

			// 	let disabled = $(this).hasClass('deactivated');

			// 	localStorage.setItem('CalculatorTone', (disabled ? '' : 'deactivated'));
			// 	Calculator.PlayInfoSound = !!disabled;

			// 	if (disabled === true) {
			// 		$('#CalculatorTone').removeClass('deactivated');
			// 	} else {
			// 		$('#CalculatorTone').addClass('deactivated');
			// 	}
			// });

        }

        Calculator.CalcBody();		
	},

	ShowGMForPlayer:(playerId)=>{
	  Calculator.PlayerId=playerId;
	  Calculator.CalcBody();
	  Calculator.Show();
	},
	

	ForgetGM:()=>{
		let player=MainParser.Players.find(x=>x.PlayerId==Calculator.PlayerId);
		let gm=Calculator.currentGM;
		if (player.GMS) {
			player.GMS.splice(x=>x.BuildingName==gm.BuildingName);
		}
		Calculator.CalcBody();
	},

	RememberGM:()=>{
		let player=MainParser.Players.find(x=>x.PlayerId==Calculator.PlayerId);
		let gm=Calculator.currentGM;
		if (!player.GMS) {
			player.GMS=[];
		}
		player.GMS.push(gm);
		Calculator.CalcBody();
	},

	
	GetRecurringQuestsLine: () => {
		let CurrentProgress=0;
		let MaxProgress=0;
		let infoType="attention";
		let RecurringQuestString='Quete dépenser XX pf non active';
		for (let Quest of MainParser.Quests) {
			if ((Quest.questGiver.id === 'scientist' && Quest.type === 'generic' && Quest.abortable === true) || Quest.id == 933010) {
				for (let cond of Quest.successConditions) {
					CurrentProgress = cond.currentProgress !== undefined ? cond.currentProgress : 0;
					MaxProgress = cond.maxProgress;
					if ((CurrentEraID <= 3 && MaxProgress >= 3) || MaxProgress > 20) { // Unterscheidung Buyquests von UseQuests: Bronze/Eiszeit haben nur UseQuests, Rest hat Anzahl immer >15, Buyquests immer <=15						
						if (MaxProgress - CurrentProgress !== 0) {
							RecurringQuestString = HTML.Format(MaxProgress - CurrentProgress) + i18n('Boxes.Calculator.FP');
							infoType="good";
						}
						else {
							RecurringQuestString = i18n('Boxes.Calculator.Done');
							infoType="attention";
						}
					}
				}
			}
		}
		return {
			questModulo:MaxProgress,
			currentProgress:CurrentProgress,
			info:RecurringQuestString,
			infoType:infoType
		}
	},


	
	/**
	 * The table body with all functions
	 */
	CalcBody: ()=> {		
debugger;
	//	if (!Calculator.CityMapEntity || !Investment.State) return;


		h = [];

let bb=Calculator.Rankings;
	let currentGM={};
	currentGM.BuildingName =(MainParser.CityEntities!=null)?MainParser.CityEntities[Calculator.CityMapEntity['cityentity_id']]['name']:"";
	currentGM.Level = (Calculator.CityMapEntity['level'] !== undefined ? Calculator.CityMapEntity['level'] : 0);
	currentGM.MaxLevel=(Calculator.CityMapEntity['max_level'] !== undefined ? Calculator.CityMapEntity['max_level'] : 0);
	currentGM.OwnerId=Calculator.PlayerId;
	currentGM.FPRequired=parseInt(Investment.State.state.forge_points_for_level_up,10);
	if (!currentGM.FPRequired) return;
	currentGM.FPInvests=parseInt(Investment.State.state.invested_forge_points??0,10);
	currentGM.NextUp=parseInt(Investment.State.state.next_state_transition_at,10);
	currentGM.Dt=new Date();
	Calculator.currentGM=currentGM;


	if (Investment.State){
		if (Investment.State.player_id==Calculator.CurrentPlayer) {
			Calculator.CalcMyInvest();
			return;
		}
	}
	Calculator.CalcSnip();
	},
	
	

	CalcMyInvest: ()=> {
		let taux=1.9;
		Calculator.CleanRankings();
		let html=[];

		let currentGM=Calculator.currentGM;
		//currentGM.FPInvests=currentGM.FPInvests??0;
		//let player=MainParser.Players.find(x=>x.PlayerId==currentGM.OwnerId);
		let player=PlayerDict[currentGM.OwnerId];
		if (player==null) {
			player={PlayerID:0,PlayerName:""}
		}
		let img="";//PlayersPopin.GetPortrait(player.PlayerID);
		let resteToInvest=Calculator.currentGM.FPRequired-Calculator.currentGM.FPInvests;
		html.push('<img class="mini-portrait" src="'+img+'"/>');
		html.push('<span class="player-name">' + player.PlayerName + '</span>');
		
		let quest=Calculator.GetRecurringQuestsLine();
		html.push('<p class="header"><strong><span class="building-name">' + currentGM.BuildingName + '</span> <span>('+currentGM.Level+'/'+currentGM.MaxLevel+')</span>');
		html.push('<p>FP : '+currentGM.FPInvests+' / '+ currentGM.FPRequired+' &nbsp; &nbsp;<span class="rest">Reste : '+resteToInvest+'</span> &nbsp; &nbsp; ');
		html.push('<span class="'+quest.infoType+'">'+quest.info+'</span></p>');  

		let bestReward=0;
		let bestPlace=1;
		let toSecure=0;
		let secPlaces=resteToInvest;
		let place="";
		let toSec={pf:resteToInvest,rank:0,cl:'green',annonce:''};
		let tauxJS=DB.get("investissementTauxs")??{t1:1.9,t2:1.9,t3:1.9,t4:1.9,t5:1.9};
		let tauxs=[0,tauxJS.t1??1.9,tauxJS.t2??1.9,tauxJS.t3??1.9,tauxJS.t4??1.9,tauxJS.t5??1.9];
		for(let ranking of Calculator.Rankings)
		{
			if (ranking.rank>=5) break;
			if (ranking.player.is_self) continue;			
			taux=tauxs[ranking.rank];
			if (ranking.forge_points>=ranking.reward.strategy_point_amount*taux) {				
				continue;
			}
			if (resteToInvest<ranking.reward.strategy_point_amount*taux) {				
				continue;
			}
			toSec.pf=resteToInvest-ranking.reward.strategy_point_amount*taux*2;
			if (toSec.pf<0)
			{
				toSec.pf=0;
				toSec.cl='red';
			}
			toSec.rank=ranking.rank;
			toSec.annonce="P"+ranking.rank+"("+ Math.round(ranking.reward.strategy_point_amount*taux)+")";
			break;
		}

		let totalRewards=0;
		let i=1;
		for(let ranking of Calculator.Rankings)
		{
			if (ranking.player.is_self) continue;
			if (i>5) break;
			taux=tauxs[i];
			totalRewards+=ranking.reward.strategy_point_amount*taux;
			i++;
		}




		for(let ranking of Calculator.Rankings)
		{
			if (ranking.forge_points<ranking.reward.strategy_point_amount*taux) {
				bestPlace=ranking.rank;
				toSecure=resteToInvest-ranking.reward.strategy_point_amount*taux*2;
				break;
			}
		}
		
		
	
		let annonce="";
		
		let p1=Calculator.Rankings.find(x=>x.rank==1);
		taux=tauxs[1];
		let rewardP1=Math.ceil(p1.reward.strategy_point_amount*taux);
		let secureP1=0;
		let secure=0;
		if (p1.forge_points<rewardP1) {
			secureP1=resteToInvest-2*rewardP1;
			secure=secureP1;
			annonce='P1('+rewardP1+')';
		}
		taux=tauxs[2];
		let p2=Calculator.Rankings.find(x=>x.rank==2);
		let rewardP2=Math.ceil(p2.reward.strategy_point_amount*taux);
		let secureP2=0;
		if (p2.forge_points<rewardP2) {
			secureP2=resteToInvest-2*rewardP2;
			secure=Math.max(secureP1,secureP2);
			if (secureP2<=secureP1) {
				annonce+=' P2('+rewardP2+')';
			}
		}
		taux=tauxs[3];
		let p3=Calculator.Rankings.find(x=>x.rank==3);
		let rewardP3=Math.ceil(p3.reward.strategy_point_amount*taux);
		let secureP3=0;
		if (p3.forge_points<rewardP3) {
			secureP3=resteToInvest-2*rewardP3;
			secure=Math.max(secureP1,secureP2,secureP3);
			if (secureP3<=secureP2) {
				annonce+=' P3('+rewardP3+')';
			}
		}
		taux=tauxs[4];
		let p4=Calculator.Rankings.find(x=>x.rank==4);
		let rewardP4=Math.ceil(p4.reward.strategy_point_amount*taux);
		let secureP4=0;
		if (p4.forge_points<rewardP4) {
			secureP4=resteToInvest-2*rewardP4;
			secure=Math.max(secureP1,secureP2,secureP3,secureP4);
			if (secureP4<=secureP3) {
				annonce+=' P4('+rewardP4+')';
			}
		}
		taux=tauxs[5];
	//	debugger;
		let p5=Calculator.Rankings.find(x=>x.rank==5);
		let rewardP5=Math.ceil(p5.reward.strategy_point_amount*taux);
		let secureP5=0;
		if (p5.forge_points<rewardP5) {
			secureP5=resteToInvest-2*rewardP5;
			secure=Math.max(secureP1,secureP2,secureP3,secureP4,secureP5);
			if (secureP5<=secureP4) {
				annonce+=' P5('+rewardP5+')';
			}
		}

		html.push('<p>ToInvest:'+Math.round(Calculator.currentGM.FPRequired-totalRewards)+' &nbsp; ,'+Math.round(100*(Calculator.currentGM.FPRequired-totalRewards)/Calculator.currentGM.FPRequired,0)  +'%</p>');
		if (toSec.annonce!='') {
			html.push('<p class='+toSec.cl+'>ToSecure:'+avgFP(toSec.pf)+' '+toSec.annonce+'</p>');
		}
		let val=[];
		val.push(avgFP(toSec.pf));
		MainParser.DrawComms("securePlace",val);
		
	  let oldValue=DB.get("annonceInvest");

		html.push('<table id="costTableFordern" style="width:100%" class="foe-table">');
		html.push('<tr><td><button style="width:15px;height:15px" id=razAnnonce title="RAZ" /><button style="width:15px;height:15px" id=copyAnnonce title="Copier annonce" /></td>');
		html.push('<td colspan=7><textarea id=annonceTxt rows=4 cols=50>'+oldValue+'</textarea></td></tr>');
		html.push('<tr><td><button style="width:15px;height:15px" id=copyAnnonce2 title="2 premières places" /></td>');
		html.push('<td>Rang</td><td>Joueur</td><td>Invest</td><td>Feedback</td><td>'+taux+'</td><td>Médailles</td><td>Plans</td></tr>');	
		
		
		for(let r of Calculator.Rankings) {
			let bg="";
			taux=tauxs[r.rank];
			let reward=r.reward;
			let isOk=(r.rank<5 && r.forge_points>=reward.strategy_point_amount*taux);
			if (r.player.is_self) {
				bg=' class="self"';
			}
			if (r.rank==null) {
				html.push('<tr class="owner"><td></td><td></td><td></td><td>'+r.forge_points+'</td><td></td><td></td><td></td><td></td></tr>');
				continue;
			}
			bg=isOk?' class="ok"':"";
			html.push('<tr'+bg+'>');
			if (r.rank<=5) {
				let fp=Math.ceil(reward.strategy_point_amount*taux);
				if (fp==0) fp=1;
				let checked=(r.forge_points<fp);				
				html.push('<td><input type=checkbox title="'+taux+'" id=ck'+r.rank+' name="ck'+r.rank+'"'+ (checked?' checked=checked':'')+' data-fp='+fp+' /></td>');			
			}
			else {
				html.push('<td></td>');
			}
			html.push('<td>'+(r.rank??"")+'</td>');
			if (r.forge_points>0) {
			html.push('<td title="'+r.player.name+'">'+r.player.name.substring(0,3)+'</td>');
			}
			else {
			html.push('<td></td>');				
			}
			html.push('<td>'+r.forge_points+'</td>');			
						
			// if (r.Best>0){
			// 	let txt="";
			// 	if (r.note.costForme>0) {
			// 		txt='<span class="red">(+'+r.note.costForme+")</span>";
			// 	}
			// 	else {
			// 		txt='<span class="green">('+r.note.costForme+")</span>";
			// 	}
			// 	html.push('<td class="'+r.note.cl+'">'+r.Best+txt+'</td>');
			// }
			// else {
			// 	html.push('<td></td>');
			// }
			html.push('<td>'+reward.strategy_point_amount+'</td>');
			html.push('<td>'+Math.ceil(reward.strategy_point_amount*taux)+'</td>');
			html.push('<td>'+reward.resources?.medals+'</td>');
			html.push('<td>'+reward.blueprints+'</td>');
			
			html.push('</tr>');
			if (r.player.is_self && r.forge_points<=r.Best) {
				//r.player.GMS.splice(x=>x.BuildingName==gm.BuildingName);
			}
		}
		html.push("</table>");
		$('#costCalculatorBody').html(html.join(''));

		$('#razAnnonce').on('click',function(){
			let annonceTxt=document.getElementById("annonceTxt");
			annonceTxt.value="";
		});


		$('#copyAnnonce').on('click',function(){
			let table=document.getElementById("costTableFordern");
			let cks=table.querySelectorAll("input[type='checkbox']:checked");			
			let annonceTxt=document.getElementById("annonceTxt");
			let txt="";
			if (cks.length>0) {
				let gms=annonceTxt.value.split('\n');
				for(let gm of gms) {
					if (gm!="" && gm.indexOf(Calculator.currentGM.BuildingName)<=0) {
						txt+=gm+"\n";
					}
				}
				txt+=player.PlayerName.replace(" Coldwater","").replace("783","");			
				txt+=" "+Calculator.currentGM.BuildingName;
				let ranks="";
				for(let ck of cks){
					let rank=ck.id.substring(2);
					ranks=' P'+rank+'('+ck.dataset.fp+')'+ ranks;
				}
				txt+=ranks;
				txt=txt.trim()+"\n";
				annonceTxt.value=txt;
			}
			else {
			  txt=annonceTxt.value;
			}
			DB.set("annonceInvest",txt);
			helper.str.copyToClipboard(txt);
		});

		$('#copyAnnonce2').on('click',function(){
			let table=document.getElementById("costTableFordern");
			let cks=table.querySelectorAll("input[type='checkbox']:checked");
			let txt=player.PlayerName.replace(" Coldwater","").replace("783","");			
			txt+=" "+Calculator.currentGM.BuildingName;
			let ranks="";
			let i=0;
			for(let ck of cks){
				let rank=ck.id.substring(2);
				ranks=' '+rank+" "+ranks;
				i++;
				if (i>1) break;
			}
			txt+=ranks;
			helper.str.copyToClipboard(txt);
		});

		
	},


	CalcSnip:()=>{
		debugger;
		let quest=Calculator.GetRecurringQuestsLine();
		if (quest.infoType=="attention") {
			//HTML.CloseOpenBox("costCalculator");
		}

		let	arc = 1 + (MainParser.ArkBonus / 100);
	let MaxLevel = (Calculator.CityMapEntity['max_level'] !== undefined ? Calculator.CityMapEntity['max_level'] : 0);
	
	h.push('<div class="text-center dark-bg" style="padding:5px 0 3px;">');
	let isRemember=false;
	let currentGM=Calculator.currentGM;
	let player=PlayerDict[currentGM.OwnerId];
	if (player==null) return;
	if (player.GMS){
		let gm=player.GMS.find(x=>x.BuildingName==currentGM.BuildingName);
		if (gm){
			player.GMS.splice(x=>x.BuildingName==currentGM.BuildingName);
			player.GMS.push(currentGM);
			isRemember=true;
		}			
	}
	let img="";//PlayersPopin.GetPortrait(player.PlayerID);

	document.querySelectorAll(".gm").forEach(x=>{if (x.dataset.player==player.PlayerId) x.classList.add("selected"); else x.classList.remove("selected");})

	h.push('<img class="mini-portrait" src="'+img+'"/>');
	h.push('<span class="player-name">' + player.PlayerName + '</span>');
	
	h.push('<p class="header"><strong><span class="building-name">' + currentGM.BuildingName + '</span> <span>('+currentGM.Level+'/'+MaxLevel+')</span>');
	if (isRemember) {
		h.push(' <button onclick="Calculator.ForgetGM()">Oublier</button>');
	}
	else {
		h.push(' <button onclick="Calculator.RememberGM()">Se souvenir</button>');
	}	
	
	 h.push('<p>FP : '+currentGM.FPInvests+' / '+ currentGM.FPRequired+' &nbsp; &nbsp;');
	 h.push('<span class="rest">Reste : '+(currentGM.FPRequired-currentGM.FPInvests)+'</span> &nbsp; &nbsp; ');
	 h.push('<span class="'+quest.infoType+'">'+quest.info+'</span></p>');  
	//h.push('<p>Récolte :'+moment.unix(currentGM.NextUp).format('HH:mm:ss')+'</p>');

	// FP im Lager
  //  h.push('<p>' + i18n('Boxes.Calculator.AvailableFP') + ': <strong class="fp-storage">' + HTML.Format(StrategyPoints.AvailableFP) + '</strong></p>');

	h.push('</div>');

	h.push('<div class="dark-bg costFactorWrapper">');

	//h.push(i18n('Boxes.Calculator.ArkBonus') + ': ' + MainParser.ArkBonus + '%<br>');
	

	h.push('<span><strong>Arche :</strong> ' + MainParser.ArkBonus+'%</span>');

	h.push('</div>');

	// Tabelle zusammen fummeln
	h.push('<table id="costTableFordern" style="width:100%" class="foe-table"></table>');

	

	// in die bereits vorhandene Box drücken
	$('#costCalculator').find('#costCalculatorBody').html(h.join(''));
	$('#costCalculator').find('.tooltip').remove();

	// Stufe ist noch nicht freigeschaltet
	if (Calculator.CityMapEntity['level'] === Calculator.CityMapEntity['max_level']) {
		$('#costCalculator').find('#costCalculatorBody').append($('<div />').addClass('lg-not-possible').attr('data-text', i18n('Boxes.Calculator.LGNotOpen')));

	}

	// es fehlt eine Straßenanbindung
	else if (Calculator.CityMapEntity['connected'] === undefined) {
		$('#costCalculator').find('#costCalculatorBody').append($('<div />').addClass('lg-not-possible').attr('data-text', i18n('Boxes.Calculator.LGNotConnected')));
	}

		MainParser.GMscanning=(MainParser.GMscanning??0)+1;
		if (MainParser.GMscanning>20) {
			DB.set("GMscanningDate",new Date());
			MainParser.GMscanning=0;
		}


		let myInvest=0;
			
		let reste= Calculator.currentGM.FPRequired-Calculator.currentGM.FPInvests;
		let resteSur2=Math.round((reste/2)+1);
		for(let r of Calculator.Rankings) {
			let reward=r.reward;
			r.forge_points=r?.forge_points??0;
			if (!reward)
			{
				r.reward={strategy_point_amount:0,resources:{medals:0},blueprints:0};
			}
			else {
				reward.strategy_point_amount=reward?.strategy_point_amount??0;
				reward.resources.medals=reward?.resources?.medals??0;
				reward.blueprints=reward?.blueprints??0;
			}
		}

		Calculator.CleanRankings();

		// suis déjà présent
		let isPresent=false;
		for(let r of Calculator.Rankings) {
			if (r.player.player_id==ExtPlayerID) { isPresent=true; break;}
		}
		
		for(let r of Calculator.Rankings) {
			if (r.rank>5) break;
			r.Best=r.forge_points+resteSur2;
			if (r.Best>reste) {
				//r.Best=Math.round((reste-r.forge_points)/2+r.forge_points);
				//r.note=Calculator.CalcNote(r,arc);
				r.Best=-1;
			}
			else {
				r.Best=r.Best-Math.round((1+r.forge_points)/2);
				r.note=Calculator.CalcNote(r,arc);
			}
		}
		// 2eme passe
		for(let r of Calculator.Rankings) {
			if (r.rank>5) break;
			if (r.rank==0) continue;
			if (r.Best) {
		//		debugger;
				let previousRank=Calculator.Rankings.find(x=>x.rank==r.rank-1);
				if (previousRank) {
				if (r.Best.Cost>previousRank.forge_points) {
					previousRank.Best=r.Best;
					previousRank.note=Calculator.CalcNote(previousRank,arc);
				}
			}
			}
		}
		// 3eme passe
	//	debugger;
		for(let r of Calculator.Rankings) {
			if (r.rank>5) break;
			if (r.rank==0 || r.rank==undefined) continue;
	//		debugger;
			let miseXplace=Calculator.Rankings.find(x=>x.rank==r.rank).forge_points;
			let best=reste/2+miseXplace-miseXplace/2;
			if (best>0)
			{
				//r.Best=Math.round(best+1);
				break;
			}
		}


		// let mise2place=Calculator.Rankings.find(x=>x.rank==2).forge_points;
		// let best=reste/2+mise2place-mise2place/2;
		// if (best>0)
		// {
		// 	r.Best=Math.round(best+1);
		// }
		

		let bestCost=10000; 
		let bestRank=0;
		let bestPlusValue=10000;
		for(let r of Calculator.Rankings) {
			if (r.rank>5) break;
			if (r.Best>0 && r.note.costForme<bestPlusValue) {
				bestCost=r.Best;
				bestRank=r.rank;
				bestPlusValue=r.note.costForme;
			}
		}
		Calculator.currentGM.Best={PlusValue:bestPlusValue,Cost:bestCost,Rank:bestRank};


		let html=[];
		if (bestPlusValue<10) {
			let quest=Calculator.GetRecurringQuestsLine();
			html.push('<tr><td colspan="6">'+splitNUmber(bestCost,quest.questModulo-quest.currentProgress,quest.questModulo)+'</td></tr>');
		}	
		html.push('<tr><td>Rang</td><td>Joueur</td><td>Invest</td><td>+/-</td><td>Feedback</td><td>1.9</td><td>Médailles</td><td>Plans</td></tr>');	
		
		

		for(let r of Calculator.Rankings) {
			let reward=r.reward;
			let bg="";
			let fpme="";
			let detect19="";
			if (r.player.is_self) {
				bg=' class="self"';
				fpme='('+Math.ceil(reward.strategy_point_amount*arc)+')';
			}
			if (r.rank==null) {
				html.push('<tr class="owner"><td></td><td>'+r.forge_points+'</td><td></td><td colspan=5></td></tr>');
				continue;
			}
			let fp19=Math.ceil(reward.strategy_point_amount*1.9);
			if (r.forge_points>0) {				
			 	if (r.forge_points>fp19 && reward.strategy_point_amount>0) {
					detect19=' class="fp19plus"';
				 }
				 else if (r.forge_points==fp19) {
					detect19=' class="fp19"';
				 }

			}
			html.push('<tr'+bg+'>');
			html.push('<td>'+(r.rank??"")+'</td>');
			if (r.forge_points>0) {
			html.push('<td title="'+r.player.name+'">'+r.player.name.substring(0,3)+'</td>');
			}
			else {
				html.push('<td></td>');
			}
			html.push('<td'+detect19+'>'+r.forge_points+'</td>');			
			
			if (r.Best>0){
				let txt="";
				if (r.note.costForme>0) {
					txt='<span class="red">(+'+r.note.costForme+")</span>";
				}
				else {
					//debugger;
					txt='<span class="green">('+r.note.costForme+")</span>";
					let val=[];
					val.push(bestCost);
					if (!isPresent)
					{
						MainParser.DrawComms("invest",val);
					}
					else{
						console.warn("je suis présent");
					}
				}
				html.push('<td class="'+r.note.cl+'">'+r.Best+txt+'</td>');
			}
			else {
				html.push('<td></td>');
			}
			html.push('<td>'+reward.strategy_point_amount+fpme+'</td>');
			html.push('<td>'+fp19+'</td>');
			html.push('<td>'+reward.resources?.medals+'</td>');
			html.push('<td>'+reward.blueprints+'</td>');			
			html.push('</tr>');
			// if (r.player) {
			// 	debugger;
			// }
			// if (r.player.is_self && r.forge_points<=r.Best) {
			// 	//r.player.GMS.splice(x=>x.BuildingName==gm.BuildingName);
			// }
		}

		$('#costTableFordern').html(html.join(''));

	},
	
	CleanRankings:()=>{
		for(let r of Calculator.Rankings) {
			let reward=r.reward;
			r.forge_points=r?.forge_points??0;
			if (!reward)
			{
				r.reward={strategy_point_amount:0,resources:{medals:0},blueprints:0};
			}
			else {
				reward.strategy_point_amount=reward?.strategy_point_amount??0;
				reward.resources.medals=reward?.resources?.medals??0;
				reward.blueprints=reward?.blueprints??0;
			}
		}
	},

	CalcNote:(ranking,arc)=>{
	  var note={cl:"danger"};
      let supplement=ranking.Best-ranking.reward.strategy_point_amount;
	  note.costForme=ranking.Best-Math.round(ranking.reward.strategy_point_amount*arc)+1;
	  if (supplement<0) {
			note.cl="excellent";			
	  }
	  else if (note.costForme<0) {
		  note.cl="good";
	  }
	  else if (note.cosfForme<10){
		  note.cl="average";
	  }	  
	  else if( note.costForme<20){
		  note.cl="warning";
	  }	
	  return note;

	},

	/**
	 * Formats the course
	 *
	 * @param Kurs
	 */
	FormatKurs: (Kurs) => {
		if (Kurs === 0) {
			return '-';
		}
		else {
			return HTML.Format(Kurs) + '%';
		}
	},


	/**
	 * Formats the +/- display next to the yield (if present)
	 *
	 * @param ForderRankDiff
	 */
	FormatForderRankDiff: (ForderRankDiff) => {
		if (ForderRankDiff < 0) {
			return ' <small class="text-success">' + HTML.Format(ForderRankDiff) + '</small>';
		}
		else if (ForderRankDiff === 0) {
			return '';
		}
		else { // > 0
			return ' <small class="error">+' + HTML.Format(ForderRankDiff) + '</small>';
		}
	},

		
	/**
	 * Spielt einen Sound im Calculator ab
	 *
	 * @returns {string}
	 */
    PlaySound: () => {
        if (Calculator.PlayInfoSound) {
			helper.sounds.play("message");
        }
    },


	ShowCalculatorSettings: ()=> {
		let c = [],
			buttons,
			defaults = Calculator.DefaultButtons,
			sB = localStorage.getItem('CustomCalculatorButtons'),
			nV = `<p class="new-row">${i18n('Boxes.Calculator.Settings.newValue')}: <input type="number" class="settings-values" style="width:30px"> <span class="btn btn-default btn-green" onclick="Calculator.SettingsInsertNewRow()">+</span></p>`;


		if(sB)
		{
			// buttons = [...new Set([...defaults,...JSON.parse(sB)])];
			buttons = JSON.parse(sB);

			buttons = buttons.filter((item, index) => buttons.indexOf(item) === index); // remove duplicates
			buttons.sort((a, b) => a - b); // order
		}
		else {
			buttons = defaults;
		}


		buttons.forEach(bonus => {
			if(bonus === 'ark')
			{
				c.push(`<p class="text-center"><input type="hidden" class="settings-values" value="ark"> <button class="btn btn-default">${MainParser.ArkBonus}%</button></p>`);
			}
			else {
				c.push(`<p class="btn-group flex"><button class="btn btn-default">${bonus}%</button> <input type="hidden" class="settings-values" value="${bonus}"> <span class="btn btn-default btn-delete" onclick="Calculator.SettingsRemoveRow(this)">x</span> </p>`);
			}
		});

		// new own button
		c.push(nV);

		c.push('<p><input id="forderbonusperconversation" class="forderbonusperconversation game-cursor" ' + (Calculator.ForderBonusPerConversation ? 'checked' : '') + ' type="checkbox"> ' + i18n('Boxes.Calculator.ForderBonusPerConversation'));

		// save button
		c.push(`<hr><p><button id="save-calculator-settings" class="btn btn-default" style="width:100%" onclick="Calculator.SettingsSaveValues()">${i18n('Boxes.Calculator.Settings.Save')}</button></p>`);

		// insert into DOM
		$('#costCalculatorSettingsBox').html(c.join(''));
	},


	SettingsInsertNewRow: ()=> {
    	let nV = `<p class="new-row">${i18n('Boxes.Calculator.Settings.newValue')}: <input type="number" class="settings-values" style="width:30px"> <span class="btn btn-default btn-green" onclick="Calculator.SettingsInsertNewRow()">+</span></p>`;

		$(nV).insertAfter( $('.new-row:eq(-1)') );
	},


	SettingsRemoveRow: ($this)=> {
		$($this).closest('p').fadeToggle('fast', function(){
			$(this).remove();
		});
	},


	SettingsSaveValues: ()=> {

    	let values = [];

    	// get each visible value
		$('.settings-values').each(function(){
			let v = $(this).val().trim();

			if(v){
				if(v !== 'ark'){
					values.push( parseFloat(v) );
				} else {
					values.push(v);
				}
			}

			Calculator.ForderBonusPerConversation = $('.forderbonusperconversation').prop('checked');
			localStorage.setItem('CalculatorForderBonusPerConversation', Calculator.ForderBonusPerConversation);
		});

		// save new buttons
		localStorage.setItem('CustomCalculatorButtons', JSON.stringify(values));

		$(`#costCalculatorSettingsBox`).fadeToggle('fast', function(){
			$(this).remove();

			// reload box
			Calculator.Show();
		});
	}
};
