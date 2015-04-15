var carriers = [
    { "carrier": "3 River Wireless", "email": "phonenumber@sms.3rivers.net" },
    { "carrier": "ACS Wireless", "email": "phonenumber@paging.acswireless.com" },
    { "carrier": "Alltel", "email": "phonenumber@message.alltel.com" },
    { "carrier": "AT&T", "email": "phonenumber@txt.att.net" },
    { "carrier": "Bell Canada", "email": "phonenumber@txt.bellmobility.ca" },
    { "carrier": "Bell Canada", "email": "phonenumber@bellmobility.ca" },
    { "carrier": "Bell Mobility (Canada)", "email": "phonenumber@txt.bell.ca" },
    { "carrier": "Bell Mobility", "email": "phonenumber@txt.bellmobility.ca" },
    { "carrier": "Blue Sky Frog", "email": "phonenumber@blueskyfrog.com" },
    { "carrier": "Bluegrass Cellular", "email": "phonenumber@sms.bluecell.com" },
    { "carrier": "Boost Mobile", "email": "phonenumber@myboostmobile.com" },
    { "carrier": "BPL Mobile", "email": "phonenumber@bplmobile.com" },
    { "carrier": "Carolina West Wireless", "email": "10digit10digitnumber@cwwsms.com" },
    { "carrier": "Cellular One", "email": "phonenumber@mobile.celloneusa.com" },
    { "carrier": "Cellular South", "email": "phonenumber@csouth1.com" },
    { "carrier": "Centennial Wireless", "email": "phonenumber@cwemail.com" },
    { "carrier": "CenturyTel", "email": "phonenumber@messaging.centurytel.net" },
    { "carrier": "Cingular (Now AT&T)", "email": "phonenumber@txt.att.net" },
    { "carrier": "Clearnet", "email": "phonenumber@msg.clearnet.com" },
    { "carrier": "Comcast", "email": "phonenumber@comcastpcs.textmsg.com" },
    { "carrier": "Corr Wireless Communications", "email": "phonenumber@corrwireless.net" },
    { "carrier": "Dobson", "email": "phonenumber@mobile.dobson.net" },
    { "carrier": "Edge Wireless", "email": "phonenumber@sms.edgewireless.com" },
    { "carrier": "Fido", "email": "phonenumber@fido.ca" },
    { "carrier": "Golden Telecom", "email": "phonenumber@sms.goldentele.com" },
    { "carrier": "Helio", "email": "phonenumber@messaging.sprintpcs.com" },
    { "carrier": "Houston Cellular", "email": "phonenumber@text.houstoncellular.net" },
    { "carrier": "Idea Cellular", "email": "phonenumber@ideacellular.net" },
    { "carrier": "Illinois Valley Cellular", "email": "phonenumber@ivctext.com" },
    { "carrier": "Inland Cellular Telephone", "email": "phonenumber@inlandlink.com" },
    { "carrier": "MCI", "email": "phonenumber@pagemci.com" },
    { "carrier": "Metrocall", "email": "phonenumber@page.metrocall.com" },
    { "carrier": "Metrocall 2-way", "email": "phonenumber@my2way.com" },
    { "carrier": "Metro PCS", "email": "phonenumber@mymetropcs.com" },
    { "carrier": "Microcell", "email": "phonenumber@fido.ca" },
    { "carrier": "Midwest Wireless", "email": "phonenumber@clearlydigital.com" },
    { "carrier": "Mobilcomm", "email": "phonenumber@mobilecomm.net" },
    { "carrier": "MTS", "email": "phonenumber@text.mtsmobility.com" },
    { "carrier": "Nextel", "email": "phonenumber@messaging.nextel.com" },
    { "carrier": "OnlineBeep", "email": "phonenumber@onlinebeep.net" },
    { "carrier": "PCS One", "email": "phonenumber@pcsone.net" },
    { "carrier": "President's Choice", "email": "phonenumber@txt.bell.ca" },
    { "carrier": "Public Service Cellular", "email": "phonenumber@sms.pscel.com" },
    { "carrier": "Qwest", "email": "phonenumber@qwestmp.com" },
    { "carrier": "Rogers AT&T Wireless", "email": "phonenumber@pcs.rogers.com" },
    { "carrier": "Rogers Canada", "email": "phonenumber@pcs.rogers.com" },
    { "carrier": "Satellink", "email": "10digitpagernumber.pageme@satellink.net" },
    { "carrier": "Southwestern Bell", "email": "phonenumber@email.swbw.com" },
    { "carrier": "Sprint", "email": "phonenumber@messaging.sprintpcs.com" },
    { "carrier": "Sumcom", "email": "phonenumber@tms.suncom.com" },
    { "carrier": "Surewest Communicaitons", "email": "phonenumber@mobile.surewest.com" },
    { "carrier": "T-Mobile", "email": "phonenumber@tmomail.net" },
    { "carrier": "Telus", "email": "phonenumber@msg.telus.com" },
    { "carrier": "Straight Talk", "email": "phonenumber@txt.att.net" },
    { "carrier": "Tracfone", "email": "phonenumber@txt.att.net" },
    { "carrier": "Triton", "email": "phonenumber@tms.suncom.com" },
    { "carrier": "Unicel", "email": "phonenumber@utext.com" },
    { "carrier": "US Cellular", "email": "phonenumber@email.uscc.net" },
    { "carrier": "Solo Mobile", "email": "phonenumber@txt.bell.ca" },
    { "carrier": "Sprint", "email": "phonenumber@messaging.sprintpcs.com" },
    { "carrier": "Sumcom", "email": "phonenumber@tms.suncom.com" },
    { "carrier": "Surewest Communicaitons", "email": "phonenumber@mobile.surewest.com" },
    { "carrier": "T-Mobile", "email": "phonenumber@tmomail.net" },
    { "carrier": "Telus", "email": "phonenumber@msg.telus.com" },
    { "carrier": "Triton", "email": "phonenumber@tms.suncom.com" },
    { "carrier": "Unicel", "email": "phonenumber@utext.com" },
    { "carrier": "US Cellular", "email": "phonenumber@email.uscc.net" },
    { "carrier": "US West", "email": "phonenumber@uswestdatamail.com" },
    { "carrier": "Verizon", "email": "phonenumber@vtext.com" },
    { "carrier": "Virgin Mobile", "email": "phonenumber@vmobl.com" },
    { "carrier": "Virgin Mobile Canada", "email": "phonenumber@vmobile.ca" },
    { "carrier": "West Central Wireless", "email": "phonenumber@sms.wcc.net" },
    { "carrier": "Western Wireless", "email": "phonenumber@cellularonewest.com" },
    {"carrier": "Chennai RPG Cellular", "email": "phonenumber@rpgmail.net" },
    {"carrier": "Chennai Skycell / Airtel", "email": "phonenumber@airtelchennai.com" },
    {"carrier": "Comviq", "email": "number@sms.comviq.se" },
    {"carrier": "Delhi Aritel", "email": "phonenumber@airtelmail.com" },
    {"carrier": "Delhi Hutch", "email": "phonenumber@delhi.hutch.co.in" },
    {"carrier": "DT T-Mobile", "email": "phonenumber@t-mobile-sms.de" },
    {"carrier": "Dutchtone / Orange-NL", "email": "phonenumber@sms.orange.nl" },
    {"carrier": "EMT", "email": "phonenumber@sms.emt.ee" },
    {"carrier": "Escotel", "email": "phonenumber@escotelmobile.com" },
    {"carrier": "German T-Mobile", "email": "number@t-mobile-sms.de" },
    {"carrier": "Goa BPLMobil", "email": "phonenumber@bplmobile.com" },
    {"carrier": "Golden Telecom", "email": "phonenumber@sms.goldentele.com" },
    {"carrier": "Gujarat Celforce", "email": "phonenumber@celforce.com" },
    {"carrier": "JSM Tele-Page", "email": "pinnumber@jsmtel.com" },
    {"carrier": "Kerala Escotel", "email": "phonenumber@escotelmobile.com" },
    {"carrier": "Kolkata Airtel", "email": "phonenumber@airtelkol.com" },
    { "carrier": "Kyivstar", "email": "phonenumber@smsmail.lmt.lv" },
    { "carrier": "Lauttamus Communication", "email": "phonenumber@e-page.net" },
    {"carrier": "LMT", "email": "phonenumber@smsmail.lmt.lv" },
    {"carrier": "Maharashtra BPL Mobile", "email": "phonenumber@bplmobile.com" },
    {"carrier": "Maharashtra Idea Cellular", "email": "phonenumber@ideacellular.net" },
    {"carrier": "Manitoba Telecom Systems", "email": "phonenumber@text.mtsmobility.com" },
    {"carrier": "Meteor", "email": "phonenumber@mymeteor.ie" },
    {"carrier": "MiWorld", "email": "phonenumber@m1.com.sg" },
    {"carrier": "Mobileone", "email": "phonenumber@m1.com.sg" },
    {"carrier": "Mobilfone", "email": "phonenumber@page.mobilfone.com" },
    {"carrier": "Mobility Bermuda", "email": "phonenumber@ml.bm" },
    {"carrier": "Mobistar Belgium", "email": "phonenumber@mobistar.be" },
    {"carrier": "Mobitel Tanzania", "email": "phonenumber@sms.co.tz" },
    {"carrier": "Mobtel Srbija", "email": "phonenumber@mobtel.co.yu" },
    { "carrier": "Movistar", "email": "phonenumber@correo.movistar.net" },
    {"carrier": "Mumbai BPL Mobile", "email": "phonenumber@bplmobile.com" },
    {"carrier": "Netcom", "email": "phonenumber@sms.netcom.no" },
    { "carrier": "Ntelos", "email": "phonenumber@pcs.ntelos.com" },
    { "carrier": "O2", "email": "phonenumber@o2.co.uk" },
    { "carrier": "O2", "email": "phonenumber@o2imail.co.uk" },
    { "carrier": "O2 (M-mail)", "email": "phonenumber@mmail.co.uk" },
    {"carrier": "One Connect Austria", "email": "phonenumber@onemail.at" },
    {"carrier": "OnlineBeep", "email": "phonenumber@onlinebeep.net" },
    {"carrier": "Optus Mobile", "email": "phonenumber@optusmobile.com.au" },
    {"carrier": "Orange", "email": "phonenumber@orange.net" },
    {"carrier": "Orange Mumbai", "email": "phonenumber@orangemail.co.in" },
    {"carrier": "Orange NL / Dutchtone", "email": "phonenumber@sms.orange.nl" },
    {"carrier": "Oskar", "email": "phonenumber@mujoskar.cz" },
    {"carrier": "P&T Luxembourg", "email": "phonenumber@sms.luxgsm.lu" },
    {"carrier": "Personal Communication", "email": "sms@pcom.ru (put the number in the subject line)" },
    {"carrier": "Pondicherry BPL Mobile", "email": "phonenumber@bplmobile.com" },
    {"carrier": "Primtel", "email": "phonenumber@sms.primtel.ru" },
    {"carrier": "Safaricom", "email": "phonenumber@safaricomsms.com" },
    {"carrier": "Satelindo GSM", "email": "phonenumber@satelindogsm.com" },
    {"carrier": "SCS-900", "email": "phonenumber@scs-900.ru" },
    {"carrier": "SFR France", "email": "phonenumber@sfr.fr" },
    {"carrier": "Simple Freedom", "email": "phonenumber@text.simplefreedom.net" },
    {"carrier": "Smart Telecom", "email": "phonenumber@mysmart.mymobile.ph" },
    {"carrier": "Southern LINC", "email": "phonenumber@page.southernlinc.com" },
    {"carrier": "Sunrise Mobile", "email": "phonenumber@mysunrise.ch" },
    {"carrier": "Sunrise Mobile", "email": "phonenumber@swmsg.com" },
    {"carrier": "Surewest Communications", "email": "phonenumber@freesurf.ch" },
    {"carrier": "Swisscom", "email": "phonenumber@bluewin.ch" },
    {"carrier": "T-Mobile Austria", "email": "phonenumber@sms.t-mobile.at" },
    {"carrier": "T-Mobile Germany", "email": "phonenumber@t-d1-sms.de" },
    {"carrier": "T-Mobile UK", "email": "phonenumber@t-mobile.uk.net" },
    {"carrier": "Tamil Nadu BPL Mobile", "email": "phonenumber@bplmobile.com" },
    {"carrier": "Tele2 Latvia", "email": "phonenumber@sms.tele2.lv" },
    {"carrier": "Telefonica Movistar", "email": "phonenumber@movistar.net" },
    {"carrier": "Telenor", "email": "phonenumber@mobilpost.no" },
    {"carrier": "Teletouch", "email": "phonenumber@pageme.teletouch.com" },
    {"carrier": "Telia Denmark", "email": "phonenumber@gsm1800.telia.dk" },
    {"carrier": "TIM", "email": "phonenumber@timnet.com" },
    { "carrier": "TSR Wireless", "email": "phonenumber@alphame.com" },
    {"carrier": "UMC", "email": "phonenumber@sms.umc.com.ua" },
    {"carrier": "Uraltel", "email": "phonenumber@sms.uraltel.ru" },
    {"carrier": "Uttar Pradesh Escotel", "email": "phonenumber@escotelmobile.com" },
    {"carrier": "Vessotel", "email": "phonenumber@pager.irkutsk.ru" },
    { "carrier": "Vodafone Italy", "email": "phonenumber@sms.vodafone.it" },
    {"carrier": "Vodafone Japan", "email": "phonenumber@c.vodafone.ne.jp" },
    {"carrier": "Vodafone UK", "email": "phonenumber@vodafone.net" },
    { "carrier": "Wyndtell", "email": "phonenumber@wyndtell.com" }
]

var Register = function (ruser) {
    reg = this;
    reg.user = ruser;
    reg.username = ko.observable();
    reg.carriers = ko.observableArray(carriers);
    reg.textmail = ko.observable('');
    reg.errors = ko.observableArray();
    reg.name = ko.observable('');
    reg.email = ko.observable('');
    reg.phone = ko.observable('');    
    reg.carrier = ko.observable();
    reg.notifyByText = ko.observable(true);
    reg.notifyByEmail = ko.observable(true);
    reg.signedIn = ko.observable(false);
    reg.signout = function () {
        reg.user = { name: "guest", email: "", phone: "", carrier: "", signedIn: false };
        reg.username("guest");
        reg.signedIn(false);
        $('#registerLink').click(function () {
            $('#register').popup({ positionTo: "window", overlayTheme: "b", theme: "b", dismissible: true, transition: "pop" });
            $('#register').popup("open");
        });
    }
    reg.registerNow = function () {
        // save user data locally       

        reg.isRegistered = true;
        // ***
        reg.user.name = reg.name();
        reg.username(reg.name());
        reg.user.phone= reg.phone();
        reg.user.email = reg.email();
        reg.user.carrier = reg.carrier();
        ruser.notifyByText = reg.notifyByText();
        ruser.notifyByEmail = reg.notifyByEmail();
        reg.user.signedin = true;
        reg.signedIn(true);
        var user = { name: reg.name(), email: reg.email(), phone: reg.phone(), carrier: reg.carrier(), 
            notifyByText: reg.notifyByText(), notifyByEmail: reg.notifyByEmail(), signedIn: true
        };
        localStorage.setItem('user', JSON.stringify(user));
        $('#register').popup("close");
    };
    reg.registerCancel = function () {
        $('#register').popup("close");
    }
     
};

