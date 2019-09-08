if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

function get(id) {
    return document.getElementById(id);
}

function getLang() {
    return (navigator.language != null && navigator.language != undefined) ? navigator.language : 'en';
}

function getValue(id) {
    return get(id).value.replace(',','.');
}

function getInt(value) {
    var v = parseInt(value);
    return isNaN(v) ? 0 : v;
}

function getFloat(value) {
    var v = parseFloat(value);
    return isNaN(v) ? 0.0 : parseFloat(v.toPrecision(4));
}

function getValues() {
    return {
        op: getValue('op'),
        r: getInt(getValue('r')),
        n: getInt(getValue('n')),
        p: getFloat(getValue('p')),
        q: parseFloat((1.0 - getFloat(getValue('p'))).toPrecision(4)),
        a: getFloat(getValue('a')),
        b: getFloat(getValue('b'))
    };
}

function binomial(n, k) {
    var coeff = 1;
    for (var x = n - k + 1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

function equals(r, n, p, q) {
    return binomial(n, r) * Math.pow(p, r) * Math.pow(q, n - r);
}

function lessEquals(r, n, p, q) {
    var result = 0;
    for (var x = 0; x <= r; x++) result += equals(x, n, p, q);
    return result;
}

function calc(values) {
    var {op, r, n, p, q, a, b} = values;
    switch(op) {
        case 'equal_to': return equals(r, n, p, q);
        case 'not_equal_to': return (1 - equals(r, n, p, q));
        case 'less_than': return lessEquals(r - 1, n, p, q);
        case 'greater_than': return (1 - lessEquals(r, n, p, q));
        case 'less_than_or_equal_to': return lessEquals(r, n, p, q);
        case 'greater_than_or_equal_to': return (1 - lessEquals(r - 1, n, p, q));
        case 'a_less_than_X_less_than_b': return (lessEquals(b - 1, n, p, q) - lessEquals(a, n, p, q));
        case 'a_less_than_or_equal_to_X_less_than_or_equal_to_b': return (lessEquals(b, n, p, q) - lessEquals(a - 1, n, p, q));
        case 'X_less_than_a_or_X_greater_than_b': return (lessEquals(a - 1, n, p, q) + (1 - lessEquals(b, n, p, q)));
        case 'X_less_than_or_equal_to_a_or_X_greater_than_or_equal_to_b': return (lessEquals(a, n, p, q) + (1 - lessEquals(b - 1, n, p, q)));
    }
}

function checkRequired(values, element) {
    if (values.op == 'a_less_than_X_less_than_b' || values.op == 'a_less_than_or_equal_to_X_less_than_or_equal_to_b' || values.op == 'X_less_than_a_or_X_greater_than_b' || values.op == 'X_less_than_or_equal_to_a_or_X_greater_than_or_equal_to_b') {
        return element == 'r' ? false : true;
    } else {
        return (element == 'a' || element == 'b') ? false : true;
    }
}

function output(err, type) {
    get('err').innerHTML += get('err').innerHTML == '' ? err(type) : ('<br>' + err(type));
    get('err').style.display = 'block';
}

function isSpecialCase(values) {
    return (values.op == 'a_less_than_X_less_than_b' || values.op == 'a_less_than_or_equal_to_X_less_than_or_equal_to_b' || values.op == 'X_less_than_a_or_X_greater_than_b' || values.op == 'X_less_than_or_equal_to_a_or_X_greater_than_or_equal_to_b');
}

function checkInput(values, element, err) {
    get(element).style.borderColor = '#ddd';
    if(checkRequired(values, element)) {
        if (get(element).value == '') {
            output(err, 'err-empty');
            return false;
        }
        var temp = true;
        if (element == 'a' || element == 'b' || element == 'r') {
            if (getFloat(getValue(element)) < 0.0) {
                output(err, 'err-<0');
                temp = false;
            }
        }
        if (element == 'n') {
            if (values.n < 1.0) {
                output(err, 'err-<1');
                temp = false;
            }
            if (values.n < values.r && (!isSpecialCase(values))) {
                output(err, 'err-n<r');
                temp = false;
            }
            if (values.n == values.r && values.op == 'greater_than') {
                output(err, 'err-n=r->');
                temp = false;
            }
        }
        if (element == 'p' || element == 'c') {
            if (getFloat(getValue(element)) < 0.0 || getFloat(getValue(element)) > 1.0) {
                output(err, 'err-<0&>1');
                temp = false;
            }
        }
        return temp;
    }
    return true;
}

function check(values) {
    get('err').style.display = 'none';
    get('err').innerHTML = '';
    get('def').innerHTML = get('out').innerHTML = '...';

    return checkInput(values, 'a', function(type) {
        if (type == 'err-empty') {
            return getLang().startsWith('de') ? 'a muss definiert sein' : 'a must be defined';
        } else if (type == 'err-<0') {
            return getLang().startsWith('de') ? 'a muss ein größerer Wert als 0 sein' : 'a must be greater than 0';
        }
    }) && checkInput(values, 'b', function(type) {
        if (type == 'err-empty') {
            return getLang().startsWith('de') ? 'b muss definiert sein' : 'b must be defined';
        } else if (type == 'err-<0') {
            return getLang().startsWith('de') ? 'b muss ein größerer Wert als 0 sein' : 'b must be greater than 0';
        }
    }) && checkInput(values, 'r', function(type) {
        if (type == 'err-empty') {
            return getLang().startsWith('de') ? 'r muss definiert sein' : 'r must be defined';
        } else if (type == 'err-<0') {
            return getLang().startsWith('de') ? 'r muss ein größerer Wert als 0 sein' : 'r must be greater than 0';
        }
    }) && checkInput(values, 'n', function(type) {
        if (type == 'err-empty') {
            return getLang().startsWith('de') ? 'n muss definiert sein' : 'n must be defined';
        } else if (type == 'err-<1') {
            return getLang().startsWith('de') ? 'n muss ein größerer Wert als 1 sein' : 'n must be greater than 1';
        } else if (type == 'err-n<r') {
            return getLang().startsWith('de') ? 'n muss größer oder gleich r sein' : 'n must be equal or greater than r';
        } else if (type == 'err-n=r->') {
            return getLang().startsWith('de') ? 'n muss größer als r sein' : 'n must be greater than r';
        }
    }) && checkInput(values, 'p', function(type) {
        if (type == 'err-empty') {
            return getLang().startsWith('de') ? 'p muss definiert sein' : 'p must be defined';
        } else if (type == 'err-<0&>1') {
            return getLang().startsWith('de') ? 'p muss ein Wert zwischen 0.0 und 1.0 sein' : 'p must be between 0.0 and 1.0';
        }
    });
}

function shareAction() {
    navigator.share({
        title: document.title,
        text: 'http://bernoullimath.github.io?data=' + ''
    }).then(() => console.log('Successful share')).catch(error => console.log('Error sharing:', error));
}

function getTransformations(values) {
    switch(values.op) {
        case 'equal_to': return 'P(X = ' + values.r + ') = ';
        case 'not_equal_to': return 'P(X &ne; ' + values.r + ') = 1 - P(X = ' + values.r + ') = ';
        case 'less_than': return 'P(X < ' + values.r + ') = P(X &le; ' + values.r +  ' - 1) = ';
        case 'greater_than': return 'P(X > ' + values.r + ') = 1 - P(X &le; ' + values.r + ') = ';
        case 'less_than_or_equal_to': return 'P(X &le; ' + values.r + ') = ';
        case 'greater_than_or_equal_to': return 'P(X &ge; ' + values.r + ') = 1 - P(X &le; ' + values.r + ' - 1) = ';
        case 'a_less_than_X_less_than_b': return 'P(' + values.a + ' < X < ' + values.b + ') = P(X &le; ' + values.b + ' - 1) - P(X &le; ' + values.a + ') = ';
        case 'a_less_than_or_equal_to_X_less_than_or_equal_to_b': return 'P(' + values.a + ' &le; X &le; ' + values.b + ') = P(X &le; ' + values.b + ') - P(X &le; ' + values.a + ' - 1) = ';
        case 'X_less_than_a_or_X_greater_than_b': return 'P(X < ' + values.a + (getLang().startsWith('de') ? ' oder X > ' : ' or X > ') + values.b + ') = P(X &le; ' + values.a + ' - 1) + 1 - P(X &le; ' + values.b + ') = ';
        case 'X_less_than_or_equal_to_a_or_X_greater_than_or_equal_to_b': return 'P(X &le; ' + values.a + (getLang().startsWith('de') ? ' oder X &ge; ' : ' or X &ge; ') + values.b + ') = P(X &le; ' + values.a + ') + 1 - P(X &le; ' + values.b + ' - 1) = ';
    }
}

function run() {
    var values = getValues();

    if (isSpecialCase(values)) {
        get('a').style.display = get('b').style.display = 'block';
        get('r').style.display = 'none';
    } else {
        get('a').style.display = get('b').style.display = get('c').style.display = 'none';
        get('r').style.display = get('n').style.display = get('out').style.display = 'block';
    }

    if(check(values)) {
        var res = calc(values);

        get('given').innerHTML = getLang().startsWith('de') ? 'Gegeben:' : 'Given:';
        get('calculation').innerHTML = getLang().startsWith('de') ? 'Berechnung:' : 'Calculation:';

        get('def').innerHTML = `${isSpecialCase(values) ? `a = ${values.a}<br>b = ${values.b}` : `r = ${values.r}`}<br>n = ${values.n}<br>p = ${values.p}<br>q = 1 - p = ${values.q}`;
        get('out').innerHTML = '&mu; = n * p = ' + (values.n * values.p).toPrecision(14) +'<br>&sigma; = ' + Math.sqrt(values.n * values.p * (1 - values.p)).toPrecision(14) + '<br><br>' + getTransformations(values) + (res.toString().length == 18 ? res.toPrecision(14) : res) + ' &asymp; ' + res.toPrecision(4) + ' = ' + res.toPrecision(4).toString().substr(2, 2) + ',' + res.toPrecision(4).toString().substr(4, 2) + '%';
    }
}

function init() {
    var name = 'data';
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    if(results !== null) {
        var data = decodeURIComponent(results[1].replace(/\+/g, ' '));
        var values = atob(data).split('|');
        if(values.length >= 4) {
            get('op').value = get('op').children.item(values[0]).value;
            get('n').value = values[1];
            get('p').value = values[2];
            if(values.length == 4) {
                get('r').value = values[3];
            } else if(values.length == 5) {
                get('a').value = values[3];
                get('b').value = values[4];
            }
            run();
        }
    }
}

get('toolbar').style.display = 'block';
get('toolbar_share').style.display = navigator.share ? 'block' : 'none';
get('given').innerHTML = getLang().startsWith('de') ? 'Gegeben:' : 'Given:';
get('calculation').innerHTML = getLang().startsWith('de') ? 'Berechnung:' : 'Calculation:';
init();