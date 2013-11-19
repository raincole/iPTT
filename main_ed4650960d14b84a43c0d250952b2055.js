function receivedFromPTT(t){var e="",r=!0;byteBuffer=byteBuffer.concat(t);for(var i=0;i<byteBuffer.length;i++)if(byteBuffer[i]<128)e+=String.fromCharCode(byteBuffer[i]);else if(i===byteBuffer.length-1)r=!1;else{r=!1;for(var n=!1,s=i+1;s<byteBuffer.length;s++){var a=256*byteBuffer[i]+byteBuffer[s];a>=65520&&(a=41404);var o=Big5ToUnicode[a];if(o&&n===!1){e+=String.fromCharCode(o),i=s,r=!0;break}27===byteBuffer[s]&&(n=!0),n===!0&&(e+=String.fromCharCode(byteBuffer[s])),109===byteBuffer[s]&&(n=!1)}}r===!0&&(byteBuffer=[],Logger.info("\n==================================================\n"),Logger.info(e),term.write(e),null!==handler&&handler.onData(term))}function writeMessage(t){Logger.info("Write to PTT: "+t);for(var e=[],r=0;r<t.length;r++){var i=t.charCodeAt(r);if(128>i)e.push(i);else{var n=UnicodeToBig5[i],s=n/256,a=n%256;e.push(s,a)}}this.writeByteArray(e)}function registerNextHandler(t){nextHandler=t;var e=t.getTimeout?t.getTimeout():3e4;client.setTimeout(e,t)}IS_ON_IOS=!0,require=function(){return{}},module={},String.prototype.removeSpace=function(){return this.replace(/\s/g,"")},String.prototype.removeTailingSpace=function(){return this.replace(/\s+$/g,"")},String.prototype.removeHeadingSpace=function(){return this.replace(/\s([^\s])/g,function(t,e){return e})},String.prototype.stripSpace=function(){return this.replace(/(^\s+)|(\s+$)/g,"")},String.prototype.fixFullWidthCharacters=function(){return this.replace(/ ([\u0080-\uffff])/g,"$1")},function(){if(IS_ON_IOS)Logger={info:function(){_log("INFO ("+Array.prototype.join.call(arguments," ")+")")},debug:function(){_log("DEBUG ("+Array.prototype.join.call(arguments," ")+")")},error:function(){_log("ERR ("+Array.prototype.join.call(arguments," ")+")")}};else{var t=require("winston"),e=require("fs");e.truncate("./log/debug.log",0),e.truncate("./log/raw.log",0),e.truncate("./log/data.log",0),Logger=new t.Logger({transports:[new t.transports.Console({json:!1,timestamp:!0}),new t.transports.File({filename:__dirname+"/log/debug.log",json:!1})],exitOnError:!1})}module.exports=Logger}(),function(){var t={INPUTTED:"inputted",LOGGED_IN:"logged_in"};LoginHandler=function(t,e,r,i){this.client=t,this.callback=i,this.username=e,this.password=r,this.checkedKicking=!1,this.checkedAttempts=!1,this.enterCounter=10},LoginHandler.prototype.start=function(){this.inputInfo(this.username,this.password),this.status=t.INPUTTED},LoginHandler.prototype.changeStatus=function(t){Logger.info("LoginHandler: "+this.status+" -> "+t),this.status=t},LoginHandler.prototype.inputInfo=function(t,e){this.client.write(t+"\r\n"+e+"\r\n")},LoginHandler.prototype.getTimeout=function(){return 15e3},LoginHandler.prototype.isEnded=function(){return this.status===t.LOGGED_IN},LoginHandler.prototype.end=function(){this.status=t.LOGGED_IN},LoginHandler.prototype.onData=function(e){switch(Logger.info("LoginHandler",this.status),this.status){case t.INPUTTED:-1!==e.getText(21,0,80).removeSpace().indexOf("密碼不對或無此帳號")?(this.changeStatus(t.LOGGED_IN),this.callback({message:"wrong_username_or_password"})):-1!==e.getText(22,0,80).removeSpace().indexOf("您想刪除其他重複登入的連線嗎")&&this.checkedKicking===!1?(this.client.write("n\r\n"),this.checkedKicking=!0):-1!==e.getText(23,0,80).removeSpace().indexOf("您要刪除以上錯誤嘗試的記錄嗎")&&this.checkedAttempts===!1?(this.client.write("n\r\n"),this.checkedAttempts=!0):-1!==e.getText(23,0,80).removeSpace().indexOf("按任意鍵繼續")?this.client.write("x"):-1!==e.getAllTexts().join("").indexOf("(G)oodbye")&&(this.changeStatus(t.LOGGED_IN),this.callback(null))}},module.exports=LoginHandler}(),function(){var t={BEGINNING:"beginning",ENDING:"ending"};LogoutHandler=function(t,e){this.client=t,this.callback=e},LogoutHandler.prototype.start=function(){this.client.write("g\r\ny\r\n"),this.status=t.BEGINNING},LogoutHandler.prototype.changeStatus=function(t){Logger.info("LogoutHandler: "+this.status+" -> "+t),this.status=t},LogoutHandler.prototype.isEnded=function(){return this.status===t.ENDING},LogoutHandler.prototype.end=function(){this.status=t.ENDING},LogoutHandler.prototype.onData=function(e){Logger.info("LogoutHandler",this.status),this.status===t.BEGINNING&&-1!==e.getText(23,0,80).indexOf("此 次 停 留 時 間")&&(this.callback(null),this.changeStatus(t.ENDING),this.client.write("\r\n"))},module.exports=LogoutHandler}(),function(){function t(t,e,r){var i=t.substr(0,7).match(/\d+$/);if(null!==i)var n=parseInt(i[0]);else var n=0/0;var s=t.substr(10,14).removeSpace(),a=t.substr(30,33).removeHeadingSpace().fixFullWidthCharacters(),o=t.substr(67,12),l=t.substr(24,3).removeSpace(),u="ˇ"===t[9],c=t.substr(64,3).removeSpace(),h="",d=0;if("HOT"===c)h="hot";else if("爆!"===c)switch(e){case 1:h="red";break;case 2:h="green";break;case 3:h="yellow";break;case 4:h="blue";break;case 5:h="purple";break;case 6:h="cyan";break;case 7:h="white"}else h="count",d=""===c?0:parseInt(c);var g=6===r;return isNaN(n)||0>=n||""===s||isNaN(d)||0>d||d>=100?null:{number:n,name:s,title:a,boardMasters:o,tag:l,viewerSign:h,viewerCount:d,hasUnread:u,favorited:g}}var e={BEGINNING:"beginning",HOT_LIST:"hot_list",WAIT_MORE:"wait_more",GOT_PAGE:"got_page",ENDING:"ending"};HotHandler=function(t,e){this.client=t,this.callback=e,this.boardList={type:"hot",items:[]},this.gotNumbers=[]},HotHandler.prototype.start=function(){this.enterHotList(),this.status=e.BEGINNING},HotHandler.prototype.enterHotList=function(){this.client.write("t1\r\n")},HotHandler.prototype.enterNewPage=function(){this.client.write(""),this.changeStatus(e.HOT_LIST)},HotHandler.prototype.changeStatus=function(t){Logger.info("HotHandler: "+this.status+" -> "+t),this.status=t},HotHandler.prototype.parseList=function(e,r){for(var i=this.boardList.items.length%20+3,n=[],s=i;23>s;s++)if(""!==e[s].removeSpace()){var a=t(e[s],r.getColor(s,65).frontground,r.getColor(s,10).frontground);n.push(a),null===a&&Logger.info(e[s])}return n},HotHandler.prototype.checkItems=function(t){this.boardList.items;for(var e=0,r=0;r<t.length;r++){var i=t[r];null===i||this.gotNumbers[i.number]||e++}return e},HotHandler.prototype.addItems=function(t){for(var e=this.boardList.items,r=0;r<t.length;r++){var i=t[r];null===i||this.gotNumbers[i.number]||(e.push(i),this.gotNumbers[i.number]=!0)}},HotHandler.prototype.isEnded=function(){return this.status===e.ENDING},HotHandler.prototype.end=function(){this.status=e.ENDING},HotHandler.prototype.onData=function(t){if(Logger.info("HotHandler",this.status),this.status!==e.ENDING&&(this.status===e.BEGINNING&&"看 板 列"==t.getText(0,3,8)&&this.changeStatus(e.HOT_LIST),this.status===e.HOT_LIST||this.status===e.WAIT_MORE)){for(var r=this.parseList(t.getAllTexts(),t),i=0;i<r.length;i++)if(null===r[i])return;var n=this.checkItems(r);0===n?(this.callback(null,this.boardList),this.changeStatus(e.ENDING)):n===r.length&&(this.addItems(r),this.enterNewPage())}},module.exports=HotHandler}(),function(){function t(t){var e=t.substring(33,80).fixFullWidthCharacters(),r=/^.*\[(.*)\]/,i=r.exec(e),n=i?i[1]:"",s=e.replace(r,"").stripSpace(),a=t.substring(17,30).removeSpace(),o=t.substring(2,7).removeSpace(),l=0,u=!1;"★"===o?u=!0:l=parseInt(o);var c=t.substring(9,11).removeSpace(),h=0;h="爆"===c?100:"X"===c[0]?"X"===c[1]?-100:-10*parseInt(c[1]):""===c?0:parseInt(c);var d="normal";":"===t[31]?d="reply":"轉"===t[31]?d="xpost":"-"===a&&(d="deleted");var g="other";switch(t[8]){case"+":g="unread";break;case"~":g="unreadComment";break;case" ":g="normal";break;case"!":g="locked"}return!u&&(0>=l||isNaN(l))||""===a||""===s?null:{title:s,tag:n,author:a,score:h,number:l,type:d,pinned:u,status:g}}function e(t){for(var e=0,r=t.length-1;r>=0&&t[r].pinned!==!1;r--)t[r].number=e,e--}function r(t,e){function r(t){if(e.score){var r=e.score;if(r>=0){if(t.score<r)return!1}else if(r-t.score<-10)return!1}if(e.title){var i=e.title.toLowerCase(),n=("["+t.tag+"] "+t.title).toLowerCase();if(-1===n.indexOf(i))return!1}if(e.author){var s=e.author.toLowerCase();if(-1===t.author.toLowerCase().indexOf(s))return!1}return!0}for(var i=0;i<t.length;i++)if(r(t[i])===!1)return!1;return!0}var i={BEGINNING:"beginning",GETTING_INFO:"getting_info",SEARCHING:"searching",JUMPING:"jumping",GETTING_ARTICLES:"getting_articles",ENDING:"ending"};BoardHandler=function(t,e,r,i,n){4===arguments.length&&(n=i,i=r,r={}),this.client=t,this.name=e,this.criteria=r,this.pivot=i,this.callback=n,this.board={name:e,articles:[]}},BoardHandler.prototype.start=function(){this.enterBoard(this.name),this.status=i.BEGINNING},BoardHandler.prototype.enterBoard=function(t){this.client.write("qs"+t+"\r\n")},BoardHandler.prototype.changeStatus=function(t){Logger.info("BoardHandler: "+this.status+" -> "+t),this.status=t},BoardHandler.prototype.parseAndMergeInfo=function(t){this.board.title=t[6].substr(21).fixFullWidthCharacters().removeTailingSpace(),this.board.boardMasters=t[7].substr(15).fixFullWidthCharacters().removeTailingSpace(),this.board.dislikable="開 放"===t[15].substr(6,3)},BoardHandler.prototype.parseArticles=function(e){var r=e.slice(3,23).map(function(e){return t(e)}).filter(function(t){return null!==t});return r},BoardHandler.prototype.isInBoard=function(){return this.status===i.GETTING_ARTICLES||this.status===i.ENDING},BoardHandler.prototype.isEnded=function(){return this.status===i.ENDING},BoardHandler.prototype.end=function(){this.status=i.ENDING},BoardHandler.prototype.onData=function(t){if(Logger.info("BoardHandler",this.status),this.status!==i.ENDING&&(this.status===i.BEGINNING&&(-1!==t.getText(0,60,80).removeSpace().toLowerCase().indexOf("看板《"+this.board.name.toLowerCase()+"》")&&"  文 章 選 讀  (y) 回 應(X) 推 文(^X) 轉 錄 (=[]<>) 相 關 主 題(/?a) 找 標 題/ 作 者 (b) 進 板 畫 面   "===t.getText(23,0,80)?(this.changeStatus(i.GETTING_INFO),this.client.write("i")):this.client.write("x")),this.status===i.GETTING_INFO&&t.getText(4,0,40).removeSpace().toLowerCase()==="《"+this.board.name.toLowerCase()+"》看板設定"&&"請 按 任 意 鍵 繼 續"===t.getText(23,33,46)&&(this.parseAndMergeInfo(t.getAllTexts()),this.changeStatus(i.SEARCHING),this.client.write("x")),this.status===i.SEARCHING&&"  文 章 選 讀  (y) 回 應(X) 推 文(^X) 轉 錄 (=[]<>) 相 關 主 題(/?a) 找 標 題/ 作 者 (b) 進 板 畫 面   "===t.getText(23,0,80)&&(this.criteria.title&&this.client.write("/"+this.criteria.title+"\r\n"),this.criteria.score&&this.client.write("Z"+this.criteria.score+"\r\n"),this.criteria.author&&this.client.write("a"+this.criteria.author+"\r\n"),this.changeStatus(i.JUMPING)),this.status===i.JUMPING&&"[ ←] 離 開 [ →] 閱 讀 [Ctrl-P] 發 表 文 章 [d] 刪 除 [z] 精 華 區 [i] 看 板 資 訊/ 設 定 [h] 說 明   "===t.getText(1,0,80)&&(null!==this.pivot?this.client.write(this.pivot+"\r\n"):this.client.write("1\r\nk"),this.changeStatus(i.GETTING_ARTICLES)),Logger.info("\n@@@\n"+t.getAllTexts()+"\n@@@\n"),this.status===i.GETTING_ARTICLES&&"[ ←] 離 開 [ →] 閱 讀 [Ctrl-P] 發 表 文 章 [d] 刪 除 [z] 精 華 區 [i] 看 板 資 訊/ 設 定 [h] 說 明   "===t.getText(1,0,80))){var n=!1;if(null===this.pivot)n=!0;else for(var s=0;s<t.rows;s++){var a=t.getText(s,0,80);a.substring(2,7).removeSpace()===this.pivot+""&&(n=!0)}if(n===!0){var o=this.parseArticles(t.getAllTexts()),l=r(o,this.criteria);l&&(this.board.articles=this.board.articles.concat(o),e(this.board.articles),this.callback(null,this.board),this.changeStatus(i.ENDING))}}},module.exports=BoardHandler}(),function(){function t(t){var e=/\d+%/.exec(t),r=0/0;null!==e&&(r=parseInt(e[0]));var i=/(\d{2,5})~(\d{2,5})/.exec(t),n=0/0,s=0/0;return null!==i&&(n=parseInt(i[1])-1,s=parseInt(i[2])),isNaN(r)||isNaN(n)||isNaN(s)?null:{progress:r,startLine:n,endLine:s}}function e(t){var e=t[0].fixFullWidthCharacters(),r=t[1].fixFullWidthCharacters(),i=t[2].fixFullWidthCharacters(),n=/作者  (.*) \(/.exec(e),s=n?n[1]:"",a=/作者  .* \((.*)\)/.exec(e),o=a?a[1]:"",l=/標題  (Re: |Fw: )?\[(.*)\]/.exec(r),u=l?l[2]:"",c=/標題  (Re: |Fw: )?(\[.*\])? (.*)/.exec(r),h=c?c[3].removeTailingSpace():"",d=/時間  (.*)/.exec(i),g="";if(null!==d){var f=new Date(d[1]),p=new Date(f.getTime()+288e5);g=p.toISOString()}return{author:s,authorNickname:o,tag:u,title:h,date:g}}function r(t){if(0===t.length)return"";for(var e=t[0],r=1;r<t.length;r++){var i=!0,n=t[r-1].substring(0,78).match(/ *$/)[0],s=t[r].match(/^ */)[0];n.length+s.length<2&&(i=!1);var a=/(,|，)\s*$/,o=t[r-1].substring(0,78).match(a);null!==o&&s.length<2&&(e=e.replace(a,"$1"),i=!1),i===!0&&(e+="\n"),e+=t[r]}return e}function i(t){for(var e=[],i=t,n={type:"normal",texts:[]},s=0;s<i.length;s++){if(":"===i[s][0]||"※"===i[s][0])var a="quote",o=i[s].substr(1);else var a="normal",o=i[s];n.type!==a?(e.push({type:n.type,text:r(n.texts)}),n={type:a,texts:[o]}):n.texts.push(o)}return e.push({type:n.type,text:r(n.texts)}),e=e.filter(function(t){return""!==t.text})}function n(e){for(var n=e.map(function(t){return t.fixFullWidthCharacters()}),s=[],a=n.indexOf("───────────────────────────────────────  "),o=a+1;o<n.length;o++)if(void 0!==n[o]&&-1===n[o].indexOf("瀏覽 第")){if(null!==n[o].match(/^※ 發信站:/)){o+=2;break}s.push(e[o])}for(var l=[],u=[];o<n.length&&null===t(n[o]);o++)if("※"!==n[0]){var c=/^(推|噓|→)\s*(.*?):(.*)\d\d\/\d\d \d\d:\d\d  $/.exec(n[o]);if(null!==c){u.length>0&&(l.push({type:"authorComment",author:"",content:r(u).removeTailingSpace()}),u=[]);var h="neutral";"推"===c[1]&&(h="like"),"噓"===c[1]&&(h="dislike"),l.push({type:h,author:c[2],content:c[3].removeTailingSpace()})}else u.push(n[o])}return u.length>0&&l.push({type:"authorComment",author:"",content:r(u)}),{content:i(s.map(function(t){return t.fixFullWidthCharacters()})),comments:l}}var s={BEGINNING:"beginning",SELECTING_ITEM:"selecting_item",GETTING_URL:"getting_url",GETTING_ARTICLE:"getting_article",GETTING_MORE:"getting_more",ENDING:"ending"};ArticleHandler=function(t,e,r,i,n,s){5===arguments.length&&(s=n,n=i,i=r,r={}),this.client=t,this.callback=n,this.progressCallback=s,this.prevProgress=0,this.boardName=e,this.criteria=r,this.articleNum=i,this.article={comments:[]},this.cachedTexts=[]},ArticleHandler.prototype.start=function(){this.boardHandler=new BoardHandler(this.client,this.boardName,this.criteria,null,function(){}),this.boardHandler.start(),this.status=s.BEGINNING},ArticleHandler.prototype.changeStatus=function(t){Logger.info("ArticleHandler: "+this.status+" -> "+t),this.status=t},ArticleHandler.prototype.nextPage=function(){this.status!==s.ENDING&&this.client.write("jjjjj")},ArticleHandler.prototype.checkMissing=function(){"找 不 到 這 個 文 章 代 碼"===term.getText(22,1,18)&&this.callback({message:"missing_article"},null)},ArticleHandler.prototype.isSelected=function(){return this.status===s.SELECTING_ITEM},ArticleHandler.prototype.isEnded=function(){return this.status===s.ENDING},ArticleHandler.prototype.end=function(){this.status=s.ENDING},ArticleHandler.prototype.onData=function(r){if(Logger.info("ArticleHandler",this.status),this.status!==s.ENDING)if(this.status===s.BEGINNING&&(this.boardHandler.onData(r),this.boardHandler.isInBoard()))if(this.changeStatus(s.SELECTING_ITEM),"string"==typeof this.articleNum)this.client.write(this.articleNum+"\r\n");else if(this.articleNum>0)this.client.write(this.articleNum+"\r\n");else{for(var i="k",a=0;a<-this.articleNum;a++)i+="k";this.client.write("1\r\n"+i)}else{if(this.status===s.SELECTING_ITEM&&(this.checkMissing(),this.changeStatus(s.GETTING_URL),this.client.write("Q")),this.status===s.GETTING_URL){this.checkMissing();var o=r.getAllTexts(),l=o.indexOf(" ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ");if(-1!==l){var u=o[l+2].fixFullWidthCharacters(),c=u.match(/http:\/\/.*\.html/);this.article.url=null===c?"":c[0];var u=o[l+1],h=u.match(/#[a-zA-Z0-9]{8}/);this.article.id=null===h?"":h[0],this.changeStatus(s.GETTING_ARTICLE),this.client.write("xxx[C")}}if(this.status===s.GETTING_ARTICLE||this.status===s.GETTING_MORE){var d=t(r.getText(23,0,80));if(null!==d&&d.endLine>=this.cachedTexts.length){this.progressCallback(d.progress),d.progress>this.prevProgress&&(this.prevProgress=d.progress,this.client.setTimeout(1e3,this));for(var a=d.startLine;a<=d.endLine;a++)this.cachedTexts[a]=r.getText(a-d.startLine,0,80);if(100===d.progress){var g=e(this.cachedTexts),f=n(this.cachedTexts);this.article.title=g.title,this.article.tag=g.tag,this.article.author=g.author,this.article.authorNickname=g.authorNickname,this.article.date=g.date,this.article.content=f.content,this.article.comments=f.comments,this.callback(null,this.article),this.changeStatus(s.ENDING)}else this.nextPage()}}}},module.exports=ArticleHandler}(),function(){function t(t,e){var r=t.substr(0,7).match(/\d+$/);if(null!==r)var i=parseInt(r[0]);else var i=0/0;var n=t.substr(10,14).removeSpace(),s=t.substr(30,33).removeHeadingSpace().fixFullWidthCharacters(),a=t.substr(67,12),o=t.substr(24,3).removeSpace(),l="ˇ"===t[9],u=t.substr(64,3).removeSpace(),c="",h=0;if("HOT"===u)c="hot";else if("爆!"===u)switch(e){case 1:c="red";break;case 2:c="green";break;case 3:c="yellow";break;case 4:c="blue";break;case 5:c="purple";break;case 6:c="cyan";break;case 7:c="white"}else c="count",h=""===u?0:parseInt(u);return isNaN(i)||0>=i?null:"MyFavFolder"===n?{type:"directory",number:i,name:s}:"------------"===n?{type:"separator",number:i}:""===n||isNaN(h)||0>h||h>=100?null:{type:"boardItem",number:i,boardItem:{name:n,title:s,boardMasters:a,tag:o,viewerSign:c,viewerCount:h,hasUnread:l,favorited:!0}}}var e={BEGINNING:"beginning",FOLLOWING_PATH:"following_path",FAVORITES_LIST:"favorites_list",WAIT_MORE:"wait_more",GOT_PAGE:"got_page",ENDING:"ending"};FavoritesHandler=function(t,e,r){this.client=t,this.path=e,this.callback=r,this.boardList={type:"favorites",items:[]},this.gotNumbers=[]},FavoritesHandler.prototype.start=function(){this.enterList(),this.status=e.BEGINNING},FavoritesHandler.prototype.enterList=function(){this.client.write("f1\r\n")},FavoritesHandler.prototype.enterNewPage=function(){this.client.write(""),this.changeStatus(e.FAVORITES_LIST)},FavoritesHandler.prototype.changeStatus=function(t){Logger.info("FavoritesHandler: "+this.status+" -> "+t),this.status=t},FavoritesHandler.prototype.parseList=function(e,r){for(var i=this.boardList.items.length%20+3,n=[],s=i;23>s;s++)if(""!==e[s].removeSpace()&&" ●        ---  空 目 錄 ， 請 按 a  新 增 或 用 y  列 出 全 部 看 板 後 按 z  增 刪 ---             "!==e[s]){var a=t(e[s],r.getColor(s,65).frontground,r.getColor(s,10).frontground);null===a&&Logger.info(e[s]),n.push(a)}return n},FavoritesHandler.prototype.checkItems=function(t){this.boardList.items;for(var e=0,r=0;r<t.length;r++){var i=t[r];null===i||this.gotNumbers[i.number]||e++}return e},FavoritesHandler.prototype.addItems=function(t){for(var e=this.boardList.items,r=0;r<t.length;r++){var i=t[r];null===i||this.gotNumbers[i.number]||(e.push(i),this.gotNumbers[i.number]=!0)}},FavoritesHandler.prototype.isEnded=function(){return this.status===e.ENDING},FavoritesHandler.prototype.end=function(){this.status=e.ENDING},FavoritesHandler.prototype.isInList=function(){return this.status===e.FAVORITES_LIST},FavoritesHandler.prototype.onData=function(t){if(Logger.info("FavoritesHandler",this.status),this.status!==e.ENDING){if(Logger.info(t.getText(0,0,80)),this.status===e.BEGINNING&&"看 板 列"==t.getText(0,3,8)&&this.changeStatus(e.FOLLOWING_PATH),this.status===e.FOLLOWING_PATH)if(0===this.path.length)this.changeStatus(e.FAVORITES_LIST);else{var r=this.path.shift();this.client.write(r+"\r\n\r\n")}if(this.status===e.FAVORITES_LIST||this.status===e.WAIT_MORE){for(var i=this.parseList(t.getAllTexts(),t),n=0;n<i.length;n++)if(null===i[n])return;var s=this.checkItems(i);0===s?(this.callback(null,this.boardList),this.changeStatus(e.ENDING)):s===i.length&&(this.addItems(i),this.enterNewPage())}}},module.exports=FavoritesHandler}(),function(){var t={BEGINNING:"beginning",ADDING_BOARD:"adding_board",ENDING:"ending"};FavoritesAddHandler=function(t,e,r,i){this.client=t,this.path=e,this.boardName=r,this.callback=i},FavoritesAddHandler.prototype.start=function(){this.favoritesHandler=new FavoritesHandler(this.client,this.path,this.callback),this.favoritesHandler.start(),this.status=t.BEGINNING},FavoritesAddHandler.prototype.changeStatus=function(t){Logger.info("FavoritesHandler: "+this.status+" -> "+t),this.status=t},FavoritesAddHandler.prototype.isEnded=function(){return this.status===t.ENDING},FavoritesAddHandler.prototype.end=function(){this.status=t.ENDING},FavoritesAddHandler.prototype.onData=function(e){Logger.info("FavoritesAddHandler",this.status),this.status!==t.ENDING&&(this.status===t.BEGINNING&&(this.favoritesHandler.isInList()?this.changeStatus(t.ADDING_BOARD):this.favoritesHandler.onData(e)),this.status===t.ADDING_BOARD&&(this.client.write("a"+this.boardName+"\r\n"),this.callback(null),this.changeStatus(t.ENDING)))},module.exports=FavoritesAddHandler}(),function(){var t={BEGINNING:"beginning",REMOVING_BOARD:"removing_board",ENDING:"ending"};FavoritesRemoveHandler=function(t,e,r,i){this.client=t,this.path=e,this.number=r,this.callback=i},FavoritesRemoveHandler.prototype.start=function(){this.favoritesHandler=new FavoritesHandler(this.client,this.path,this.callback),this.favoritesHandler.start(),this.status=t.BEGINNING},FavoritesRemoveHandler.prototype.changeStatus=function(t){Logger.info("FavoritesHandler: "+this.status+" -> "+t),this.status=t},FavoritesRemoveHandler.prototype.isEnded=function(){return this.status===t.ENDING},FavoritesRemoveHandler.prototype.end=function(){this.status=t.ENDING},FavoritesRemoveHandler.prototype.onData=function(e){Logger.info("FavoritesRemoveHandler",this.status),this.status!==t.ENDING&&(this.status===t.BEGINNING&&(this.favoritesHandler.isInList()?this.changeStatus(t.REMOVING_BOARD):this.favoritesHandler.onData(e)),this.status===t.REMOVING_BOARD&&(this.client.write(this.number+"\r\ndy\r\n"),this.callback(null),this.changeStatus(t.ENDING)))},module.exports=FavoritesRemoveHandler}(),function(){var t={BEGINNING:"beginning",MOVING_BOARD:"moving_board",ENDING:"ending"};FavoritesMoveHandler=function(t,e,r,i,n){this.client=t,this.path=e,this.from=r,this.to=i,this.callback=n},FavoritesMoveHandler.prototype.start=function(){this.favoritesHandler=new FavoritesHandler(this.client,this.path,this.callback),this.favoritesHandler.start(),this.status=t.BEGINNING},FavoritesMoveHandler.prototype.changeStatus=function(t){Logger.info("FavoritesHandler: "+this.status+" -> "+t),this.status=t},FavoritesMoveHandler.prototype.isEnded=function(){return this.status===t.ENDING},FavoritesMoveHandler.prototype.end=function(){this.status=t.ENDING},FavoritesMoveHandler.prototype.onData=function(e){Logger.info("FavoritesMoveHandler",this.status),this.status!==t.ENDING&&(this.status===t.BEGINNING&&(this.favoritesHandler.isInList()?this.changeStatus(t.MOVING_BOARD):this.favoritesHandler.onData(e)),this.status===t.MOVING_BOARD&&(this.client.write(this.from+"\r\nM"+this.to+"\r\n"),this.callback(null),this.changeStatus(t.ENDING)))},module.exports=FavoritesMoveHandler}(),function(){var t={BEGINNING:"beginning",POSTING:"posting",ENDING:"ending"};CommentHandler=function(t,e,r,i,n,s){switch(this.client=t,this.callback=s,this.content=n,this.type=i,i){case"like":this.typeNum=1;break;case"dislike":this.typeNum=2;break;case"neutral":this.typeNum=3}this.boardName=e,this.articleNum=r},CommentHandler.prototype.start=function(){this.articleHandler=new ArticleHandler(this.client,this.boardName,this.articleNum,function(){},function(){}),this.articleHandler.start(),this.status=t.BEGINNING},CommentHandler.prototype.changeStatus=function(t){Logger.info("CommentHandler: "+this.status+" -> "+t),this.status=t},CommentHandler.prototype.isEnded=function(){return this.status===t.ENDING},CommentHandler.prototype.end=function(){this.status=t.ENDING},CommentHandler.prototype.onData=function(e){if(Logger.info("CommentHandler",this.status),this.status!==t.ENDING&&(this.status===t.BEGINNING&&(this.articleHandler.isSelected()?(this.changeStatus(t.POSTING),this.client.write("%")):this.articleHandler.onData(e)),this.status===t.POSTING))if("作 者 本 人"===e.getText(22,1,8)||"時 間 太 近"===e.getText(22,1,8))this.client.write(this.content+"\r\ny\r\n"),this.callback(null),this.changeStatus(t.ENDING);else if("您 覺 得 這 篇 文 章"===e.getText(23,1,14))this.client.write(this.typeNum+""),this.client.write(this.content+"\r\ny\r\n"),this.callback(null),this.changeStatus(t.ENDING);else if(e.getText(23,0,80).indexOf("本 板 禁 止 快 速 連 續 推 文")){var r=e.getText(23,0,80).removeSpace(),i=/請再等\s*(\d+)\s*秒/,n=r.match(i);if(null!==n){var s=parseInt(n[1]);this.callback({message:"comment_delayed",delay:s}),this.changeStatus(t.ENDING)}}},module.exports=CommentHandler}(),"undefined"==typeof IS_ON_IOS&&(IS_ON_IOS=!1),require("./uao"),require("./board_list"),require("./utils"),require("./logger"),require("./handlers/LoginHandler"),require("./handlers/LogoutHandler"),require("./handlers/HotHandler"),require("./handlers/FavoritesHandler"),require("./handlers/FavoritesAddHandler"),require("./handlers/FavoritesMoveHandler"),require("./handlers/FavoritesRemoveHandler"),require("./handlers/BoardHandler"),require("./handlers/ArticleHandler"),require("./handlers/CommentHandler"),require("./handlers/BoardNameFetcher"),require("./term.js"),term=new Terminal({cols:80,rows:24,screenKeys:!0});var handler=null,client,byteBuffer=[];if(IS_ON_IOS)client={write:writeMessage};else{var net=require("net"),Iconv=require("iconv").Iconv,iconv=new Iconv("BIG5","UTF-8//TRANSLIT//IGNORE");client=net.connect(23,"ptt.cc",function(){Logger.info("Client Connected")});var oldWrite=client.write;client.write=writeMessage,client.writeByteArray=function(t){oldWrite.call(client,new Buffer(t))},client.on("data",function(t){receivedFromPTT(Array.prototype.slice.call(t,0))}),client.on("end",function(){Logger.info("Client Disconnected")})}var nextHandler=null,PTT={registerSendToPTTCallback:function(t){client.writeByteArray=t},receivedFromPTT:receivedFromPTT,login:function(t,e,r){registerNextHandler(new LoginHandler(client,t,e,r))},logout:function(t){registerNextHandler(new LogoutHandler(client,t))},getHot:function(t){registerNextHandler(new HotHandler(client,t))},getBoard:function(t,e,r){registerNextHandler(new BoardHandler(client,t,e,r))},searchBoard:function(t,e,r,i){registerNextHandler(new BoardHandler(client,t,e,r,i))},getArticle:function(t,e,r,i){registerNextHandler(new ArticleHandler(client,t,e,r,i))},getSearchedArticle:function(t,e,r,i,n){registerNextHandler(new ArticleHandler(client,t,e,r,i,n))},postComment:function(t,e,r,i,n){registerNextHandler(new CommentHandler(client,t,e,r,i,n))},getFavorites:function(t,e){registerNextHandler(new FavoritesHandler(client,t,e))},addFavorite:function(t,e,r){registerNextHandler(new FavoritesAddHandler(client,t,e,r))},removeFavorite:function(t,e,r){registerNextHandler(new FavoritesRemoveHandler(client,t,e,r))},moveFavorite:function(t,e,r,i){registerNextHandler(new FavoritesMoveHandler(client,t,e,r,i))},fetchBoardNames:function(t){registerNextHandler(new BoardNameFetcher(client,t))}};client.setTimeout=function(t,e){client.timeoutStamp=Math.random();var r=client.timeoutStamp;setTimeout(function(){client.timeoutStamp===r&&(e.isEnded()||(client.write("\r\n"),e.callback({message:"timeout"}),e.end()))},t)};var mainIter=function(){null!==nextHandler&&(-1!==term.getAllTexts().join("").indexOf("(G)oodbye")||nextHandler instanceof LoginHandler?(null===handler||handler.isEnded()||(handler.callback({message:"interrupted"}),handler.end()),handler=nextHandler,nextHandler=null,handler.start()):client.write("q")),setTimeout(mainIter,10)};mainIter(),module.exports=PTT;