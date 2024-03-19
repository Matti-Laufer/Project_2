$(()=>{
// localStorage.clear(); // checking if GET works
// allCryptoCoins.clear(); // checking if GET works

var coinsToShow = 100;  // how many coins to display on the screen
// Coin List Data - API URL
const allTheCoinsListURL = "https://api.coingecko.com/api/v3/coins/list";
// Coin Live Data
const coinDataURL = "https://api.coingecko.com/api/v3/coins/";
// const coinLiveChartURL = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BTC,zoc&tsyms=USD,ils,eur";

// More-Info Saved Coins Array - Delete Coins Data By This Timer
const timerForDeleteSavedCoin = 2 * 60 * 1000; // 2 - Mins * Sec * MilSec

//****************************************************
// JSON Deserialization Into An Object Model - Class Coin
//****************************************************
class Coin {
    constructor(obj){
        this.coinId = obj.id;
        this.coinSymbol = obj.symbol;
        this.coinName = obj.name;
        // optional - need to delete after 2 min - only from second api call - more info
        this.toggle = false;
    }
};
//****************************************************

// Searching for Local Data, if empty than reset the data holder
var allCryptoCoins = JSON.parse(localStorage.getItem("allCryptoCoins"));
if (allCryptoCoins === null){
    allCryptoCoins = [];
};

// Time handling - the format is HOUR * MINUTE * SECONDS * MILLI-SECOND.
const timeForListDataRefresh = 24 * 60 * 60 * 1000; // 24 hours - 1 day
const nowTime = new Date();
var lastUpdate = new Date(JSON.parse(localStorage.getItem("lastUpdate")));
const refreshHolder = new Date(lastUpdate).getTime() + timeForListDataRefresh;

// if time passed, Make Coin List Data Update
if (nowTime.getTime() >= refreshHolder){
    $.ajax({
        type: 'GET',
        url: allTheCoinsListURL,
        beforeSend: () => {
            $("#spinnerDiv").css("visibility","visible").fadeIn(250);
        },
        complete: () => {
            $("#spinnerDiv").css("visibility","hidden").fadeOut(250);
            showCoins();
        },
        success: (data) => {
            // when getting the data - reset of the data holder
            resetAllCryptoCoins();
            AllCoinsDataValidation (data);
            // Saving Updated time
            lastUpdate = new Date();
            localStorage.setItem("lastUpdate", JSON.stringify(lastUpdate));
        }
    })

} else showCoins();
// } else showCoins(allCryptoCoins);

resetAllCryptoCoins = () => {
    // allCryptoCoins = [];
    allCryptoCoins.length = 0;
    console.log("Data was Just Deleted for an Update");
};

function AllCoinsDataValidation (data){
    for (let coin in data){
        // Filtering Real Coins
        if ($.isNumeric(data[coin].symbol[0]) ||
            $.isNumeric(data[coin].id[0] ||
            $.isNumeric(data[coin].name[0])) ||
            data[coin].symbol.length === 3  ){ 
                // Pushing Real Coins into Holder Array
                allCryptoCoins.push(new Coin (data[coin]));
            };
    };
    // Saving Data 
    localStorage.setItem("allCryptoCoins", JSON.stringify(allCryptoCoins));
};

console.log(allCryptoCoins);

// Coin Injection to the Screen
function showCoins (){
    // console.log(allCryptoCoins);
for (let count = 0; count <= coinsToShow; count++){
//!!!!!!! MISSING in SWITCH -> ${cryptoCoins.find(coin => coin.symbol === searchValue).picked ? 'checked' : ''}
$("#coinsHomeDivRow").append(`
    <div class="card col-md-4 col-xl-4 col-lg-4 col-sm-12">
        <div class="mx-2 mt-2 d-flex justify-content-between">
            <h5 class="card-title">${allCryptoCoins[count].coinSymbol.toUpperCase()}</h5>
            <div class="form-check form-switch">
                <input class="form-check-input allCoinsCheckBox" name="${allCryptoCoins[count].coinId}" type="checkbox" role="switch" ${allCryptoCoins[count].toggle ? "checked" : ""}>
            </div>
        </div>
        <div class="card-body">
            <p class="card-text">${allCryptoCoins[count].coinName}</p>
            <div class="text-center">
                <button type="button" id="${allCryptoCoins[count].coinId}" class="moreInfo btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    More Info
                </button>
            </div>
        </div>
    </div>
`);
};
};
// showCoins();

// ******************************************************************

// Toggle management Class
class ToggleCoin {
    constructor(obj, toggle){
        this.coinId = obj.coinId;
        this.coinSymbol = obj.coinSymbol;
        // this.coinName = coinName;
        this.toggle = toggle;
    }
};

// Toggled coins Array Validation
var pickedCoins = JSON.parse(localStorage.getItem('pickedCoins'));
if (pickedCoins === null){
    pickedCoins = [];
};

// saveAllData();
// Save All Data - Both Arrays
saveAllData = () => {
localStorage.setItem('pickedCoins', JSON.stringify(pickedCoins));
localStorage.setItem("allCryptoCoins", JSON.stringify(allCryptoCoins));
};

// Clear all picked coins
clearAllToggles = () =>{
    pickedCoins.length = 0;
    localStorage.setItem('pickedCoins', JSON.stringify(pickedCoins));
}
// clearAllToggles();
// localStorage.clear();

// modal of toggles handlers
const pickedCoinsModal = new bootstrap.Modal("#pickedCoinsModal");
const modalOfToggles = $("#pickedCoinsModal");

// Toggle Button handler
$(".allCoinsCheckBox").change(function(){
    let picked = $(this).attr("name"); // coinId - DOM Reference Value
    let pickedCoin = allCryptoCoins.find(coin => coin.coinId === picked); // First Object from Array
    pickedCoin.toggle = !pickedCoin.toggle; // All Coins Toggle Switching

    console.log("all toggled coins array",pickedCoins);

    if (!pickedCoin.toggle){ // If The Toggle Was On => Remove & Delete it
        // console.log("i exist", pickedCoin.toggle);
        deletePickedCoin(picked); // Remove & Delete it
        } else { // If Not => Insert Toggled Coin into Array
            // console.log("passed me");
            pickedCoins.push(new ToggleCoin(pickedCoin, true)); // Insert Toggled Coin into Array
            }
    if (pickedCoins.length > 5){ // If Array 5+ => Open The Modal
        pickedCoinsRemoveModal(); // Modal Open
        } 
        // Save Changes
        saveAllData();
});


// Firing up after remove button pressed
pickedCoinsModalBtnFnc = (modalElement) => {
    console.log("im pressed", modalElement);
    let picked = modalElement.name; //coinId <----------
    console.log("picked", picked);

    // let pickedCoin = pickedCoins.find(coin => coin.coinId === picked);
    // console.log("an object retrieved after the selection ",pickedCoin);
    deletePickedCoin(picked);
};

// Toggles Deletion Of : AllCoins Array & PickedCoins Array
function deletePickedCoin(picked){
    pickedCoins = pickedCoins.filter(coin => coin.coinId !== picked); // Returns A New Array Without The "picked" Coin
    let pickedCoin = allCryptoCoins.find(coin => coin.coinId === picked); // Point The Coin in AllCoins array
    pickedCoin.toggle = false;
    saveAllData();  // Saving Changes
    // Refresh The Screen! - Not User Friendly - !Need Better Solution!
    location.reload(true);
};

// Removal Modal
function pickedCoinsRemoveModal (){
        // Modal Opening for deselection
        pickedCoinsModal.show(modalOfToggles);
        // Modal Injection of options to deselect one
        $(".picked-modal-body").html(``); //Cleanup
        for (let item of pickedCoins){
            // console.log("item of pickedCoins ",pickedCoins[item]);
            // console.log("im the modal body items ",item);
            $(".picked-modal-body").append(`
            <div class="card col-10">
            <div class="mx-2 my-2 d-flex justify-content-between">
                <h5 class="my-auto card-title">${item.coinSymbol.toUpperCase()}</h5>
                <button type="button" class="btn btn-outline-primary" name="${item.coinId}" data-bs-dismiss="modal" onclick="pickedCoinsModalBtnFnc(this)">Remove</button>
            </div>
            `);
        };
};

// Modal Abort Button - Return to last State
$("#pickedCoinsAbort").on("click", function() {
    let picked = pickedCoins[pickedCoins.length-1]; // Points To The Last Item In The Array
    deletePickedCoin(picked.coinId); // Delete the last Item & Refresh
});


// Search Bar Button Handling - Showing Searched Coin
$("#myForm").submit(function(event){
    event.preventDefault();
    // event.stopPropagation();
    $("#coinsHomeDivRow").empty();
let searchedValue = $("#searchCoin").val().toString().toLowerCase()
// checking if too short - validation
if  (searchedValue.length <= 2){
    console.log("to short :",searchedValue);
    return;
} 

/////// need to check DOM!!
// push searched coins into an array
let searchedCoinsArray = [];
for (let coin of allCryptoCoins){
    if (coin.coinSymbol.toString().toLowerCase() === searchedValue){
        searchedCoinsArray.push(coin);
    };
};
// Inject coins after search
searchedCoinDisplay (searchedCoinsArray);
});

// Display the searched coins
function searchedCoinDisplay (searchedCoinsArray) {
// coins injection from saved search array
if (searchedCoinsArray){
// $("#coinsHomeDivRow").empty();
for (let coin of searchedCoinsArray){
    console.log(coin);
    // $("#coinsHomeDivRow").empty()
        $("#coinsHomeDivRow").append(`
    <div class="card col-md-4 col-xl-4 col-lg-4 col-sm-12">
        <div class="mx-2 mt-2 d-flex justify-content-between">
            <h5 class="card-title">${coin.coinSymbol.toUpperCase()}</h5>
            <div class="form-check form-switch">
                <input class="form-check-input allCoinsCheckBox" name="${coin.coinId}" type="checkbox" role="switch" ${coin.toggle ? "checked" : ""}>
            </div>
        </div>
        <div class="card-body">
            <p class="card-text">${coin.coinName}</p>
            <div class="text-center">
                <button type="button" id="${coin.coinId}" class="moreInfo btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    More Info
                </button>
            </div>
        </div>
    </div>
`);
};
};
};

// need to fix - MORE INFO BTN - NOT WORKING after search!!!!!!

// MoreInfo Modal
const moreInfoModal = new bootstrap.Modal("#exampleModal");
const modalToggle = $("#exampleModal");

// More Info event Handler
$(".moreInfo").on("click", function() {
    let thisCoinId = $(this).attr("id");
    console.log("hi: ",thisCoinId);
    //change THIS!!!
    console.log("inside a search");
    let symbol = $(this).parent().parent().parent().children(":first-child").children(":first-child").text();
    console.log(symbol);
    // NEED TO CHANGE HANDLING TO SAVED COIN OR GET

    $("#exampleModalLabel").text(symbol.toUpperCase());
    let coin = allCryptoCoins.find(coin => coin.coinSymbol.toLowerCase() === symbol.toLowerCase())
    console.log("searched for: ",coin);
    //*********************** */
    modalCheckIfExistAndDisplay(coin.coinId);
    //************************ */
    moreInfoModal.show(modalToggle);
});

// Modal closing buttons
$("#modalXBtn,#modalCloseBtn").on('click', function() {
    moreInfoModal.hide(modalToggle);
    });

// Searching for Local Data, if empty than reset the data holder
var savedCoins = JSON.parse(localStorage.getItem("savedCoins"));
if (savedCoins === null){
    savedCoins = [];
};

class SavedCoin {
    constructor(obj, coinId){
        this.coinId = coinId;

        this.imgSrc = obj.image.large
        this.coinUSD = obj.market_data.current_price.usd
        this.coinEUR = obj.market_data.current_price.eur
        this.coinILS = obj.market_data.current_price.ils
        }
        // function cleanUp = this.delete();
        //add cleanup Function of timer that gets a val (2 minutes)
        // and activate the function from outside the class
    }

    // Checking if data was saved, if not, GET new data
function modalCheckIfExistAndDisplay(coinId){
    let thisIsSavedCoin = savedCoins.find(savedCoin => savedCoin.coinId === coinId);
    if (thisIsSavedCoin){
        modalInjectBody(thisIsSavedCoin);
        } else {
            modalGetData (coinId);
        }
};

// GET Data of More Info Modal 
function modalGetData (coinId){
    $.ajax({
        type: 'GET',
        url: coinDataURL+coinId,
        beforeSend: () => {
            $("#spinnerDiv").css("visibility","visible").fadeIn(250);
        },
        complete: () => {
            $("#spinnerDiv").css("visibility","hidden").fadeOut(250);
        },
        success: (data) => {
            saveACoin(data, coinId);
            // savedCoins.push(new SavedCoin (data, coinId));
            // savedCoins.push(data);
            // console.log("inside: ",savedCoins);

            // Re-Handle Received Data
            modalCheckIfExistAndDisplay(coinId);    // Re-Handle Received Data
        }
    })
}
// Saving the AJAX Get Data Of More-Info Modal
function saveACoin(data, coinId){
    savedCoins.push(new SavedCoin (data, coinId));
    // console.log("inside: ",savedCoins);
    localStorage.setItem("savedCoins", JSON.stringify(savedCoins));
    //NEED TO DELETE last coin AFTER 2 MIN!!!!
};

console.log(savedCoins);

// Delete Coin details after "timerForDeleteSavedCoin" -2 min-
// setInterval(() => {
//      savedCoins.length = 0
//      localStorage.removeItem("savedCoins");
//   }, timerForDeleteSavedCoin);

// More Info Modal
function modalInjectBody(data) {
    if(data.coinUSD){
        $(".modal-body").html(`
            <div>
            <img src="${data.imgSrc}" alt="No Icon Found"> <br><br>
            USD : ${data.coinUSD}$ <br><br>
            EUR : ${data.coinEUR}€ <br><br>
            ILS : ${data.coinILS}₪ <br><br>
            </div>
        `);
    } else {
        $(".modal-body").html(`
        <img src="${data.imgSrc}" alt="No Icon Found"> <br><br>
        <div>Current Prices Are Not Available</div>
        `);
    };
};




console.log("Saved Coin - Live Chart Data: ", pickedCoins);
// Need pickedCoins => coinSymbol

// Toggled Coins will be inserted below!


// Data handling to give for Live Chart
// var selectedCoins = "ETH,BTC,BNB,SOL,XRP";
var selectedCoins = ["ETH","BTC","BNB","SOL","XRP"];
var selectedCurrency = "USD";
// var res="";
const LiveCoinsURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins}&tsyms=${selectedCurrency}`;


// Data Receiving - liveCoinData
var liveCoinData = $.getJSON(LiveCoinsURL,res=>{
    console.log("Data Received :",res);
    liveDataHandler(res);
    
    // console.log(`${res[selectedCoins[0]][selectedCurrency]}`);
});

//working!!!!!!!!!!!!!!!
// console.log(liveCoinData);
// console.log(res);
liveDataHandler = (res) => {
    for (item in res){
        // console.log(`${liveCoinData[item]}`);
        // console.log(item);
        // console.log(liveCoinData);
    };
};

// liveDataHandler = (liveCoinData) => {
//     for (item in liveCoinData){
//         console.log(`${liveCoinData[item]}`);

//     };
// };

dataPointsMaker = (selectedCoins) => {
for (item in selectedCoins){
    console.log("selected Coins Item Index: ",item+1);
        // `var dataPoints${item} = []`
    // return `var dataPoints${item} = []`
    console.log("selected Coins Item: ",selectedCoins[item]);
};
};
// console.log(dataPoints1);
dataPointsMaker(selectedCoins); // <= Checking if works

// Live Chart - Multi 5 coin data in 1 Chart
window.onload = function (res) {

    var dataPoints1 = [];
    var dataPoints2 = [];
    var dataPoints3 = [];
    var dataPoints4 = [];
    var dataPoints5 = [];
    // change this to => pickedCoins.Length = dataPoints.Length

    var options = {
        title: {
            text: "Virtual Coins Live Status"
        },
        axisX: {
            title: "Chart updates every 2 secs"
        },
        axisY: {
            suffix: `${selectedCurrency}`    //"Wh"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            fontSize: 22,
            fontColor: "dimGrey",
            itemclick: toggleDataSeries
        },
        data:   [{
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: selectedCoins[0], //"Turbine 1",
            dataPoints: dataPoints1
                },
                {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            showInLegend: true,
            name: selectedCoins[1],
            dataPoints: dataPoints2
                },
                {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            showInLegend: true,
            name: selectedCoins[2],
            dataPoints: dataPoints3
                },
                {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            showInLegend: true,
            name: selectedCoins[3],
            dataPoints: dataPoints4
                },
                {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            showInLegend: true,
            name: selectedCoins[4],
            dataPoints: dataPoints5
                }]
    };
    
    var chart = $("#chartContainer").CanvasJSChart(options);
    
    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
    
    var updateInterval = 2 * 1000; // 2 seconds

    // Data From GET is yValue

    // initial value
    var yValue1 = 0;
    // var yValue1 = `${res[selectedCoins[0]][selectedCurrency]}`;
    var yValue2 = 0;
    var yValue3 = 0;
    var yValue4 = 0;
    var yValue5 = 0;
    
    var time = new Date;
    // starting at 10.00 am
    // time.setHours(10);
    // time.setMinutes(0o0);
    // time.setSeconds(0o0);
    // time.setMilliseconds(0o0);
    
    function updateChart(count) {
        count = count || 1;
            // Generate Code Here!!!!!!!

    
        var deltaY1, deltaY2, deltaY3, deltaY4, deltaY5;
        for (var i = 0; i < count; i++) {
            time.setTime(time.getTime() + updateInterval);
            deltaY1 = -1 + Math.random() * (1 + 1);
            deltaY2 = -1 + Math.random() * (1 + 1);
            deltaY3 = -1 + Math.random() * (1 + 1);
            deltaY4 = -1 + Math.random() * (1 + 1);
            deltaY5 = -1 + Math.random() * (1 + 1);
    
            // INSERT EACH COIN PRICE DATA IN yValue
            // *****************************************
            // adding random value and rounding it to two digits. 
            yValue1 = Math.round((yValue1 + deltaY1) * 100) / 100;      //`${res[selectedCoins[0]][selectedCurrency]}`;
            yValue2 = Math.round((yValue2 + deltaY2) * 100) / 100;
            yValue3 = Math.round((yValue3 + deltaY3) * 100) / 100;
            yValue4 = Math.round((yValue4 + deltaY4) * 100) / 100;
            yValue5 = Math.round((yValue5 + deltaY5) * 100) / 100;
    
            // pushing the new values
            dataPoints1.push({
                x: time.getTime(),
                y: yValue1
            });
            dataPoints2.push({
                x: time.getTime(),
                y: yValue2
            });
            dataPoints3.push({
                x: time.getTime(),
                y: yValue3
            });
            dataPoints4.push({
                x: time.getTime(),
                y: yValue4
            });
            dataPoints5.push({
                x: time.getTime(),
                y: yValue5
            });
        }
    
        // updating legend text with  updated with y Value 
        options.data[0].legendText = `${selectedCoins[0]} : ${selectedCoins[0]["USD"]} ${selectedCurrency}`;      //"Turbine 1 : " + yValue1 + "Wh";
        options.data[1].legendText = "Turbine 2 : " + yValue2 + "Wh";
        options.data[2].legendText = "Turbine 3 : " + yValue3 + "Wh";
        options.data[3].legendText = "Turbine 4 : " + yValue4 + "Wh";
        options.data[4].legendText = "Turbine 5 : " + yValue5 + "Wh";
        $("#chartContainer").CanvasJSChart().render();
    }
    // generates first set of dataPoints 
    updateChart(100);
    setInterval(function () { updateChart() }, updateInterval);
    
    }





});