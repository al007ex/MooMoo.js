            // =====================================================================
            // 10-assets — the original's markup and styles, character for character.
            // (PORT: the hat icons point at this server's /img/hats/ instead of
            // http://moomoo.io/img/hats/ — same pictures.)
            // =====================================================================

            // F2 — "Auto placement Settings" modal (+ the hat id list in its footer)
            const AUTO_PLACE_HTML = `
<div id="atS" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="closeit">&times;</span>
            <h2 style="font-size: 17px;">Auto placement Settings</h2>
        </div>
        <div class="modal-body" style="font-size: 17px;">
            <div class="flexControl">
                <label class="container">Trap
                    <input type="checkbox" id="myCheck0">
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        <div class="modal-footer">
                <h3 class="HatsID"> id: 51,  name: "Moo Cap" </h3>
                <h3 class="HatsID"> id: 50,  name: "Apple Cap" </h3>
                <h3 class="HatsID"> id: 28,  name: "Moo Head" </h3>
                <h3 class="HatsID"> id: 29,  name: "Pig Head" </h3>
                <h3 class="HatsID"> id: 30,  name: "Fluff Head" </h3>
                <h3 class="HatsID"> id: 36,  name: "Pandou Head" </h3>
                <h3 class="HatsID"> id: 37,  name: "Bear Head" </h3>
                <h3 class="HatsID"> id: 38,  name: "Monkey Head" </h3>
                <h3 class="HatsID"> id: 44,  name: "Polar Head" </h3>
                <h3 class="HatsID"> id: 35,  name: "Fez Hat" </h3>
                <h3 class="HatsID"> id: 42,  name: "Enigma Hat" </h3>
                <h3 class="HatsID"> id: 43,  name: "Blitz Hat" </h3>
                <h3 class="HatsID"> id: 49,  name: "Bob XIII Hat" </h3>
                <h3 class="HatsID"> id: 8,  name: "Bummle Hat" </h3>
                <h3 class="HatsID"> id: 2,  name: "Straw Hat" </h3>
                <h3 class="HatsID"> id: 15,  name: "Winter Cap" </h3>
                <h3 class="HatsID"> id: 5,  name: "Cowboy Hat" </h3>
                <h3 class="HatsID"> id: 4,  name: "Ranger Hat" </h3>
                <h3 class="HatsID"> id: 18,  name: "Explorer Hat" </h3>
                <h3 class="HatsID"> id: 31,  name: "Flipper Hat" </h3>
                <h3 class="HatsID"> id: 1,  name: "Marksman Cap" </h3>
                <h3 class="HatsID"> id: 10,  name: "Bush Gear" </h3>
                <h3 class="HatsID"> id: 48,  name: "Halo" </h3>
                <h3 class="HatsID"> id: 6,  name: "Soldier Helmet" </h3>
                <h3 class="HatsID"> id: 23,  name: "Anti Venom Gear" </h3>
                <h3 class="HatsID"> id: 13,  name: "Medic Gear" </h3>
                <h3 class="HatsID"> id: 9,  name: "Miners Helmet" </h3>
                <h3 class="HatsID"> id: 32,  name: "Musketeer Hat" </h3>
                <h3 class="HatsID"> id: 7,  name: "Bull Helmet" </h3>
                <h3 class="HatsID"> id: 22,  name: "Emp Helmet" </h3>
                <h3 class="HatsID"> id: 12,  name: "Booster Hat" </h3>
                <h3 class="HatsID"> id: 26,  name: "Barbarian Armor" </h3>
                <h3 class="HatsID"> id: 21,  name: "Plague Mask" </h3>
                <h3 class="HatsID"> id: 46,  name: "Bull Mask" </h3>
                <h3 class="HatsID"> id: 14,  name: "Windmill Hat" </h3>
                <h3 class="HatsID"> id: 11,  name: "Spike Gear" </h3>
                <h3 class="HatsID"> id: 53,  name: "Turret Gear" </h3>
                <h3 class="HatsID"> id: 20,  name: "Samurai Armor" </h3>
                <h3 class="HatsID"> id: 16,  name: "Dark Knight" </h3>
                <h3 class="HatsID"> id: 27,  name: "Scavenger Gear" </h3>
                <h3 class="HatsID"> id: 40,  name: "Tank Gear" </h3>
                <h3 class="HatsID"> id: 52,  name: "Thief Gear" </h3>
                <h3 class="HatsID"> id: 55,  name: "Bloodthirster" </h3>
                <h3 class="HatsID"> id: 56,  name: "Assassin Gear" </h3>
        </div>
    </div>
</div>
`;
            const AUTO_PLACE_CSS = `
.keyPressLow {
    margin-left: 8px;
    font-size: 16px;
    margin-right: 8px;
    height: 25px;
    width: 50px;
    background-color: #fcfcfc;
    border-radius: 3.5px;
    border: none;
    text-align: center;
    color: #4A4A4A;
    border: 0.5px solid #f2f2f2;
}
.menuPrompt {
    font-size: 17px;
    font-family: 'Hammersmith One';
    color: #4A4A4A;
    flex: 0.2;
    text-align: center;
    margin-top: 10px;
    display: inline-block;
}
.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    overflow: auto;
    height: 100%;
    width: 100%;
}
.modal-content {
    margin: 10% auto;
    width: 40%;
    box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);
    font-size: 14px;
    line-height: 1.6;
}
.modal-header {
    background: #000000;
    padding: 15px;
    color: #fff;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}
.modal-body {
    padding: 10px 20px;
    background: #fff;
}
.modal-footer {
    background: #000000;
    padding: 10px;
    color: #fff;
    text-align: center;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}
.closeit {
    color: #FF1100;
    float: right;
    font-size: 25px;
    color: #FF1100;
}
.closeit:hover,
.closeit:focus {
    color: #9e0c02;
    text-decoration: none;
    cursor: pointer;
}
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}
.container:hover input ~ .checkmark {
  background-color: #ccc;
}
.container input:checked ~ .checkmark {
  background-color: #000000;
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

`;

            // the CloudyMod stylesheet (hat change alert, autopilot box, map pulse, BOT text, ...)
            const CLOUDY_CSS = `

	#sback, #okbtn {
		font-family: sans-serif;
		font-weight: 300;
		border: none;
		outline: none;
		font-size: 15px;

	}

	#sback {

		border-radius: 5px;
		padding: 9px;
		cursor: pointer;
		margin-top: -1.5px;
		background-color: #d85858;
		color: white;


	}

	#okbtn {

		border-radius: 5px;
		padding: 9px;
		cursor: pointer;
		margin-top: -1.5px;
		background-color: #7399d6;
		color: white;

	}

	#flexlow {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;

	}

	#changeAlert {
		font-family: sans-serif;
		font-weight: 200;
		font-size: 23px;


	}

	#typealert {
		font-family: sans-serif;
		font-weight: 200;
		font-size: 17px;
		width: 95%;
		margin-left: 2.5%;
		text-align: center;
		margin-top: 5.5px;
	}

#hatChangeAlert {
    position: absolute;
    padding: 5px;
    top: -300px;
    opacity: 0;
    left: 20px;
    width: 300px;
    height: 165px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);



}

#changeAlert {
 display: inline-block;

}

#hatimgmain {
 	width: 50px;
 	height: 50px;
 	display: inline-block;


}

#flextop {
	display: flex;
	width: 100%;
	justify-content: space-evenly;
	align-items: center;

}

#tbtn {
 position: absolute;
 left: 0;
 top: 0;
 width: 80px;
 height: 80px;
 opacity: 0;

}

.chosenhat {
  border: 1px solid #7daaf2;
}

.chosenwing {
  border: 1px solid #7daaf2;
}

.inalertHat {
     margin-left: 30px !important;
     margin-top: 10px !important;
}

.inalertWing {
     margin-left: 30px !important;
     margin-top: 10px !important;
}

option {
  border-radius: 0px;
}

#hrule {
  margin-top: 20px;
}

#endwrap {
 margin-top: 15px;
 width: 100%;
text-align: center;
margin-bottom: -15px;
}

#createEnd {
width: 100%;
text-align: center;
margin: 0 auto;

}

.lowprompt {
margin-bottom: -100px !important;

}


.lowpromptdetail {
margin-left: 25px;
color: #4c4c4c !important;
margin-top: 20px !important;
margin-bottom: 0 !important;

}

.toplow {
  margin-top: 10px !important;
}


.objplace {
   width: 45px;
   height: 45px;
   margin-bottom: -17px;
   border: 0.5px solid #f2f2f2;
   border-radius: 10px;
   margin-left: 5px;
   cursor: pointer;
}

.selPrev {
width: 80px;
height: 80px;
display: block;
margin: auto;
margin-top: 10px;

}

#choiceWrap {
display: flex;
justify-content: space-evenly;
align-items: center;


}

#middlePlus {
display: inline-block;
width: 50px;
height: 50px;
font-weight: 100;
font-family: sans-serif;
color: #4A4A4A;
opacity: 0.8;

}

.selectObj {
cursor: pointer;
 width: 100px;
height: 100px;
background-color: #fcfcfc;
display: inline-block;
border-radius: 10px;
 box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}


.selectObjAlert {
 cursor: pointer;
 width: 100px;
 height: 100px;
 background-color: #fcfcfc;
 display: inline-block;
 border-radius: 10px;
 box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}

#mnwrap {
  width: 100%;
text-align: center;
margin-bottom: -7px;
margin-top: 8px;
}

#flexControl {


}

#keyPress {
   margin-left: 20px;
   height: 20px;
   width: 50px;
   background-color: #e5e3e3;
   border-radius: 7.5px;
font-size: 16px;
border: none;
text-align: center;
color: #4A4A4A;

}

.keyPressLow {
margin-left: 8px;
font-size: 16px;
margin-right: 8px;
   height: 25px;
   width: 50px;
   background-color: #fcfcfc;
   border-radius: 3.5px;
border: none;
text-align: center;
color: #4A4A4A;
   border: 0.5px solid #f2f2f2;


}

#keyPress:focus {
border: none;
outline: none;
}

.keyPressLow:focus{

outline: none;
}

input[type=range] {
  -webkit-appearance: none;
  margin-top: 0px;
  width: 100%;
}
input[type=range]:focus {
  outline: none;
}
#healSlider::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  animate: 0.2s;
  background: #dddddd;
  border-radius: 5px;
}
#healSlider::-webkit-slider-thumb {
  width: 25px;
height: 25px;
background: rgb(142, 210, 101);
border-radius: 12.5px;
margin-top: -6.25px;
  -webkit-appearance: none;

}


#speedContain {
width: 80%;
height: 40px;
background-color: #75d679;
border-radius: 20px;
margin-left: 10%;
box-shadow: 1px 1px 4px gray;
}

#currentSpeed {
height: 40px;
width: 100%;
text-align: center;

color: white;
font-weight: 400 !important;
font-family: sans-serif;
font-size: 20px;
}

#numfocus {
  background-color: white;
color: #75d679;
border-radius: 20px;
margin-right: -24%;
padding: 10px;
display: inline-block;
font-size: 20px;
font-weight: 400;
font-family: sans-serif;

}

#cspeed {
      display: inline-block;
      height: 300px;
margin-top: 0px;
margin-left: -10px;
color: white;
font-weight: 400 !important;
font-family: sans-serif;
font-size: 20px;

}



.menuPrompt {
font-size: 18px;
font-family: 'Hammersmith One';
color: #4A4A4A;
flex: 0.2;
text-align: center;
margin-top: 10px;
display: inline-block;

}

#mainSettings {
   width: 400px;
   height: 375px;
overflow-y: scroll;

}

#settingsTitle {
font-size: 32px;
font-family: 'Hammersmith One';
color: #4A4A4A;
width: 100%;
text-align: center;
margin-top: 10px;

}

#rmvMonkey {
   font-size: 16.5px;
   opacity: 0.9;

}



#infoDiv {
  position: absolute;
  left: -25%;
  right: 0%;
  text-align: center;
  background-color: rgba(252, 252, 252, 0.5);
  display: inline-block;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}

#autotitle {
  font-family: sans-serif;
  font-size: 30px;
  font-weight: 200;
}

#arrivalest {
  font-family: sans-serif;
  font-size: 20px;
  font-weight: 200;
}

#timeest {

}

#cancelTrip {
  background-color: rgb(203, 68, 74);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 17px;
  font-family: sans-serif;
  cursor: pointer;
  outline: none;
  font-weight: 300;
  margin-bottom: 18px;
  width: 112px;
  height: 33.6px;

}

#spotDiv {
position: absolute;
width: 10px;
height: 10px;
marginLeft: -5px;
marginTop: -5px;
opacity: 1;
background-color: rgb(203, 68, 74);
left: 0;
right: 0;
border-radius: 5px;
z-index: 1000;

}

@media only screen and (max-width: 765px){
#numfocus {
margin-right: -13%;
}
}

#botText {
color: #5aed57;
font-size: 20px;
font-family: sans-serif;
font-weight: 300;
}

`;

            // the autopilot box a minimap click opens
            const AUTOPILOT_HTML = `<h1 id="autotitle">You are currently in CloudyMod auto-pilot.</h1>
     <h3 id="arrivalest">You will arrive in <span id="timeest">30 seconds...</span></h3>

     <button type="button" id="cancelTrip">Cancel</button>`;

            // the "-" MooMod menu (tabs: Main / Offense / Defense / Support / Map / controls / Help)
            const MENU_CSS = `
  .open-menu-button {
    background-color: #ef3f3f;
    margin-top: 5px;
  }

  .open-menu-button:hover {
    background-color: rgb(130, 11, 11);
  }

  #mm-menu-container {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    user-select: none;
    font-size: 14px;
    overflow: hidden;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: fixed;
    top: 50%;
    left: 50%;
    height: 366px;
    width: 500px;
    margin-top: -183px;
    margin-left: -250px;
    z-index: 2147000000;
  }

  .i-checkbox-label {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    display: block;
    margin: 4px;
  }

  .i-checkbox-label {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
  }

  #mm-main-menu {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    padding: .5em 1em;
    border-top: none;
    margin-left: 130px;
    display: none;
  }
  #mm-offense-menu {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    padding: .5em 1em;
    border-top: none;
    margin-left: 130px;
    display: block;
  }

  #mm-defense-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }

  #mm-support-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-map-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-controls-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-help-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }



  .i-tab-container {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: #222;
  }

  .i-tab-menu, .sidebar {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    background-color: #333;
    display: block;
    overflow: auto;
    float: left;
    width: 130px;
    height: 100%;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12);
  }

  .i-tab-menu-item {
    font-size: 12px;
    user-select: none;
    text-decoration: none;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #d15151;
  }
  .i-tab-menu-item:hover {
    background-color: rgb(77, 73, 73) !important;
  }
  #mm-main-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }
  #mm-offense-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-defense-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-support-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-support-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  .i-tab-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-controls-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-help-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    position: absolute;
    right: 0;
    width: 100%;
    bottom: 0;
    left: 0;
  }

  .is-active {
    background-color: rgb(129, 34, 34) !important;
  }


  .i-close {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    right: 0;
    width: 25px;
    height: 25px;
    margin: 0;
    border-bottom-left-radius: 5px;
    overflow: hidden;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
  }
`;
            const MENU_HTML = `
    <div class="i-tab-container">
      <div class="i-tab-menu sidebar">
        <h2 class="i-tab-menu-item">MooMod</h2></a>
        <button id="mm-main-menu-item" class="i-tab-menu-item is-active">Main</button>
        <button id="mm-offense-menu-item" class="i-tab-menu-item">Offense</button>
        <button id="mm-defense-menu-item" class="i-tab-menu-item">Defense</button>
        <button id="mm-support-menu-item" class="i-tab-menu-item">Support</button>
        <button id="mm-map-menu-item" class="i-tab-menu-item">Map</button>
        <button id="mm-controls-menu-item" class="i-tab-menu-item">controls</button>
        <button id="mm-help-menu-item" class="i-tab-menu-item i-last">Help</button>
      </div>
      <div id="mm-main-menu" class="i-tab-content">
        <h3>Main</h3>
        <label class="i-checkbox-label"><input id="mm-autoHeal" type="checkbox" class="i-checkbox">Auto Heal</label>
        <label class="i-checkbox-label"><input id="mm-autoAim" type="checkbox" class="i-checkbox">Auto Aim</label>
        <label class="i-checkbox-label"><input id="mm-instaKill" type="checkbox" class="i-checkbox">Better FPS</label>
        <label class="i-checkbox-label"><input id="mm-drawPlayerArrows" type="checkbox" class="i-checkbox">Anti Lag!</label>
        <label class="i-checkbox-label"><input id="mm-blockAds" type="checkbox" class="i-checkbox">Block Ads</label>
        <label class="i-checkbox-label"><input id="mm-autochat" type="checkbox" class="i-checkbox">repeatLast</label>
        <fieldset>
          <legend>Coming soon...</legend>
          <label class="i-checkbox-label"><input id="mm-boost_spike" type="checkbox" class="i-checkbox">Activate G Boost spike?</label>
          <label class="i-checkbox-label"><input id="mm-useDefensiveGear" type="checkbox" class="i-checkbox">Radar</label>
          <label class="i-checkbox-label"><input id="mm-useSupportGear" type="checkbox" class="i-checkbox">Anti Boost spike</label>
        </fieldset>
      </div>
      <div id="mm-offense-menu" class="i-tab-content" style="display: none;">
        <h3>Offense</h3>
        <fieldset>
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatDefault"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccDefault"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Bow(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatBow"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccBow"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Hammer(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatHammer"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccHammer"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-defense-menu" class="i-tab-content" style="display: none;">
        <h3>Defense</h3>
        <fieldset>
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-support-menu" class="i-tab-content" style="display: none;">
        <h3>Support(prob. not work)</h3>
        <label class="i-checkbox-label"><input id="mm-useFastestGear" type="checkbox" class="i-checkbox">Use fastest hat/accessory available</label>
        <label class="i-checkbox-label"><input id="mm-autoFlipperHat" type="checkbox" class="i-checkbox">Auto equip Flipper Hat</label>
        <fieldset id="mm-supportDefaults">
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Clicking(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-map-menu" class="i-tab-content" style="display: none;">
        <h3>Map</h3>
        <label class="i-checkbox-label"><input id="myCheck" type="checkbox" class="i-checkbox">Use biome map</label>
        <label class="i-checkbox-label"><input id="mm-showPlayerMarkers" type="checkbox" class="i-checkbox">Show my markers</label>
        <label class="i-checkbox-label"><input id="mm-showEnemyMarkers" type="checkbox" class="i-checkbox">Show enemy markers</label>
        <label class="i-checkbox-label"><input id="mm-keepMarkersOnDeath" type="checkbox" class="i-checkbox">Keep markers on death</label>
      </div>
      <div id="mm-controls-menu" class="i-tab-content" style="display: none;">
        <h3>Controls</h3>
        <label>Open MooMod Hat Menu: <button id="mm-keybind-openMenu" class="i-button i-bold i-right i-inline i-keybind">ESCAPE</button></label>
        <br>

      </div>
      <div id="mm-help-menu" class="i-tab-content" style="display: none;">
        <h3>Controlls</h3>
        <ul>
<li>            Arrows | for diffrent clan/chat spams</li>
<li>            -      | open MooMod Menu!</li>
<li>            -      | close MooMod Menu!</li>
<li>            v      | spike</li>
<li>            f      | trap</li>
<li>       hold q      | super fast heal</li>
<li>            #      | fast pro-heal</li>
<li>           F2      | Autoplace and Hat+acc ids Menu</li>
<li>           ESC     | MooMod Hat Menu</li>
<li>            N      | windmill</li>
<li>            H      | turret</il>
<li>            R      | pro insta</li>
<li>            O      | Four Traps</li>
<li>            L      | Four spikes</li>
<li>            P      | Bot mode! New!</li>
<li>            K      | AutoTrap mode
<li>   if enemy in hit range and click = bull</li>
<li> if enemy is not in hit range and click = tank</li>
        </ul>
      </div>
        <div id="i-keybind-listener-container">
          <div id="i-keybind-listener">
            <span id="i-keybind-listener-title"></span>
            <span id="i-keybind-listener-value" class="i-text-centered"></span>
            <span id="i-keybind-listener-instructions">Press any key...</span>
            <div class="i-center-contents">
              <button id="i-keybind-listener-save" class="i-button i-confirm">Save</button>
              <button id="i-keybind-listener-cancel" class="i-button i-cancel">Cancel</button>
            </div>
          </div>
      </div>
    </div>
    <div class="i-close"></div>`;

            // "Use biome map": the minimap background
            const BIOME_MAP_BG = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAYAAACKAxD9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAFCSURBVHhe7dxBDcMwFAVBuzB7CIoSKIKwSFmEWhutyyIzkhUCq3eK/jyO8zu4vcf/y80JgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBzOv5ixmLwCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBDK318dVNSwCixCIEIgQiBCIEIgQiOvsxCIQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhkLm/n+4sYhFYhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEwGWMH9UwCujTcs1kAAAAAElFTkSuQmCC) no-repeat center center`;

            // the red 3D "MooMod" logo, and the (never applied) ping display shadow
            const LOGO_SHADOW = `0 1px 0 rgba(231, 76, 60), 0 2px 0 rgba(231, 76, 60), 0 3px 0 rgba(231, 76, 60), 0 4px 0 rgba(231, 76, 60), 0 5px 0 rgba(231, 76, 60), 0 6px 0 rgba(231, 76, 60), 0 7px 0 rgba(231, 76, 60), 0 8px 0 rgba(231, 76, 60), 0 9px 0 rgba(255, 0, 0)`;
            const PING_SHADOW = `0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)`;

            // the main menu's "Featured" box (the second one is never shown: its flag is always false)
            const FEATURED_NURO = `<div id="youtuberOf">
                           ´
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCxNHxsTut7atZCUNSJCHx4A?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;"></i>Nuro.</a></div>
	</div>
Featured Hacker:`;
            const FEATURED_JABIDDLE = `<div id="youtuberOf">
                           ´
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCrZVnif0yPniQfdwvdMgf_Q?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;"></i>jabiddle</a></div>
	</div>
Featured Hacker:`;

            // ESC — the "MooMod Hat settings" menu. The original glued the key boxes' values in
            // between these pieces with String.fromCharCode(key) (see hatMenuHtml in 50-menus).
            const HAT_MENU_PARTS = [
                `
<div id="simpleModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="closeBtn">&times;</span>
            <h2 style="color: #3a4094; font-size: 20px;">  </h2>
        </div>
        <div class="modal-body" style="font-size: 20px;">
            <div class="flexControl">
<h1 id="settingsTitle">MooMod Hat settings : </h1>
<h3 class="menuPrompt lowprompt">Custom hotkeys:</h3>
<h3 class="menuPrompt lowpromptdetail toplow">When I press <input value="`,
                `" id="spikeControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/0wiUP4V.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="trapControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/mHWrRQV.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="turretControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/87ra7xS.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="bullHelm" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_7.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="soldier" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_6.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="turret" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_53.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="bushg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_10.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="spikeg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_11.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="samu" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_20.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="emp" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_22.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="mill" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_14.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="tank" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_40.png"/></h3>
<h3 class="menuPrompt">Winter Flipper Booster: </h3> <input value="`,
                `" id="WFB" class="keyPressLow" maxlength="1" type="text"/>

<hr id="hrule"/>
<div id="endwrap">
<h3 id="createdEnd">Created by Nuro.#6512 | <a href="https://discord.gg/4b6RuUW">Join My Discord</a></h3>
</div>
            </div>
        </div>
        <div class="modal-footer">
            <p style="color: #69855d; font-size; 10px;">Nuro. Made MooMod Menu Work Again!</p>
        </div>
    </div>
</div>
`
            ];
            const HAT_MENU_CSS = `
.keyPressLow {
    margin-left: 8px;
    font-size: 15px;
    margin-right: 8px;
    height: 25px;
    width: 25px;
    background-color: #fcfcfc;
    border-radius: 3.5px;
    border: none;
    text-align: center;
    color: #5d73ba;
    border: 0.5px solid #f2f2f2;
}


.menuPrompt {
    font-size: 15px;
    font-family: 'Hammersmith One';
    color: #5d73ba;
    flex: 0.2;
    text-align: center;
    margin-top: 10px;
    display: inline-block;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    overflow: auto;
    height: 100%;
    width: 100%;
}

.modal-content {
    margin: 10% auto;
    width: 40%;
    box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);
    font-size: 14px;
    line-height: 1.6;
}

.modal-header h2,
.modal-footer h3 {
  margin: 0;
}

.modal-header {
    background: #222;
    padding: 15px;
    color: #fff;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.modal-body {
    padding: 10px 20px;
    background: #222;
}

.modal-footer {
    background: #222;
    padding: 10px;
    color: #fff;
    text-align: center;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.closeBtn {
    color: #ccc;
    float: right;
    font-size: 30px;
    color: #fff;
}

.closeBtn:hover,
.closeBtn:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}

/* Customize the label (the container) */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #5d73ba;
  font-size: 15px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #eee;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #702130;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

`;

            // the "Biome Hat Changed!" alert (only shown when biomeHatAlerts is on — it never is)
            function hatAlertHtml(name, id) {
                return "<div id=\"flextop\"><img id=\"hatimgmain\" src=\"/img/hats/hat_" + id + ".png\">\n\t\t\t<h1 id=\"changeAlert\">Biome Hat Changed!</h1></div>\n\t\t\t<h3 id=\"typealert\">Your hat was automatically changed to the <span id=\"hatname\">" + name + "</span></h3>\n\n\t\t\t<div id=\"flexlow\">\n\t\t\t<button id=\"sback\">Switch Back!</button> <button id=\"okbtn\">OK</button>\n\t\t\t</div>";
            }

