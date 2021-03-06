/////////////////////////////////////////////////////
///                                               ///
///                                               ///
/////////////////////////////////////////////////////

const listOfWords = stringOfWords.split(" ");

let currWord = '';
let word = '';
let charLimit;

// Define number of tries for current game
const tries = 6;

let triedWords = [];
let fullEval   = []; 

let wholeLineIsFilled = false;
let gameTipVisible    = false; 
let gameWon           = undefined;
let currentGame;

let currChar = 0;
let currTry  = 0;
let blockedChars = [];

if(localStorage.getItem('lsCleared')){
    console.log('all good')
} else {
    localStorage.clear();
    localStorage.setItem('lsCleared', 'done');
}

if(localStorage.getItem('allGames')){
    fillStats();
    $('#stats-btn').show();
}

if(localStorage.getItem('thisGame')){
    
    currentGame = localStorage.getItem('thisGame'),
    currentGame = JSON.parse(currentGame);
    fullEval    = currentGame.evals;
    
    for(var i = 0; i < currentGame.state.length; i++){
        triedWords.push(currentGame.state[i])
    }
    
    savedTries = currentGame.tries;
    currWord   = currentGame.word;
    word       = currWord.toUpperCase();
    currTry    = currentGame.tries;
    charLimit  = word.length;
    
    moveCurrLine(currTry);
    fillBoardFromLocalS(currentGame, charLimit);
} else {
    currWord = listOfWords[Math.floor(Math.random() * listOfWords.length)];
    word = currWord.toUpperCase();
    charLimit = word.length;
    
    fillBoardFromScratch();
}
//console.log(currWord)

// Handle character click
$('.char-key').click(function(e){
    checkKey($(this), $(this).text())
})

// Function for handling which key has been tried
function checkKey(key, val){
    $('.char-block').removeClass('invalid');
    if(!$(this).hasClass('blocked')){
        if(currChar < charLimit){
            $(key).addClass('try' + currChar);
            $(key).addClass('trying')
            $('.char-line').eq(currTry).find('.char-block').eq(currChar).text(val).addClass('filled');
            currChar++;      
        }
    }
}

function checkTry(){
    if(lineIsFilled(currTry)){
        if(checkIfIsWord(currTry)){
            let lineEvaluation = [];
            
            var tryWord = '';
//            $('#your-tries').text(currTry+1);
            $('.char-line').eq(currTry).find('.char-block').each(function(i){
                tryWord += $(this).text();
                var char = $(this).text();
                var charIndex = i;
                var evaluation = 'neutral';

                if(word.includes(char)){
                    $(this).addClass('correct-char');
                    evaluation = 'correct-char';
                } else {
                    $('.try'+charIndex).addClass('blocked');
                }
                if(char == word[charIndex]){
                    $(this).removeClass('correct-char');
                    $(this).addClass('correct-pos');
                    evaluation = 'correct-pos';
                }

                lineEvaluation.push(evaluation)
                console.log(lineEvaluation);
            })
            if(tryWord == word){
                gameWon = true;
                $('.curr-line').addClass('winner-line');
                setTimeout(function() {
                    $('#msg').text('Gratulerer! Du klarte dagens ord: ' + word + '. Refresh siden for nytt ord.')
                    $('#overlay').addClass('show');
                }, 2000);
            } else {
                currTry++;
                currChar = 0;
                clearTries(); 
            }

            if(tryWord != word && currTry >= tries){
                gameWon = false;
                $('.curr-line').addClass('loser-line');
                setTimeout(function() {
                    $('#msg').text('Du klarte dessverre ikke dagens ord: ' + word)
                    $('#overlay').addClass('show');
                }, 2000);
            } else {
                moveCurrLine(currTry);
            }

            triedWords.push(tryWord);
            fullEval.push(lineEvaluation);
            saveToLocalS(currWord, currTry, triedWords, fullEval, gameWon)
            
        } else {
            $('.curr-line').addClass('not-a-word-line');
        }
    }
}

function backspace(){
    if(currChar > 0){
        currChar--;
        var key = $('.try'+currChar);
        $(key).removeClass('trying try'+currChar);
        $('.char-line').eq(currTry).find('.char-block').eq(currChar).text('').removeClass('filled');
        
        if($('.curr-line').hasClass('not-a-word-line')){
            $('.curr-line').removeClass('not-a-word-line');
        }
    }
}

function clearTries(){
    $('.char-key').each(function(i) {
      if($(this).hasClass('trying')) $(this).removeClass('trying try0 try1 try2 try3 try4');
    });
}

function lineIsFilled(currentLine){
    $('.char-line').eq(currentLine).find('.char-block').each(function() {
        if ($(this).text() != '') {
            wholeLineIsFilled = true;
        } else{
            $(this).addClass('invalid');
            wholeLineIsFilled = false;
        }
    });
    return wholeLineIsFilled;
}

// Enter & backspace functions
$('#backspace').click(function(e){
    backspace();
})
$('#enter').click(function(e){
    checkTry();
})
$('#tyty').click(function(e){
    $('#overlay').removeClass('show');
})

// Function for moving the current line (highligting word line)
function moveCurrLine(currLine){
    var lineHeight = $('.curr-line').outerHeight();
    var newPos = lineHeight * currLine;
    $('.curr-line').css('top', newPos + 'px');
}
// Handle click on character block
$('.char-block').click(function(e){
    e.stopPropagation();
    if($(this).hasClass('correct-pos')) handleGameTip('Denne bokstaven er p?? riktig plass', $(this))
    if($(this).hasClass('correct-char')) handleGameTip('Ordet inneholder minst ??n av denne bokstaven', $(this))
})

function handleGameTip(tip, el){
    // Position tooltip (top and left)
    $('#game-tip').css({
        left: $(el).position().left + ($(el).outerWidth() / 2) + 'px',
        top: $(el).position().top + $(el).outerHeight() + 'px'
    })
    // Fill gameTip with tip-text
    $('#game-tip').text(tip)
    // Toggle gametip
    if(!gameTipVisible){
        showGameTip(tip, el);
    } else {
        hideGameTip();   
    }
}
// Function for showing gametip
function showGameTip(tip, el){
    $('#game-tip').css('display', 'block');
    $('.char-block, .curr-line').addClass('fade-out');
    $(el).removeClass('fade-out');
    gameTipVisible = true;   
}
// Function for hiding gametip
function hideGameTip(){
    $('#game-tip').css('display', 'none');
    $('.char-block, .curr-line').removeClass('fade-out');
    gameTipVisible = false; 
}

function saveToLocalS(cw, ct, state, evals, w){
    
    let currentw = cw,
        currentt = evals.length,
        currentstate = state,
        currentevals = evals,
        wol = w;
    
    let thisGame = { 
        'word': currentw, 
        'tries': currentt,
        'state': currentstate,
        'evals': currentevals,
        'won': wol,
        'date': getFormattedDate()
    };
    
    let allGames = [];
    
    // If game is started (atleast one word tried) - do this:
    if(w == undefined){
        localStorage.setItem('thisGame', JSON.stringify(thisGame));
    }
    // If game is won or lost - do this
    if(w == false || w == true){
        var prevGames;
        if(localStorage.getItem('allGames')){
            prevGames = localStorage.getItem('allGames');
            prevGames = JSON.parse(prevGames);
            for(var i = 0; i < prevGames.length; i++){
                allGames.push(prevGames[i])
            }
        }
        allGames.push(thisGame);
        localStorage.setItem('allGames', JSON.stringify(allGames));
        gameWon = undefined;
        localStorage.removeItem('thisGame');
    }
}

function fillBoardFromScratch(){
    for (var i = 0; i < tries; i++) {
        var newdiv = $('<div/>', {
            "class": "char-line"
        });
        for (var j = 0; j < charLimit; j++){
           $(newdiv).append('<div class="char-block"></div>'); 
        }
        $('#game').append(newdiv);
    }
}

function fillBoardFromLocalS(g, charLimit){
    var storedTries = g.evals; 
    var storedWords = g.state;
    // Fill board with words from stored tries
    for (var i = 0; i < storedTries.length; i++){
        var newdiv = $('<div/>', {
            "class": "char-line"
        });
        for (var j = 0; j < storedTries[i].length; j++){
            $(newdiv).append('<div class="char-block '+storedTries[i][j]+'">'+storedWords[i][j]+'</div>'); 
            if(storedTries[i][j] == 'neutral') blockedChars.push(storedWords[i][j])
        }
        $('#game').append(newdiv);
    }
    // Fill rest of board with empty blocks
    for (var i = 0; i < tries - storedTries.length; i++) {
        var newdiv = $('<div/>', {
            "class": "char-line"
        });
        for (var j = 0; j < charLimit; j++){
           $(newdiv).append('<div class="char-block"></div>'); 
        }
        $('#game').append(newdiv);
    }
    
    // Block keys that have been used
    for(var i = 0; i < blockedChars.length; i++){
        $('.key').each(function( index ) {
          if($(this).text() == blockedChars[i]){
              $(this).addClass('blocked');
          }
        });
    }
}

function checkIfIsWord(currTry){
    var tryWord = '';
    $('.char-line').eq(currTry).find('.char-block').each(function(i){
        tryWord += $(this).text();
    })
    console.log(tryWord);
    for(var i = 0; i < listOfWords.length; i++){
        if(tryWord == listOfWords[i]) return true;
    }
}

$('html, body, #game').click(function(e){
    hideGameTip();
})

$('#stats-btn').click(function(e){
    $(this).toggleClass('active');
    $('#stats').toggle();
    if($('#how-to').is(':visible')){
        $('#how-to').hide()
        $('#how-to-btn').removeClass('active');
    }
})
$('#how-to-btn').click(function(e){
    $(this).toggleClass('active');
    $('#how-to').toggle();
    if($('#stats').is(':visible')){
        $('#stats').hide()
        $('#stats-btn').removeClass('active');
    }
})



function fillStats(){
    let stats = localStorage.getItem('allGames');
        stats = JSON.parse(stats);
    
    for(var i = 0; i < stats.length; i++){
        $('#your-stats').append('<div class="stat-item"><span class="stat-word">' + stats[i].word + '</span><span class="stat-tries">' + stats[i].tries + '</span><span class="stat-date">' + stats[i].date + '</span></div>')
    }
}













