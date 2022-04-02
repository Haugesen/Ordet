/////////////////////////////////////////////////////
///                                               ///
///     ORIGINAL IDEA IS "WORDLE" BY NY-TIMES     ///
///                                               ///
///     This game utilize localStorage in         ///
///     order to keep track of boardstate         ///
///     and game progression.                     ///
///                                               ///
///     Created by: Joachim Hauge                 ///
///                                               ///
/////////////////////////////////////////////////////

const listOfWords = stringOfWords.split(" ");

let currWord = '';
let word = '';
let charLimit;

// Define number of tries for current game
const tries = 5;

let triedWords = [];
let fullEval = []; 

let wholeLineIsFilled = false;
let gameTipVisible = false; 
var gameWon = undefined;

let currChar = 0;
let currTry = 0;

if(localStorage.getItem('thisGame')){
    var currentGame = localStorage.getItem('thisGame'),
        currentGame = JSON.parse(currentGame);
    
    currWord = currentGame.word;
    word = currWord.toUpperCase();
    currTry = currentGame.tries;
    moveCurrLine(currTry);
//    $('#your-tries').text(currTry);
    charLimit = word.length;
    
    fillBoardFromLocalS(currentGame, charLimit);
} else {
    currWord = listOfWords[Math.floor(Math.random() * listOfWords.length)];
    word = currWord.toUpperCase();
    charLimit = word.length;
    
    fillBoardFromScratch();
}

console.log(currWord)

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
            
            var lineEvaluation = []
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
            })
            if(tryWord == word){
                gameWon = true;
                $('.curr-line').addClass('winner-line');
                setTimeout(function() {
                    $('#msg').text('Gratulerer! Du klarte dagens ord: ' + word)
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
    if($(this).hasClass('correct-pos')) handleGameTip('Denne bokstaven er på riktig plass', $(this))
    if($(this).hasClass('correct-char')) handleGameTip('Ordet inneholder minst én av denne bokstaven', $(this))
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
    
    var cw = cw,
        ct = evals.length,
        state = state,
        evals = evals,
        w = w;
    
    var thisGame = { 
        'word': cw, 
        'tries': ct,
        'state': state,
        'evals': evals,
        'won': w,
        'date': getFormattedDate()
    };
    
    var allGames = [];
    
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
    // First fill board with words from stored tries
    for (var i = 0; i < storedTries.length; i++){
        var newdiv = $('<div/>', {
            "class": "char-line"
        });
        for (var j = 0; j < storedTries[i].length; j++){
            $(newdiv).append('<div class="char-block '+storedTries[i][j]+'">'+storedWords[i][j]+'</div>'); 
        }
        $('#game').append(newdiv);
    }
    // First rest of board
    for (var i = 0; i < tries - storedTries.length; i++) {
        var newdiv = $('<div/>', {
            "class": "char-line"
        });
        for (var j = 0; j < charLimit; j++){
           $(newdiv).append('<div class="char-block"></div>'); 
        }
        $('#game').append(newdiv);
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





