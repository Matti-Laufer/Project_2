$(()=>{

    // Navigation Bar Handling Logic
// changePage = () => {
// if #homeButton clicked => innerHTML -> div #coinsHomeDiv === showCoins() <- inject data from "allCryptoCoins" Array
// if #liveButton clicked => innerHTML -> div #chartContainer <- inject data from "pickedCoins" Array
// if #aboutButton clicked => innerHTML -> div #about = ABOUT ME PAGE
// };

// Navigation Click Event
$("#homeButton,#liveButton,#aboutButton").on("click", (pickedBtn)=>{
    changePage(pickedBtn.target.id);  // btnID
    // console.log("Response: ",pickedBtn.target.id) <- Button Id
    // console.log("clicked: ",$(this)); <- Window Event
})

// Navigation Handling
changePage = (btnID) => {
    // console.log("clicked: ",btnID);
    switch (btnID) {
        case ("homeButton"):
            // console.log("clicked - homeButton: ",btnID);
            $("#mainDiv").html(`
                <div id="coinsHomeDiv">
                    <div class="row justify-content-center" id="coinsHomeDivRow">
                        <!-- Coins -->
                    </div>
                </div>
            `);
            showCoins();
            break;
        case ("liveButton"):
            // console.log("clicked - liveButton: ",btnID);
            // Live Data Page Loading.....
            $("#mainDiv").html(`
                <div id="liveReports">
                <h3>Live Reports Section</h3>
                <hr>
                <div id="chartContainer" style="height: 300px; width: 100%;"></div>
                </div>
            `);
            liveDataChartPage(selectedCoins);
            // liveDataChartPage ();
            break;
        case ("aboutButton"):
            // console.log("clicked - aboutButton: ",btnID);               
            $("#mainDiv").html(aboutMe);
            // aboutMePage();
    }
};

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

// console.log(allCryptoCoins);

// --- Coin Home Page ---
function showCoins (){
// Coin Injection to the Screen
for (let count = 0; count <= coinsToShow; count++){
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
                <button type="button" class="moreInfo btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    More Info
                </button>
            </div>
        </div>
    </div>
`);
};
};

// ******************************************************************

// Toggle management Class
class ToggleCoin {
    constructor(obj, toggle){
        this.coinId = obj.coinId;
        this.coinSymbol = obj.coinSymbol;
        this.toggle = toggle;
    }
};

// Toggled coins Array Validation
var pickedCoins = JSON.parse(localStorage.getItem('pickedCoins'));
if (pickedCoins === null){
    pickedCoins = [];
};

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
    // $(".allCoinsCheckBox").change(function(){  // Not Global Scope
$(document).on("change", ".allCoinsCheckBox", function() { // On Global Scope
    let picked = $(this).attr("name"); // coinId - DOM Reference Value
    let pickedCoin = allCryptoCoins.find(coin => coin.coinId === picked); // First Object from Array
    pickedCoin.toggle = !pickedCoin.toggle; // All Coins Toggle Switching

    console.log("all toggled coins array",pickedCoins);

    if (!pickedCoin.toggle){ // If The Toggle Was On => Remove & Delete it
        deletePickedCoin(picked); // Remove & Delete it
        } else { // If Not => Insert Toggled Coin into Array
            pickedCoins.push(new ToggleCoin(pickedCoin, true));
            }
    if (pickedCoins.length > 5){ // If Array 5+ => Open The Modal
        pickedCoinsRemoveModal(); // Modal Open
        } 
        saveAllData();  // Save Changes
});


// Firing up after remove button pressed
pickedCoinsModalBtnFnc = (modalElement) => {
    console.log("im pressed", modalElement);
    let picked = modalElement.name; //coinId <----------
    console.log("picked", picked);
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
    // console.log(event);
    event.preventDefault();
    // $("#coinsHomeDivRow").empty();
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
    $("#coinsHomeDivRow").empty();
    for (let coin of searchedCoinsArray){
        console.log("Searched-Coins Array: ",coin);
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
                    <button type="button" class="moreInfo btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        More Info
                    </button>
                </div>
            </div>
        </div>
        `);
    };
    };
};

// MoreInfo Modal
const moreInfoModal = new bootstrap.Modal("#exampleModal");
const modalToggle = $("#exampleModal");

    // More Info event Handler
// $(".moreInfo").on("click", function() {      // Not on Global Scope
$(document).on("click", ".moreInfo", function() { // On Global Scope
    let symbol = $(this).parent().parent().parent().children(":first-child").children(":first-child").text();
    // console.log(symbol);
    $("#exampleModalLabel").text(symbol.toUpperCase());
    let coin = allCryptoCoins.find(coin => coin.coinSymbol.toLowerCase() === symbol.toLowerCase());
    modalCheckIfExistAndDisplay(coin.coinId);
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
var savedDataInterval = setInterval(() => {
        savedCoins.length = 0
        localStorage.removeItem("savedCoins");
    }, timerForDeleteSavedCoin);

    // clearInterval(savedDataInterval);

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

    // Toggled Coins will be inserted below!
var selectedCoins = [];
    // var selectedCoins = ["ETH","BTC","BNB","SOL","XRP"]; // Example
for (let coin of pickedCoins){
    // console.log("Symbol: ", coin.coinSymbol);
    selectedCoins.push(coin.coinSymbol);
    // console.log("Symbols: ", selectedCoins);
};


var selectedCurrency = "USD"; // Currency to Display
const LiveCoinsURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins}&tsyms=${selectedCurrency}`;

// console.log("Selected Coins: ",selectedCoins);

function liveDataChartPage(selectedCoins) {
    var dataPoints = []; // Array to hold data points for all coins

    var options = {
        title: {
            text: "Virtual Coins Live Status"
        },
        axisX: {
            title: "Chart updates every 2 secs"
        },
        axisY: {
            suffix: selectedCurrency
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
        data: []
    };

// Initialize dataPoints array with empty arrays for each coin
selectedCoins.forEach(() => {
    dataPoints.push([]);
})

    selectedCoins.forEach((coin, index) => {
        options.data.push({
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: `###.00${selectedCurrency}`,
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: coin.toUpperCase(),
            dataPoints: dataPoints[index] // Assigning dataPoints array for each coin
        });
    });

    var chart = new CanvasJS.Chart("chartContainer", options);

    function toggleDataSeries(e) {
        if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

    var updateInterval = 2000; // 2 seconds

    function updateChart() {
        $.ajax({
            type: 'GET',
            url: LiveCoinsURL,
            success: function(data) {
                selectedCoins.forEach((coin, index) => {
                    var yValue = data[coin]?.USD || 0; // Using optional chaining and nullish coalescing operator
                    dataPoints[index].push({
                        x: new Date(),
                        y: yValue
                    });
                    // Update legend text
                    options.data[index].legendText = `${coin.toUpperCase()}: ${yValue ? yValue : 'N/A'}${selectedCurrency}`;
                });
                chart.render();
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
            }
        });
    }
    updateChart(); // Initial call to fetch data
    setInterval(updateChart, updateInterval); // Update data at regular intervals
};


// About Page
var aboutMe = `
<div class="container">
                    
<!-- Header -->
<div class="row text-center">

    <div class="col h3">
        About Me Section
        <hr>
    </div>

</div>

<!-- Body -->
<div class="row">

    <!-- Picture - Left -->
    <div class="col-sm-4">
    <!-- Picture -->
    <img class="myPic" src="images/MyPic.jpeg" rounded-3 my-4" alt="My Picture">
    </div>

    <!-- Body - Right -->
    <div class="col-sm-8">

        <div class="text-center h2">Matti Laufer</div>
        <div class="text-center h3">FullStack Web Developer/Programmer</div>

        <!-- Me Section -->
            <p class="text-center">
                <b>"There is a Solution to any Scenario"</b>
            </p>

            <p>
                I'm Matti, 33 years old, Married to Raz.
                Together with us is our loved dog and cat, Jasper and Leo.
                I am really connected to the Culinary world, mushroom gathering, gardening and nature in general.
                I also like 4X4 vehicle drives and motorcycles.
                I grew up together with the rise of the old and modern computer games understanding many technologies on the way.
            </p>
        <!-- Project Section -->
            <p>
                As a Full Stack Web Developer,
                I have successfully designed and implemented several projects,
                showcasing my ability to deliver high-quality solutions.
                I am skilled in front-end development, utilizing languages such as HTML, CSS, JavaScript, and TypeScript.

                In this Project I crafted an InterActive Application,
                Combining my knowledge of the programming languages I've learned,
                Using the Technologies of JQuery, AJAX, BootStrap and live API calls
                as well as a Live Chart Feature using CanvasJS.
            </p>
    </div>

</div>
<!-- Footer -->
<div class="row">

    <!-- GitHub - Left -->
    <div class="col text-end">
    <!-- GitHub -->
        <!-- <button type="button" class="btn btn-link">GitHub</button> -->
        <a class="btn" href="https://github.com/Matti-Laufer" role="button">
            <img class="logoImages gitIMG" src="images/gitHubLogo.png" alt="Github-Logo">
        </a>
    </div>
    
    <!-- LinkedIn - Right -->
    <div class="col">
    <!-- LinkedIn -->
        <!-- <button type="button" class="btn btn-link">LinkedIn</button> -->
        <a class="btn" href="https://www.linkedin.com/in/matti-laufer/" role="button">
            <img class="logoImages LinkedIMG" src="images/linkedInLogo.png" alt="LinkedIn-Logo">
        </a>
    </div>
</div>
</div>
`;


});