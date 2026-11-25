
function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1&nbsp;')
  }



let GMSnip = {


	init: () => {		
		
	},

	ToogleShow:()=>{		
		if ($('#GMSnip').length > 0) {
			HTML.CloseOpenBox('GMSnip');
		} else {
			GMSnip.Show();
		}
	},

	Show:()=>{
		if (MainParser.Players==null) return;
		if ($('#GMSnip').length === 0) {
			HTML.AddCssFile('GMSnip');

			HTML.Box({
				'id': 'GMSnip',
				'title': "SNIP",//i18n('Boxes.Players.Title'),
				'auto_close': true,
				'dragdrop': true,
				'minimize': true,
				'pinable':true
			});
		}
		GMSnip.ShowNeighbor=true; 
		GMSnip.ShowGuild=true;
		GMSnip.ShowFriend=true;
	

		let content=[];
		GMSnip.list=MainParser.Players;

		//content.push('<div id="GMs"></div>');

		content.push('<div class="filters">');
		content.push('<label class="neighbor game-cursor"><input class="game-cursor ShowNeighbor" ' + (GMSnip.ShowNeighbor ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowNeighbor') + '</label> ');
		content.push('<label class="guildmember game-cursor"><input class="game-cursor ShowGuild" ' + (GMSnip.ShowGuild ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowGuild') + '</label> ');
		content.push('<label class="friend game-cursor"><input class="game-cursor ShowFriend" ' + (GMSnip.ShowFriend ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowFriend') + '</label><br/>');
		content.push('</div>');
		content.push('<div id="GMSnipList"></div>');


		$('#GMSnipBody').html(content.join('')).promise().done(function(){
			$('#GMSnipBody').on('click', '.ShowNeighbor', function () {
				GMSnip.ShowNeighbor = !GMSnip.ShowNeighbor;
				GMSnip.CalcBody();
			});
		
			$('#MGSnipBody').on('click', '.ShowGuild', function () {
				GMSnip.ShowGuild = !GMSnip.ShowGuild;
				GMSnip.CalcBody();
			});

			$('#GMSnipBody').on('click', '.ShowFriend', function () {
				GMSnip.ShowFriend = !GMSnip.ShowFriend;
				GMSnip.CalcBody();
			});
		});

		GMSnip.CalcBody();	
	},



	CalcBody: () => {		
		let players=GMSnip.list;
		players=players.filter(x=>x.GMS && x.GMS.length>0);
		for(let pl of players){
			pl.seen=(GMSnip.ShowNeighbor && pl.IsNeighbor)
			|| (GMSnip.ShowGuild && pl.IsGuildMember)
			|| (GMSnip.ShowFriend && pl.IsFriend);			
		}
		players=players.filter(x=>x.seen).sort((a,b)=>(b.Score-a.Score))
				.sort((a,b)=>( (b.IsNeighbor?1:0)-(a.IsNeighbor?1:0)));

		let content=[];
		content.push('<table class="foe-table scrollable">');
		content.push('<thead>');
		content.push('<tr><th></th><th>Nom</th><th>Score</th><th>GM</th><th>PF<br/>Place</th><th>+/-</th><th>Date</th></tr>')
		content.push('</thead><tbody>');
		for(let pl of players){
			if (pl.Score==null) {
				pl.Score=MainParser.Players.find(x=>x.PlayerName==pl.PlayerName).Score??0;
			}
			//let img=(MainParser.PlayerPortraits!=null)?'https://foefr.innogamescdn.com/assets/shared/avatars/'+MainParser.PlayerPortraits[pl.PlayerID]+'.jpg':"";
			let img=PlayersPopin.GetPortrait(5);
			let cltypePlayer="";
			if (pl.IsNeighbor){ cltypePlayer="neighbor";}
			else if ( pl.IsGuildMember ){ cltypePlayer="guildmember";}
			else if( pl.IsFriend) { cltypePlayer="friend";}			
			let colPlayers='<td class="portrait"><img alt="" class="mini-portrait" src="'+img+'" /></td><td class="'+cltypePlayer+'">'+pl.PlayerName+'</td><td>'+formatNumber(pl.Score)+'</td>';
			for(let gm of pl.GMS){
				content.push('<tr class="gm" data-player="'+pl.PlayerId+'">');
				content.push(colPlayers);
				content.push('<td>'+gm.BuildingName+'('+gm.Level+')</td>');
				content.push('<td><span class="invest">'+gm.FPInvests+'</span>/'+gm.FPRequired+'<br/>');
				let txt='';
				let PlusValue='';
				if (gm.Best) {
					let cl="red";
					if (gm.Best.PlusValue<0) {
						cl="green";
						PlusValue='<span class="'+cl+'">+'+(-gm.Best.PlusValue)+'</span>';
					}
					else {
						PlusValue='<span class="'+cl+'">'+(-gm.Best.PlusValue)+'</span>';
					}
					txt='<span class="'+cl+'">P'+ (gm.Best.Rank??"") +'('+gm.Best.Cost+')</span>';
					
				}
				content.push(txt+'</td>');
				content.push('<td>'+PlusValue+'</td>')
				content.push('<td>'+moment(gm.Dt).format("DD/MM HH:mm")+'</td>');		
				content.push('</tr>');
			}			
		}
		content.push('</tbody></table>');
		$('#GMSnipList').html( content.join('') );
		$('.gm').on('doubleclick', '', function () {
		});

	}	
};
