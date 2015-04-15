function formatCurrency(value) {
    return  value.toFixed(2);
};
function checkIt(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    
    return true;
}
String.prototype.ReplaceAll = function(stringToFind, stringToReplace) {
    var temp = this;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
};
function itemFormat(item) {
    var x = item.indexOf("|");
    var itemname = item.substr(0, x);
    var rest = item.substr(x);
    var test = rest.ReplaceAll("| ", "");
    if (test) itemname += ":";
    var temp0 = '<b>' + itemname + '</b>' + rest;
    // temp[0] = '<b>' + temp[0] + '</b>';
    var temp1 = temp0.split('|').join('').ReplaceAll('[', ' ').ReplaceAll(']', ' ').replace(/\s+/g, ' ');
    var temp2 = temp1.split(',').join(', ').replace(/\s+/g, ' ');
    return temp2;
}
function itemPformat(item) {
    var x = item.indexOf("|");
    var itemname = item.substr(0, x);
    var rest = item.substr(x);
    var test = rest.ReplaceAll("| ", "");
    var temp0 = '<tr><td>#quantity &nbsp;' + itemname + '</td><td align="right">#subtotal </td></tr>';
    if (test) temp0 += '<tr><td colspan="2">' + rest +  '</td></tr>';
    // temp[0] = '<b>' + temp[0] + '</b>';
    var temp1 = temp0.split('|').join('').ReplaceAll('[', ' ').ReplaceAll(']', ' ').replace(/\s+/g, ' ');
    var temp2 = temp1.split(',').join(', ').replace(/\s+/g, ' ');
    return temp2;
}
function timenow() {
    var now = new Date(),
    ampm = 'am',
    h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds(),
    M = now.getMonth(),
    D= now.getDay(),
    Y = now.getFullYear();

    if (h >= 12) {
        if (h > 12) h -= 12;
        ampm = 'pm';
    }

    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return  h + ':' + m + ':' + s + ' ' + ampm;
}
function datenow() {
    var now = new Date(),
    ampm = 'am',
    h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds(),
    M = now.getMonth(),
    D = now.getDay(),
    Y = now.getFullYear();

    if (h >= 12) {
        if (h > 12) h -= 12;
        ampm = 'pm';
    }

    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return M + '/' + D + '/' + Y + ' ' + h + ':' + m + ':' + s + ' ' + ampm;
}
function StringBuilder(value) {
    this.strings = new Array("");
    this.append(value);
}

StringBuilder.prototype.append = function (value) {
    if (value) {
        this.strings.push(value);
    };
};

StringBuilder.prototype.clear = function () {
    this.strings.length = 1;
};

StringBuilder.prototype.toString = function () {
    return this.strings.join("");
};
ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                value.call(viewModel);
                return false;
            }
            return true;
        });
    }
};
function getQueryStrings() {
    var assoc = {};
    var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        if (key.length > 1) {
            assoc[decode(key[0])] = decode(key[1]);
        }
    }

    return assoc;
};
ko.bindingHandlers.jqmChecked = {
    init: ko.bindingHandlers.checked.init,
    update: function (element, valueAccessor) {
        //KO v3 and previous versions of KO handle this differently
        //KO v3 does not use 'update' for 'checked' binding
        if (ko.bindingHandlers.checked.update)
            ko.bindingHandlers.checked.update.apply(this, arguments); //for KO < v3, delegate the call
        else
            ko.utils.unwrapObservable(valueAccessor()); //for KO v3, force a subscription to get further updates

        if ($(element).data("mobile-checkboxradio")) //calling 'refresh' only if already enhanced by JQM
            $(element).checkboxradio('refresh');
    }
};
function updateIds(group, vendor) {
    alert("openTimeing id update");
    // update ids
    var xgroupid = new Date().getTime();
    for (var g = 0; g < groups.length; g++) {
        var xgroup = groups[g];
        xgroup.groupId = xgroupid;
        xgroupid++;
    };

    for (var h = 0; h < groups.length; h++) {
        var ygroup = groups[h];
        var items = ygroup.groupItems;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.itemId = xgroupid;
            xgroupid++;
        };
    };
     var groupstring = JSON.stringify(groups);
    // localStorage.setItem('groups', groupstring);
    $.post("../savevendormenu", { vendorPhone: vendor.phone, groups: groupstring });
     alert("groups saved");
};
Array.prototype.move = function (pos1, pos2) {
    // local variables
    var i, tmp;
    // cast input parameters to integers
    pos1 = parseInt(pos1, 10);
    pos2 = parseInt(pos2, 10);
    // if positions are different and inside array
    if (pos1 !== pos2 && 0 <= pos1 && pos1 <= this.length && 0 <= pos2 && pos2 <= this.length) {
        // save element from position 1
        tmp = this[pos1];
        // move element down and shift other elements up
        if (pos1 < pos2) {
            for (i = pos1; i < pos2; i++) {
                this[i] = this[i + 1];
            }
        }
            // move element up and shift other elements down
        else {
            for (i = pos1; i > pos2; i--) {
                this[i] = this[i - 1];
            }
        }
        // put element from position 1 to destination
        this[pos2] = tmp;
    }
};

function padZeros(theNumber, max) {
    var numStr = String(theNumber);

    while (numStr.length < max) {
        numStr = '0' + numStr;
    }

    return numStr;
};
function setCookie(cname,cvalue,exdays)
{
var d = new Date();
d.setTime(d.getTime()+(exdays*24*60*60*1000));
var expires = "expires="+d.toGMTString();
document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname)
{
var name = cname + "=";
var ca = document.cookie.split(';');
for(var i=0; i<ca.length; i++) 
  {
  var c = ca[i].trim();
  if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
return "";
}
function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}
var Days =["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function formatPhone(phone) {
    if(typeof phone == 'undefined') phone = "";
    if (phone == "template") return "template";
    var fphone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 - $2 - $3");
    return fphone;
}
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
